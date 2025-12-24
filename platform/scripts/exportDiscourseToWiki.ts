#!/usr/bin/env node

/**
 * Export Discourse blog content to markdown files for GitHub wiki
 * 
 * This script reads a Discourse SQL dump (either .sql.gz or .tar.gz) and exports all topics/posts
 * as markdown files in the wiki folder. Images are downloaded and saved
 * locally in an images/ subfolder.
 * 
 * Usage: tsx scripts/exportDiscourseToWiki.ts [path-to-dump.sql.gz|.tar.gz] [wiki-folder] [dump-directory] [discourse-base-url]
 * 
 * Examples:
 *   tsx scripts/exportDiscourseToWiki.ts ../discourse-dump.sql.gz ../wiki
 *   tsx scripts/exportDiscourseToWiki.ts ../dump.tar.gz ../wiki ../discourse-export
 *   tsx scripts/exportDiscourseToWiki.ts ../dump.tar.gz ../wiki ../discourse-export https://your-discourse-site.com
 * 
 * Arguments:
 *   path-to-dump - Path to the compressed SQL dump file (.sql.gz or .tar.gz)
 *   wiki-folder - Output folder for markdown files (default: ../wiki)
 *   dump-directory - Directory containing image files from Discourse export (default: same as dump file directory)
 *   discourse-base-url - Base URL for downloading external images (optional)
 * 
 * Environment variable:
 *   DISCOURSE_BASE_URL - Base URL of your Discourse instance (for relative image URLs)
 */

import fs from "fs";
import path from "path";
import zlib from "zlib";
import { URL } from "url";
import { execSync } from "child_process";
import os from "os";

type TopicRow = {
  id: number;
  title: string;
  slug: string | null;
  created_at: string;
  updated_at: string;
  excerpt: string | null;
  category_id: number | null;
};

type PostRow = {
  id: number;
  topic_id: number;
  post_number: number;
  raw: string;
  cooked: string;
  created_at: string;
};

type UploadRow = {
  id: number;
  user_id: number;
  original_filename: string;
  filesize: number;
  width: number | null;
  height: number | null;
  url: string;
  created_at: string;
  extension: string | null;
};

type ExportedTopic = {
  topic: TopicRow;
  firstPost: PostRow;
  replies: PostRow[];
};

/**
 * Extract tar.gz archive to a temporary directory and return the path
 */
async function extractTarGz(tarGzPath: string): Promise<string> {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "discourse-export-"));
  console.log(`📦 Extracting tar.gz archive to: ${tempDir}`);
  
  try {
    // Use system tar command to extract
    execSync(`tar -xzf "${tarGzPath}" -C "${tempDir}"`, { stdio: "inherit" });
    console.log(`✅ Extracted archive successfully`);
    return tempDir;
  } catch (error: any) {
    // Clean up on error
    fs.rmSync(tempDir, { recursive: true, force: true });
    throw new Error(`Failed to extract tar.gz archive: ${error.message}`);
  }
}

/**
 * Find SQL dump file(s) in a directory (recursively)
 * Looks for both .sql and .sql.gz files
 */
function findSqlDumpFiles(directory: string): string[] {
  const sqlFiles: string[] = [];
  
  function searchDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        searchDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith(".sql") || entry.name.endsWith(".sql.gz"))) {
        sqlFiles.push(fullPath);
      }
    }
  }
  
  searchDir(directory);
  return sqlFiles;
}

/**
 * Parse Discourse SQL dump and extract topics, posts, and uploads
 */
