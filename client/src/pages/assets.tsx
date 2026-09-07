import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Download, Eye, Calendar, Image, Box, PlayCircle } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

interface Asset {
  id: string;
  prompt: string;
  url: string;
  jobType: string;
  userId: string;
  createdAt: string;
}

function getJobTypeIcon(jobType: string) {
  switch (jobType) {
    case "text-to-image":
      return <Image className="w-4 h-4" />;
    case "text-to-3D":
      return <Box className="w-4 h-4" />;
    case "image-to-video":
      return <PlayCircle className="w-4 h-4" />;
    default:
      return <Image className="w-4 h-4" />;
  }
}

function getJobTypeColor(jobType: string) {
  switch (jobType) {
    case "text-to-3D":
      return "border-[var(--flux)]/40 text-[var(--flux)]";
    case "text-to-image":
      return "border-[var(--mesh)]/40 text-[var(--mesh)]";
    case "image-to-video":
      return "border-[var(--warn)]/40 text-[var(--warn)]";
    default:
      return "border-border text-muted-foreground";
  }
}

function AssetThumbnail({ asset }: { asset: Asset }) {
  return (
    <div className="aspect-video overflow-hidden rounded-[var(--radius)] border border-border bg-[var(--ink)]">
      <img
        src={asset.url}
        alt={asset.prompt}
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.parentElement!.innerHTML = `
            <div class="blueprint-grid aspect-video flex items-center justify-center">
              <span style="font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--dim)">
                ${asset.jobType.replace("-", " ")} · preview unavailable
              </span>
            </div>
          `;
        }}
        data-testid={`thumbnail-${asset.id}`}
      />
    </div>
  );
}

export default function Assets() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: assets = [], isLoading, error } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
    refetchInterval: 30000, // Refresh every 30 seconds to pick up new assets
  });

  const filteredAssets = assets.filter(asset =>
    asset.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.jobType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="container py-8">
        <div>
          <div className="mono-label">library</div>
          <h1 className="mt-1.5 text-2xl">Assets</h1>
          <div className="mt-6 rounded-[var(--radius)] border border-[var(--fail)]/40 p-4">
            <div className="mono-label !text-[var(--fail)]">couldn't load</div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              The asset library didn't respond. Reload the page to try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="mono-label">library</div>
            <h1 className="mt-1.5 text-2xl">Assets</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search prompts and types" 
                className="panel-inset pl-9 font-mono text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-assets"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="h-5 bg-muted rounded w-20"></div>
                    <div className="h-4 bg-muted rounded w-16"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-muted rounded flex-1"></div>
                      <div className="h-8 bg-muted rounded flex-1"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="panel p-10 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-bold tracking-tight">
                {searchTerm ? "Nothing matches that search" : "The library is empty"}
              </h3>
              <p className="mx-auto max-w-md text-sm text-muted-foreground">
                {searchTerm 
                  ? `No assets match "${searchTerm}". Try a shorter term or clear the search.`
                  : "Finished generations land here, with their prompt and download links."
                }
              </p>
              {!searchTerm && (
                <Link href="/generate">
                  <Button className="mt-4 rounded-[var(--radius)] bg-[var(--flux)] font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--primary-foreground)] hover:brightness-110" data-testid="button-create-first-asset">
                    Generate an asset
                  </Button>
                </Link>
              )}
              {searchTerm && (
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => setSearchTerm("")}
                  data-testid="button-clear-search"
                >
                  Clear search
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map((asset) => (
              <Card key={asset.id} className="panel group transition-colors hover:border-[var(--mesh)]/50" data-testid={`asset-card-${asset.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge 
                      className={`flex items-center gap-1.5 rounded-[var(--radius)] border bg-transparent font-mono text-[10px] uppercase tracking-[0.12em] ${getJobTypeColor(asset.jobType)}`}
                      data-testid={`badge-job-type-${asset.jobType}`}
                    >
                      {getJobTypeIcon(asset.jobType)}
                      {asset.jobType.replace("-", " ")}
                    </Badge>
                    <div className="mono-label flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      <span data-testid={`date-${asset.id}`}>
                        {format(new Date(asset.createdAt), "MMM d")}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <AssetThumbnail asset={asset} />
                  <div className="space-y-2 mt-3">
                    <h4 className="line-clamp-2 font-mono text-xs leading-relaxed text-muted-foreground" data-testid={`prompt-${asset.id}`}>
                      {asset.prompt}
                    </h4>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 rounded-[var(--radius)] font-mono text-[10px] uppercase tracking-[0.12em]"
                        onClick={() => window.open(asset.url, '_blank')}
                        data-testid={`button-view-${asset.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 rounded-[var(--radius)] font-mono text-[10px] uppercase tracking-[0.12em]"
                        onClick={() => {
                          window.location.href = `/api/assets/${asset.id}/download`;
                        }}
                        data-testid={`button-download-${asset.id}`}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredAssets.length > 0 && (
          <div className="mono-label border-t border-border pt-5">
            {filteredAssets.length} of {assets.length} assets
          </div>
        )}
      </div>
    </div>
  );
}