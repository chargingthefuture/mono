import fs from "fs";
import path from "path";
import zlib from "zlib";
import { db } from "../server/db";
import { blogPosts } from "../shared/schema";
import { sql } from "drizzle-orm";

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

/**
 * Very small streaming parser for Discourse pg_dump .sql.gz
 * It only understands COPY sections for public.topics and public.posts
 * and ignores the rest. This is sufficient for importing your content.
 */
async function importDiscourseDump(dumpPath: string) {
  console.log(`📦 Importing Discourse dump from: ${dumpPath}`);

  if (!fs.existsSync(dumpPath)) {
    throw new Error(`Discourse dump not found at ${dumpPath}`);
  }

  const gunzip = zlib.createGunzip();
  const stream = fs.createReadStream(dumpPath).pipe(gunzip);

  const topics = new Map<number, TopicRow>();
  const firstPosts = new Map<number, PostRow>(); // topic_id -> first post (post_number = 1)

  let buffer = "";
  let mode: "none" | "topics" | "posts" = "none";
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
      if (postNumber !== 1) return; // only need first post of each topic
      const post: PostRow = {
        id: toInt(row.id),
        topic_id: toInt(row.topic_id),
        post_number: postNumber,
        raw: row.raw,
        cooked: row.cooked,
        created_at: row.created_at,
      };
      if (!firstPosts.has(post.topic_id)) {
        firstPosts.set(post.topic_id, post);
      }
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

  console.log(`Parsed ${topics.size} topics and ${firstPosts.size} topic bodies`);

  const postsToInsert = [];
  for (const [topicId, topic] of topics.entries()) {
    const firstPost = firstPosts.get(topicId);
    if (!firstPost) continue;

    const slug = topic.slug || slugify(topic.title);
    const publishedAt = topic.created_at || firstPost.created_at;

    postsToInsert.push({
      title: topic.title,
      slug,
      excerpt: topic.excerpt,
      contentMd: firstPost.raw,
      contentHtml: firstPost.cooked,
      authorName: "Farah (imported)",
      source: "discourse",
      discourseTopicId: topic.id,
      discoursePostId: firstPost.id,
      tags: null,
      category: null,
      isPublished: true,
      publishedAt: new Date(publishedAt),
    });
  }

  console.log(`Preparing to insert ${postsToInsert.length} blog posts into blog_posts...`);

  if (postsToInsert.length === 0) {
    console.log("No posts found to import. Exiting.");
    return;
  }

  await db.transaction(async (tx) => {
    // Optional: clear existing imported Discourse posts
    await tx.execute(
      sql`DELETE FROM ${blogPosts} WHERE ${blogPosts.source} = 'discourse'`
    );

    for (const chunk of chunkArray(postsToInsert, 100)) {
      await tx.insert(blogPosts).values(chunk as any);
    }
  });

  console.log("✅ Discourse import complete.");
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

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 300);
}

function toInt(value: string | undefined): number {
  return value ? parseInt(value, 10) : 0;
}

function nullable(value: string | undefined): string | null {
  return value && value.length > 0 ? value : null;
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function main() {
  const dumpArg = process.argv[2];
  const dumpPath =
    dumpArg ||
    path.resolve(
      process.cwd(),
      "../charging-the-future-2025-12-18-151148-v20251216094828.sql.gz",
    );

  try {
    await importDiscourseDump(dumpPath);
    process.exit(0);
  } catch (err: any) {
    console.error("Failed to import Discourse dump:", err);
    process.exit(1);
  }
}

if (require.main === module) {
  // eslint-disable-next-line no-void
  void main();
}