async function parseDiscourseDump(dumpPath: string): Promise<{
  topics: ExportedTopic[];
  uploads: Map<number, UploadRow>;
  tempDir?: string; // Return temp directory for cleanup if tar.gz was extracted
}> {
  console.log(`📦 Parsing Discourse dump from: ${dumpPath}`);

  if (!fs.existsSync(dumpPath)) {
    throw new Error(`Discourse dump not found at ${dumpPath}`);
  }

  let sqlFilePath: string;
  let tempDir: string | undefined;
  let isTarGz = false;

  // Check if it's a tar.gz file
  if (dumpPath.endsWith(".tar.gz")) {
    isTarGz = true;
    tempDir = await extractTarGz(dumpPath);
    const sqlFiles = findSqlDumpFiles(tempDir);
    
    if (sqlFiles.length === 0) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      throw new Error(`No SQL dump files found in tar.gz archive`);
    }
    
    if (sqlFiles.length > 1) {
      console.log(`⚠️  Found ${sqlFiles.length} SQL files, using the first one: ${sqlFiles[0]}`);
    }
    
    sqlFilePath = sqlFiles[0];
    console.log(`📄 Using SQL file: ${sqlFilePath}`);
  } else if (dumpPath.endsWith(".sql.gz")) {
    // For .sql.gz, we'll stream it directly
    sqlFilePath = dumpPath;
  } else {
    throw new Error(`Unsupported file format. Expected .sql.gz or .tar.gz, got: ${dumpPath}`);
  }

  // For .sql.gz, stream directly; for extracted .sql, read the file
  let stream: NodeJS.ReadableStream;
  
  if (isTarGz) {
    // Read the extracted SQL file (may or may not be gzipped)
    if (sqlFilePath.endsWith(".gz")) {
      const gunzip = zlib.createGunzip();
      stream = fs.createReadStream(sqlFilePath).pipe(gunzip);
    } else {
      stream = fs.createReadStream(sqlFilePath);
    }
  } else {
    // Original .sql.gz streaming
    const gunzip = zlib.createGunzip();
    stream = fs.createReadStream(sqlFilePath).pipe(gunzip);
  }

  const topics = new Map<number, TopicRow>();
  const firstPosts = new Map<number, PostRow>();
  const replyPosts = new Map<number, PostRow[]>();
  const uploads = new Map<number, UploadRow>();

  let buffer = "";
  let mode: "none" | "topics" | "posts" | "uploads" = "none";
  let columns: string[] = [];

  const flushLine = (line: string) => {
    if (line.startsWith("COPY public.topics ")) {
      mode = "topics";
      columns = parseCopyColumns(line);
      return;
    }
    if (line.startsWith("COPY public.posts ")) {
      mode = "posts";
      columns = parseCopyColumns(line);
      return;
    }
    if (line.startsWith("COPY public.uploads ")) {
      mode = "uploads";
      columns = parseCopyColumns(line);
      return;
    }
    if (line === "\\.") {
      mode = "none";
      columns = [];
      return;
    }

    if (mode === "topics" && line && !line.startsWith("--")) {
      const row = parseCopyRow(columns, line);
      const topic: TopicRow = {
        id: toInt(row.id),
        title: row.title,
        slug: nullable(row.slug),
        created_at: row.created_at,
        updated_at: row.updated_at,
        excerpt: nullable(row.excerpt),
        category_id: row.category_id ? toInt(row.category_id) : null,
      };
      topics.set(topic.id, topic);
    } else if (mode === "posts" && line && !line.startsWith("--")) {
      const row = parseCopyRow(columns, line);
      const postNumber = toInt(row.post_number);
      const post: PostRow = {
        id: toInt(row.id),
        topic_id: toInt(row.topic_id),
        post_number: postNumber,
        raw: row.raw,
        cooked: row.cooked,
        created_at: row.created_at,
      };

      if (postNumber === 1) {
        if (!firstPosts.has(post.topic_id)) {
          firstPosts.set(post.topic_id, post);
        }
      } else {
        const existing = replyPosts.get(post.topic_id) ?? [];
        existing.push(post);
        replyPosts.set(post.topic_id, existing);
      }
    } else if (mode === "uploads" && line && !line.startsWith("--")) {
      const row = parseCopyRow(columns, line);
      const upload: UploadRow = {
        id: toInt(row.id),
        user_id: toInt(row.user_id),
        original_filename: row.original_filename || "",
        filesize: toInt(row.filesize),
        width: row.width ? toInt(row.width) : null,
        height: row.height ? toInt(row.height) : null,
        url: row.url || "",
        created_at: row.created_at,
        extension: nullable(row.extension),
      };
      uploads.set(upload.id, upload);
    }
  };

  await new Promise<void>((resolve, reject) => {
    stream.on("data", (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      let idx: number;
      while ((idx = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, idx).trimEnd();
        buffer = buffer.slice(idx + 1);
        flushLine(line);
      }
    });
    stream.on("end", () => {
      if (buffer.length > 0) {
        flushLine(buffer.trimEnd());
      }
      resolve();
    });
    stream.on("error", (err) => reject(err));
  });

  console.log(
    `Parsed ${topics.size} topics, ${firstPosts.size} first posts, ${Array.from(
      replyPosts.values(),
    ).reduce((sum, arr) => sum + arr.length, 0)} reply posts, and ${uploads.size} uploads`,
  );

  // Combine topics with their posts
  const exportedTopics: ExportedTopic[] = [];
  for (const [topicId, topic] of topics.entries()) {
    const firstPost = firstPosts.get(topicId);
    if (!firstPost) {
      console.warn(`⚠️  Topic ${topicId} (${topic.title}) has no first post, skipping`);
      continue;
    }

    const replies = replyPosts.get(topicId) ?? [];
    // Sort replies by post_number to maintain order
    replies.sort((a, b) => a.post_number - b.post_number);

    exportedTopics.push({
      topic,
      firstPost,
      replies,
    });
  }

  // Sort by creation date (newest first)
  exportedTopics.sort((a, b) => {
    const dateA = new Date(a.topic.created_at).getTime();
    const dateB = new Date(b.topic.created_at).getTime();
    return dateB - dateA;
  });

  return { topics: exportedTopics, uploads, tempDir };
}

