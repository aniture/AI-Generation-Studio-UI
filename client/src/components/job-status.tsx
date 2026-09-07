import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Download, 
  ExternalLink,
  Eye,
  RotateCcw
} from "lucide-react";

interface JobStatusProps {
  jobId: string | null;
  onClose: () => void;
}

export function JobStatus({ jobId, onClose }: JobStatusProps) {
  const [progress, setProgress] = useState(0);

  const { data: job, isLoading, error } = useQuery({
    queryKey: ["/api/jobs", jobId],
    queryFn: async () => {
      if (!jobId) return null;
      const response = await fetch(`/api/jobs/${jobId}`);
      if (!response.ok) throw new Error("Failed to fetch job");
      return response.json();
    },
    enabled: !!jobId,
    refetchInterval: (data) => {
      // Stop polling when job is completed or failed
      return data?.status === "completed" || data?.status === "failed" ? false : 2000;
    }
  });

  // Simulate progress for visual feedback
  useEffect(() => {
    if (!job) return;
    
    if (job.status === "queued") {
      setProgress(10);
    } else if (job.status === "processing") {
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 10, 85));
      }, 1000);
      return () => clearInterval(interval);
    } else if (job.status === "completed") {
      setProgress(100);
    } else if (job.status === "failed") {
      setProgress(0);
    }
  }, [job?.status]);

  if (!jobId) return null;

  if (isLoading) {
    return (
      <Card className="panel">
        <CardContent className="p-6">
          <div className="mono-label text-center">loading job…</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="panel">
        <CardContent className="p-6">
          <div className="text-center text-sm text-[var(--fail)]">Couldn't load this job. It may have expired.</div>
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="mt-4 w-full rounded-[var(--radius)] font-mono text-[10px] uppercase tracking-[0.12em]"
            data-testid="button-close-error"
          >
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!job) return null;

  const getStatusIcon = () => {
    switch (job.status) {
      case "queued":
        return <Clock className="h-4 w-4 text-[var(--warn)]" />;
      case "processing":
        return <RotateCcw className="h-4 w-4 animate-spin text-[var(--flux)]" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-[var(--mesh)]" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-[var(--fail)]" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
      case "queued":
        return "border-[var(--warn)]/40 text-[var(--warn)]";
      case "processing":
        return "border-[var(--flux)]/40 text-[var(--flux)]";
      case "completed":
        return "border-[var(--mesh)]/40 text-[var(--mesh)]";
      case "failed":
        return "border-[var(--fail)]/40 text-[var(--fail)]";
      default:
        return "border-border text-muted-foreground";
    }
  };

  const renderAssetPreview = () => {
    if (!job.assetUrls || !Array.isArray(job.assetUrls) || job.assetUrls.length === 0) {
      return null;
    }

    const firstAsset = job.assetUrls[0];

    // Handle different asset types based on tool
    if (job.tool === "text2image") {
      return (
        <div className="mt-4">
          <img 
            src={firstAsset} 
            alt="Generated image" 
            className="panel-inset h-48 w-full object-contain"
            data-testid="generated-image"
          />
        </div>
      );
    }

    if (job.tool === "text2mesh") {
      return (
        <div className="panel-inset mt-4 p-4">
          <div className="mono-label">mesh ready</div>
          <div className="mt-1.5 text-sm text-muted-foreground">
            Open it in the viewer, or download the .glb.
          </div>
        </div>
      );
    }

    if (job.tool === "texturing") {
      return (
        <div className="mt-4">
          <div className="mono-label mb-2">pbr maps</div>
          <div className="grid grid-cols-2 gap-2">
            {job.assetUrls.map((url: string, index: number) => (
              <div key={index} className="text-center">
                <img 
                  src={url} 
                  alt={`Texture map ${index + 1}`} 
                  className="panel-inset h-20 w-full object-cover"
                  data-testid={`texture-map-${index}`}
                />
                <div className="mono-label mt-1 !text-[10px]">
                  {index === 0 ? "albedo" : index === 1 ? "normal" : "metal/rough"}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (job.tool === "img2video") {
      return (
        <div className="mt-4">
          <video 
            src={firstAsset} 
            controls 
            className="panel-inset h-48 w-full"
            data-testid="generated-video"
          >
            Your browser does not support video playback.
          </video>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="panel">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <div className="mono-label">job</div>
              <div className="mt-1 text-base font-bold tracking-tight">
                {job.tool.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())}
              </div>
            </div>
          </div>
          <Badge className={`shrink-0 rounded-[var(--radius)] border bg-transparent font-mono text-[10px] uppercase tracking-[0.12em] ${getStatusColor()}`}>
            {job.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar for active jobs */}
        {(job.status === "queued" || job.status === "processing") && (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="mono-label">progress</span>
              <span className="font-mono text-sm tabular-nums text-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-px" />
          </div>
        )}

        {/* Job details */}
        <div className="space-y-2">
          <div className="mono-label">prompt</div>
          <div className="panel-inset p-3 font-mono text-xs leading-relaxed text-foreground">
            {job.prompt}
          </div>
        </div>

        {/* Credits used */}
        <div className="flex items-baseline justify-between border-t border-border pt-3">
          <span className="mono-label">credits used</span>
          <span className="font-mono text-sm tabular-nums text-foreground">{job.creditsUsed}</span>
        </div>

        {/* Error message for failed jobs */}
        {job.status === "failed" && job.meta?.error && (
          <div className="rounded-[var(--radius)] border border-[var(--fail)]/40 p-3">
            <div className="mono-label !text-[var(--fail)]">failed</div>
            <div className="mt-1.5 text-sm text-foreground">{job.meta.error}</div>
          </div>
        )}

        {/* Asset preview for completed jobs */}
        {job.status === "completed" && renderAssetPreview()}

        {/* Action buttons */}
        <div className="flex gap-2 pt-4">
          {job.status === "completed" && job.assetUrls && job.assetUrls.length > 0 && (
            <>
              {job.tool === "text2mesh" ? (
                <Button
                  variant="outline"
                  className="flex-1 rounded-[var(--radius)] font-mono text-[10px] uppercase tracking-[0.12em]"
                  data-testid="button-view-3d"
                >
                  <Eye className="mr-2 h-3.5 w-3.5" />
                  Open viewer
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="flex-1 rounded-[var(--radius)] font-mono text-[10px] uppercase tracking-[0.12em]"
                  onClick={() => window.open(job.assetUrls[0], '_blank')}
                  data-testid="button-view-asset"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1 rounded-[var(--radius)] font-mono text-[10px] uppercase tracking-[0.12em]"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = `/api/assets/${job.id}/download`;
                  link.download = `generated-${job.tool}-${job.id}`;
                  link.click();
                }}
                data-testid="button-download"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </>
          )}
          <Button 
            onClick={onClose} 
            variant="outline"
            className="rounded-[var(--radius)] font-mono text-[10px] uppercase tracking-[0.12em]"
            data-testid="button-close"
          >
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}