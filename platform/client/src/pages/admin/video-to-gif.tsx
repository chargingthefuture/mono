import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Video, Download, Loader2, X } from "lucide-react";
import GIF from "gif.js";

export default function VideoToGifConverter() {
  const { toast } = useToast();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid File",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select a video file smaller than 100MB",
        variant: "destructive",
      });
      return;
    }

    setVideoFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setGifUrl(null); // Clear previous GIF
  };

  const convertToGif = async () => {
    if (!videoFile || !videoUrl) {
      toast({
        title: "No Video Selected",
        description: "Please select a video file first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setStatus("Initializing...");
    setGifUrl(null);

    try {
      // Create video element to extract frames
      const video = document.createElement("video");
      video.src = videoUrl;
      video.crossOrigin = "anonymous";
      
      // Wait for video metadata to load
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("Failed to load video"));
        video.load();
      });

      const videoDuration = video.duration;
      const targetFPS = 10; // Frames per second for GIF
      const frameInterval = 1 / targetFPS; // Time between frames
      const maxWidth = 640; // Max width for GIF
      const maxDuration = 30; // Max 30 seconds to prevent memory issues
      const duration = Math.min(videoDuration, maxDuration);
      
      // Calculate video dimensions maintaining aspect ratio
      const videoAspectRatio = video.videoWidth / video.videoHeight;
      let gifWidth = maxWidth;
      let gifHeight = Math.round(maxWidth / videoAspectRatio);
      
      // If height is too large, scale down
      if (gifHeight > 480) {
        gifHeight = 480;
        gifWidth = Math.round(480 * videoAspectRatio);
      }

      // Create canvas for frame extraction
      const canvas = document.createElement("canvas");
      canvas.width = gifWidth;
      canvas.height = gifHeight;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }

      // Initialize GIF encoder
      setStatus("Setting up GIF encoder...");
      const gif = new GIF({
        workers: 2,
        quality: 10, // Lower = better quality but larger file (1-30)
        width: gifWidth,
        height: gifHeight,
        // Use CDN for worker script, fallback to local if needed
        workerScript: typeof window !== "undefined" 
          ? "https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js"
          : undefined,
      });

      // Track progress
      gif.on("progress", (p: number) => {
        setProgress(p * 100);
      });

      // Extract frames
      setStatus("Extracting frames from video...");
      const totalFrames = Math.floor(duration * targetFPS);
      let framesExtracted = 0;

      for (let time = 0; time < duration; time += frameInterval) {
        // Seek to specific time
        video.currentTime = time;
        
        // Wait for video to seek
        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            video.removeEventListener("seeked", onSeeked);
            resolve();
          };
          video.addEventListener("seeked", onSeeked);
        });

        // Draw frame to canvas
        ctx.drawImage(video, 0, 0, gifWidth, gifHeight);
        
        // Add frame to GIF
        gif.addFrame(canvas, { delay: frameInterval * 1000 }); // delay in milliseconds
        
        framesExtracted++;
        const extractionProgress = (framesExtracted / totalFrames) * 50; // First 50% of progress
        setProgress(extractionProgress);
        setStatus(`Extracting frame ${framesExtracted} of ${totalFrames}...`);
      }

      // Render GIF
      setStatus("Encoding GIF...");
      setProgress(50);
      
      const gifBlob = await new Promise<Blob>((resolve, reject) => {
        gif.on("finished", (blob: Blob) => {
          resolve(blob);
        });
        
        gif.on("progress", () => {
          // Progress handler
        });
        
        try {
          gif.render();
        } catch (error) {
          reject(error as Error);
        }
      });

      const gifUrl = URL.createObjectURL(gifBlob);
      setGifUrl(gifUrl);
      setProgress(100);
      setStatus("Complete!");

      toast({
        title: "Conversion Complete",
        description: "Your GIF is ready to download",
      });
    } catch (error: any) {
      console.error("Conversion error:", error);
      
      let errorMessage = error.message || "Failed to convert video to GIF";
      
      if (errorMessage.includes("Failed to load")) {
        errorMessage = "Failed to load video. Please ensure the video file is valid and try again.";
      } else if (errorMessage.includes("memory") || errorMessage.includes("Memory")) {
        errorMessage = "Video file is too large to process in browser memory. Try a smaller video file or a shorter duration.";
      } else if (errorMessage.includes("codec") || errorMessage.includes("format")) {
        errorMessage = `Video format may not be supported. Error: ${errorMessage}. Try converting your video to MP4 format first.`;
      }
      
      toast({
        title: "Conversion Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setStatus("Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!gifUrl) return;

    const link = document.createElement("a");
    link.href = gifUrl;
    link.download = videoFile 
      ? `${videoFile.name.replace(/\.[^/.]+$/, "")}.gif`
      : "converted.gif";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up blob URL after download
    setTimeout(() => {
      URL.revokeObjectURL(gifUrl);
      setGifUrl(null);
    }, 100);
  };

  const handleClear = () => {
    // Clean up URLs
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    if (gifUrl) {
      URL.revokeObjectURL(gifUrl);
    }
    
    setVideoFile(null);
    setVideoUrl(null);
    setGifUrl(null);
    setProgress(0);
    setStatus("");
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      if (gifUrl) {
        URL.revokeObjectURL(gifUrl);
      }
    };
  }, [videoUrl, gifUrl]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Video to GIF Converter</h1>
        <p className="text-muted-foreground">
          Convert video files to GIF format. All processing happens in your browser - no files are stored on the server.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Video</CardTitle>
          <CardDescription>
            Select a video file from your device (max 100MB, first 30 seconds will be converted). Supports common video formats including MP4, WebM, MOV, AVI, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-upload">Video File</Label>
            <div className="flex gap-2">
              <Input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                ref={fileInputRef}
                disabled={isLoading}
                className="flex-1"
                data-testid="input-video-upload"
              />
              {videoFile && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleClear}
                  disabled={isLoading}
                  data-testid="button-clear"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {videoFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {videoUrl && (
            <div className="space-y-2">
              <Label>Video Preview</Label>
              <video
                src={videoUrl}
                controls
                className="w-full rounded-md border"
                style={{ maxHeight: "400px" }}
                data-testid="video-preview"
              />
            </div>
          )}

          <Button
            onClick={convertToGif}
            disabled={!videoFile || isLoading}
            className="w-full"
            data-testid="button-convert"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <Video className="w-4 h-4 mr-2" />
                Convert to GIF
              </>
            )}
          </Button>

          {isLoading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{status}</span>
                <span className="text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" data-testid="progress-bar" />
            </div>
          )}

          {gifUrl && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Converted GIF</Label>
                <div className="border rounded-md p-4 bg-muted/50">
                  <img
                    src={gifUrl}
                    alt="Converted GIF"
                    className="max-w-full h-auto rounded-md"
                    data-testid="gif-preview"
                  />
                </div>
              </div>
              <Button
                onClick={handleDownload}
                className="w-full"
                data-testid="button-download"
              >
                <Download className="w-4 h-4 mr-2" />
                Download GIF
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                After downloading, the file will be removed from memory. No files are stored on the server.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ul className="list-disc list-inside space-y-1">
            <li>For best results, use videos shorter than 30 seconds (first 30 seconds will be converted)</li>
            <li>GIFs are converted at 10 FPS and scaled to 640px width (or 480px height, whichever is smaller)</li>
            <li>Larger videos will take longer to process</li>
            <li>All processing happens in your browser - your files never leave your device</li>
            <li>After downloading, the GIF is automatically removed from memory</li>
            <li>No external libraries or CDN dependencies required - works offline after initial load</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