/**
 * Extract upload IDs from Discourse content
 * Discourse uses upload://{id} syntax to reference uploads
 */
function extractUploadIds(content: string): number[] {
  const uploadIds = new Set<number>();

  // Discourse uses upload://{id} syntax
  const uploadMatches = content.match(/upload:\/\/\d+/g);
  if (uploadMatches) {
    uploadMatches.forEach((match) => {
      const idMatch = match.match(/upload:\/\/(\d+)/);
      if (idMatch && idMatch[1]) {
        uploadIds.add(parseInt(idMatch[1], 10));
      }
    });
  }

  // Also check for upload URLs in HTML/img tags that might reference uploads
  const htmlUploadMatches = content.match(/\/uploads\/[^"'\s)]+/g);
  if (htmlUploadMatches) {
    htmlUploadMatches.forEach((match) => {
      // Try to extract upload ID from path like /uploads/default/original/1X/abc123.jpg
      // or /original/1X/abc123.jpg where abc123 might be the upload ID hash
      // We'll match these by URL in the uploads table instead
    });
  }

  return Array.from(uploadIds);
}

/**
 * Extract image URLs from content (for fallback if upload IDs not found)
 */
function extractImageUrls(content: string): string[] {
  const urls = new Set<string>();

  // Extract from markdown image syntax: ![alt](url)
  const markdownImages = content.match(/!\[[^\]]*\]\(([^)]+)\)/g);
  if (markdownImages) {
    markdownImages.forEach((match) => {
      const urlMatch = match.match(/\(([^)]+)\)/);
      if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith("upload://")) {
        urls.add(urlMatch[1].trim());
      }
    });
  }

  // Extract from HTML img tags: <img src="url">
  const htmlImages = content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
  if (htmlImages) {
    htmlImages.forEach((match) => {
      const srcMatch = match.match(/src=["']([^"']+)["']/i);
      if (srcMatch && srcMatch[1] && !srcMatch[1].startsWith("upload://")) {
        urls.add(srcMatch[1].trim());
      }
    });
  }

  return Array.from(urls);
}

/**
 * Download an image from URL and save it locally
 */
async function downloadImage(
  imageUrl: string,
  imagesFolder: string,
  topicSlug: string,
  discourseBaseUrl?: string,
): Promise<string | null> {
  try {
    // Skip data URLs
    if (imageUrl.startsWith("data:")) {
      return null;
    }

    // Handle relative URLs - convert to absolute if base URL provided
    let absoluteUrl = imageUrl;
    if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
      if (discourseBaseUrl) {
        // Remove leading slash if present
        const cleanUrl = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
        absoluteUrl = `${discourseBaseUrl.replace(/\/$/, "")}/${cleanUrl}`;
      } else {
        console.warn(`⚠️  Skipping relative URL (no base URL provided): ${imageUrl}`);
        return null;
      }
    }

    // Parse URL to get filename
    let urlObj: URL;
    try {
      urlObj = new URL(absoluteUrl);
    } catch (error) {
      console.warn(`⚠️  Invalid URL: ${absoluteUrl}`);
      return null;
    }

    const pathname = urlObj.pathname;
    let filename = path.basename(pathname) || "image";
    
    // If no extension, try to get it from content-type or use .jpg as default
    if (!filename.includes(".")) {
      filename = `${filename}.jpg`;
    }
    
    // Clean filename and add topic prefix to avoid conflicts
    const safeFilename = `${topicSlug}-${filename}`
      .replace(/[^a-z0-9.-]/gi, "-")
      .toLowerCase();
    
    const localPath = path.join(imagesFolder, safeFilename);

    // Skip if already downloaded
    if (fs.existsSync(localPath)) {
      return `images/${safeFilename}`;
    }

    // Download the image
    const response = await fetch(absoluteUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Discourse-Wiki-Exporter/1.0)",
      },
    });
    
    if (!response.ok) {
      console.warn(`⚠️  Failed to download image: ${absoluteUrl} (${response.status})`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    fs.writeFileSync(localPath, buffer);
    
    return `images/${safeFilename}`;
  } catch (error: any) {
    console.warn(`⚠️  Error downloading image ${imageUrl}: ${error.message}`);
    return null;
  }
}

/**
 * Extract image file from Discourse dump directory structure
 * Discourse typically stores images in: /uploads/{site}/original/{hash}/{filename}
 */
function findImageInDump(
  upload: UploadRow,
  dumpDirectory: string,
): string | null {
  // Try common Discourse upload paths
  const possiblePaths = [
    // Standard Discourse structure
    path.join(dumpDirectory, "uploads", "default", "original", upload.url),
    path.join(dumpDirectory, "uploads", upload.url),
    // If url is already a full path
    upload.url.startsWith("/") ? upload.url.slice(1) : upload.url,
    // Try with original filename
    upload.original_filename
      ? path.join(dumpDirectory, "uploads", "default", "original", upload.original_filename)
      : null,
  ].filter(Boolean) as string[];

  for (const imagePath of possiblePaths) {
    const fullPath = path.isAbsolute(imagePath) ? imagePath : path.join(dumpDirectory, imagePath);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  return null;
}

/**
 * Copy image from dump to wiki images folder
 */
function copyImageFromDump(
  sourcePath: string,
  imagesFolder: string,
  topicSlug: string,
  upload: UploadRow,
): string {
  // Determine filename
  const originalFilename = upload.original_filename || path.basename(sourcePath) || "image";
  const extension = upload.extension || path.extname(originalFilename) || ".jpg";
  const baseName = path.basename(originalFilename, extension) || "image";
  
  const safeFilename = `${topicSlug}-${upload.id}-${baseName}${extension}`
    .replace(/[^a-z0-9.-]/gi, "-")
    .toLowerCase();
  
  const destPath = path.join(imagesFolder, safeFilename);

  // Skip if already copied
  if (fs.existsSync(destPath)) {
    return `images/${safeFilename}`;
  }

  // Copy the file
  fs.copyFileSync(sourcePath, destPath);
  return `images/${safeFilename}`;
}

/**
 * Replace upload references and image URLs in content with local paths
 */
async function replaceImageUrls(
  content: string,
  imagesFolder: string,
  topicSlug: string,
  uploads: Map<number, UploadRow>,
  dumpDirectory: string,
  discourseBaseUrl?: string,
): Promise<string> {
  let updatedContent = content;

  // First, handle Discourse upload:// references
  const uploadIds = extractUploadIds(content);
  for (const uploadId of uploadIds) {
    const upload = uploads.get(uploadId);
    if (upload) {
      // Try to find the image file in the dump directory
      const imagePath = findImageInDump(upload, dumpDirectory);
      if (imagePath) {
        const localPath = copyImageFromDump(imagePath, imagesFolder, topicSlug, upload);
        
        // Replace upload:// references
        updatedContent = updatedContent.replace(
          new RegExp(`upload://${uploadId}`, "g"),
          localPath,
        );
        
        // Also replace any URLs that match this upload
        if (upload.url) {
          updatedContent = updatedContent.replace(
            new RegExp(escapeRegex(upload.url), "g"),
            localPath,
          );
        }
      } else {
        console.warn(`⚠️  Image file not found for upload ${uploadId} (${upload.url})`);
      }
    }
  }

  // Then handle regular image URLs (fallback for external images)
  const imageUrls = extractImageUrls(updatedContent);
  for (const imageUrl of imageUrls) {
    // Skip if already replaced or is an upload reference
    if (imageUrl.startsWith("upload://") || imageUrl.startsWith("images/")) {
      continue;
    }

    const localPath = await downloadImage(imageUrl, imagesFolder, topicSlug, discourseBaseUrl);
    
    if (localPath) {
      // Replace in markdown syntax: ![alt](url) -> ![alt](localPath)
      updatedContent = updatedContent.replace(
        new RegExp(`!\\[[^\\]]*\\]\\(${escapeRegex(imageUrl)}\\)`, "g"),
        (match) => {
          const altMatch = match.match(/!\[([^\]]*)\]/);
          const alt = altMatch ? altMatch[1] : "";
          return `![${alt}](${localPath})`;
        },
      );

      // Replace in HTML img tags: <img src="url"> -> <img src="localPath">
      updatedContent = updatedContent.replace(
        new RegExp(`<img([^>]+)src=["']${escapeRegex(imageUrl)}["']([^>]*)>`, "gi"),
        `<img$1src="${localPath}"$2>`,
      );

      // Replace in Discourse-specific syntax
      updatedContent = updatedContent.replace(
        new RegExp(`!\\[[^\\|]+\\|[^\\]]+\\]\\(${escapeRegex(imageUrl)}\\)`, "g"),
        (match) => {
          const parts = match.match(/!\[([^\|]+)\|([^\]]+)\]/);
          if (parts) {
            return `![${parts[1]}](${localPath})`;
          }
          return `![](${localPath})`;
        },
      );
    }
  }

  return updatedContent;
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Convert Discourse raw markdown to clean markdown
 * Discourse uses a slightly different markdown format, so we clean it up
 */
function cleanMarkdown(content: string): string {
  // Discourse uses [quote] blocks, convert to markdown blockquotes
  let cleaned = content
    .replace(/\[quote[^\]]*\]/gi, ">")
    .replace(/\[\/quote\]/gi, "")
    // Remove Discourse-specific tags
    .replace(/\[code[^\]]*\]/gi, "```")
    .replace(/\[\/code\]/gi, "```")
    // Clean up multiple blank lines
    .replace(/\n{3,}/g, "\n\n")
    // Trim whitespace
    .trim();

  return cleaned;
}

/**
 * Generate a safe filename from a title
 */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100); // Limit length for filesystem
}

/**
 * Format date for markdown frontmatter
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

/**
 * Generate markdown content for a topic
 */
async function generateMarkdown(
  topicData: ExportedTopic,
  imagesFolder: string,
  uploads: Map<number, UploadRow>,
  dumpDirectory: string,
  discourseBaseUrl?: string,
): Promise<string> {
  const { topic, firstPost, replies } = topicData;
  
  const slug = topic.slug || slugify(topic.title);
  const createdDate = formatDate(topic.created_at);
  const updatedDate = formatDate(topic.updated_at);
  
  let markdown = `# ${topic.title}\n\n`;
  
  // Add frontmatter/metadata as comments (GitHub wiki doesn't support YAML frontmatter)
  markdown += `<!--\n`;
  markdown += `Title: ${topic.title}\n`;
  markdown += `Slug: ${slug}\n`;
  markdown += `Created: ${createdDate}\n`;
  markdown += `Updated: ${updatedDate}\n`;
  if (topic.excerpt) {
    markdown += `Excerpt: ${topic.excerpt}\n`;
  }
  markdown += `-->\n\n`;
  
  // Add excerpt if available
  if (topic.excerpt) {
    markdown += `> ${topic.excerpt}\n\n`;
  }
  
  // Main content - use cooked HTML if available (has better image handling), otherwise raw
  const mainContentSource = firstPost.cooked || firstPost.raw;
  let mainContent = await replaceImageUrls(
    mainContentSource,
    imagesFolder,
    slug,
    uploads,
    dumpDirectory,
    discourseBaseUrl,
  );
  mainContent = cleanMarkdown(mainContent);
  markdown += `${mainContent}\n\n`;
  
  // Add replies/comments if any
  if (replies.length > 0) {
    markdown += `---\n\n`;
    markdown += `## Comments (${replies.length})\n\n`;
    
    for (const reply of replies) {
      const replyDate = formatDate(reply.created_at);
      markdown += `### Comment #${reply.post_number} (${replyDate})\n\n`;
      
      // Process reply content with images
      const replyContentSource = reply.cooked || reply.raw;
      let replyContent = await replaceImageUrls(
        replyContentSource,
        imagesFolder,
        `${slug}-comment-${reply.post_number}`,
        uploads,
        dumpDirectory,
        discourseBaseUrl,
      );
      replyContent = cleanMarkdown(replyContent);
      markdown += `${replyContent}\n\n`;
    }
  }
  
  return markdown;
}

/**
 * Export topics to markdown files
 */
async function exportToMarkdown(
  topics: ExportedTopic[],
  uploads: Map<number, UploadRow>,
  wikiFolder: string,
  dumpDirectory: string,
  discourseBaseUrl?: string,
): Promise<void> {
  console.log(`📝 Exporting ${topics.length} topics to ${wikiFolder}...`);
  if (discourseBaseUrl) {
    console.log(`🌐 Using Discourse base URL: ${discourseBaseUrl}`);
  }
  console.log(`📁 Looking for images in dump directory: ${dumpDirectory}`);

  // Ensure wiki folder exists
  if (!fs.existsSync(wikiFolder)) {
    fs.mkdirSync(wikiFolder, { recursive: true });
    console.log(`Created wiki folder: ${wikiFolder}`);
  }

  // Create images folder
  const imagesFolder = path.join(wikiFolder, "images");
  if (!fs.existsSync(imagesFolder)) {
    fs.mkdirSync(imagesFolder, { recursive: true });
    console.log(`Created images folder: ${imagesFolder}`);
  }

  let exportedCount = 0;
  let skippedCount = 0;
  let imageCount = 0;

  for (const topicData of topics) {
    const { topic } = topicData;
    const slug = topic.slug || slugify(topic.title);
    const filename = `${slug}.md`;
    const filepath = path.join(wikiFolder, filename);

    // Skip if file already exists (to avoid overwriting)
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  Skipping ${filename} (already exists)`);
      skippedCount++;
      continue;
    }

    try {
      console.log(`📄 Processing: ${filename}...`);
      
      // Count images before processing
      const allContent = [
        topicData.firstPost.raw,
        topicData.firstPost.cooked,
        ...topicData.replies.map((r) => r.raw),
        ...topicData.replies.map((r) => r.cooked),
      ].filter(Boolean).join(" ");
      const uploadIds = extractUploadIds(allContent);
      const imageUrls = extractImageUrls(allContent);
      imageCount += uploadIds.length + imageUrls.length;
      
      const markdown = await generateMarkdown(
        topicData,
        imagesFolder,
        uploads,
        dumpDirectory,
        discourseBaseUrl,
      );
      fs.writeFileSync(filepath, markdown, "utf8");
      const imageInfo = uploadIds.length > 0 || imageUrls.length > 0
        ? ` (${uploadIds.length} uploads, ${imageUrls.length} external images)`
        : "";
      console.log(`✅ Exported: ${filename}${imageInfo}`);
      exportedCount++;
    } catch (error: any) {
      console.error(`❌ Failed to export ${filename}: ${error.message}`);
    }
  }

  // Generate a README/index file
  const readmePath = path.join(wikiFolder, "Home.md");
  let readmeContent = `# Blog Archive\n\n`;
  readmeContent += `This wiki contains exported content from Discourse.\n\n`;
  readmeContent += `## Posts (${topics.length} total)\n\n`;
  
  for (const topicData of topics) {
    const { topic } = topicData;
    const slug = topic.slug || slugify(topic.title);
    const createdDate = formatDate(topic.created_at);
    readmeContent += `- [${topic.title}](${slug}) - ${createdDate}\n`;
  }
  
  fs.writeFileSync(readmePath, readmeContent, "utf8");
  console.log(`✅ Created index: Home.md`);

  console.log(`\n📊 Export Summary:`);
  console.log(`   ✅ Exported: ${exportedCount} files`);
  console.log(`   ⏭️  Skipped: ${skippedCount} files (already exist)`);
  console.log(`   📄 Total topics: ${topics.length}`);
  console.log(`   🖼️  Images processed: ${imageCount}`);
  console.log(`   📁 Images folder: ${imagesFolder}`);
}

function parseCopyColumns(headerLine: string): string[] {
  const start = headerLine.indexOf("(");
  const end = headerLine.indexOf(")");
  const inner = headerLine.slice(start + 1, end);
  return inner.split(",").map((c) => c.trim().replace(/"/g, ""));
}

function parseCopyRow(columns: string[], line: string): Record<string, string> {
  const parts = line.split("\t");
  const row: Record<string, string> = {};
  columns.forEach((col, idx) => {
    row[col] = parts[idx] === "\\N" ? "" : parts[idx];
  });
  return row;
}

function toInt(value: string | undefined): number {
  return value ? parseInt(value, 10) : 0;
}

function nullable(value: string | undefined): string | null {
  return value && value.length > 0 ? value : null;
}

async function main() {
  const dumpArg = process.argv[2];
  const wikiArg = process.argv[3];
  const dumpDirArg = process.argv[4]; // Optional: Directory containing image files
  const baseUrlArg = process.argv[5]; // Optional: Discourse base URL for relative image URLs

  const dumpPath = dumpArg
    ? path.resolve(process.cwd(), dumpArg)
    : path.resolve(
        process.cwd(),
        "../charging-the-future-2025-12-18-190057-v20251216094828.tar.gz",
      );

  const wikiFolder = wikiArg
    ? path.resolve(process.cwd(), wikiArg)
    : path.resolve(process.cwd(), "../wiki");

  // Default dump directory is the same directory as the dump file
  // For tar.gz files, we'll use the extracted directory if dumpDirArg is not provided
  let dumpDirectory = dumpDirArg
    ? path.resolve(process.cwd(), dumpDirArg)
    : path.dirname(dumpPath);

  const discourseBaseUrl = baseUrlArg || process.env.DISCOURSE_BASE_URL || undefined;

  let tempDir: string | undefined;

  try {
    const { topics, uploads, tempDir: extractedTempDir } = await parseDiscourseDump(dumpPath);
    tempDir = extractedTempDir;
    
    // If we extracted a tar.gz, update dumpDirectory to point to the extracted directory
    // This allows finding images in the extracted archive
    if (tempDir && !dumpDirArg) {
      dumpDirectory = tempDir;
      console.log(`📁 Using extracted directory for images: ${dumpDirectory}`);
    }
    
    await exportToMarkdown(topics, uploads, wikiFolder, dumpDirectory, discourseBaseUrl);
    console.log("\n✅ Export complete!");
    
    // Clean up temporary directory if we extracted a tar.gz
    if (tempDir) {
      console.log(`🧹 Cleaning up temporary directory: ${tempDir}`);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    
    process.exit(0);
  } catch (err: any) {
    // Clean up temporary directory on error
    if (tempDir) {
      console.log(`🧹 Cleaning up temporary directory: ${tempDir}`);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    console.error("❌ Failed to export Discourse dump:", err);
    process.exit(1);
  }
}

// ESM-compatible entrypoint (works with tsx)
if (import.meta.url === `file://${process.argv[1]}`) {
  // eslint-disable-next-line no-void
  void main();
}

