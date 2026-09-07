import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Wand2, Palette, Video, Image, Cpu, Layers } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const toolCosts = {
  "text2image": 1,
  "text2mesh": 5,
  "texturing": 3,
  "img2video": 4,
} as const;

const toolInfo = {
  "text2image": {
    icon: Image,
    title: "Text to Image",
    description: "Generate high-quality images from text prompts using FLUX.1",
    category: "Image Generation"
  },
  "text2mesh": {
    icon: Cpu,
    title: "Text to 3D",
    description: "Create 3D models from text descriptions",
    category: "3D Generation"
  },
  "texturing": {
    icon: Layers,
    title: "AI Texturing",
    description: "Generate PBR textures for your 3D models",
    category: "3D Texturing"
  },
  "img2video": {
    icon: Video,
    title: "Image to Video",
    description: "Transform images into dynamic videos",
    category: "Video Generation"
  }
};

interface StudioTabsProps {
  userCredits: number;
  onJobCreated: (jobId: string) => void;
}

export function StudioTabs({ userCredits, onJobCreated }: StudioTabsProps) {
  const [activeTab, setActiveTab] = useState("text2image");
  const [prompts, setPrompts] = useState({
    text2image: "",
    text2mesh: "",
    texturing: "",
    img2video: ""
  });
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({
    texturing: null,
    img2video: null
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async ({ tool, prompt, inputs }: { tool: string; prompt: string; inputs?: any }) => {
      const response = await fetch(`/api/jobs`, {
        method: "POST",
        body: JSON.stringify({ tool, prompt, inputs }),
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create job');
      }
      
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.success && data.job) {
        onJobCreated(data.job.id);
        toast({
          title: "Job created successfully!",
          description: `Started ${toolInfo[data.job.tool as keyof typeof toolInfo].title} generation`
        });
        // Clear the prompt after successful submission
        setPrompts(prev => ({
          ...prev,
          [data.job.tool]: ""
        }));
        // Invalidate credits cache
        queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create job",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (tool: keyof typeof toolCosts) => {
    const prompt = prompts[tool];
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt before generating",
        variant: "destructive"
      });
      return;
    }

    const cost = toolCosts[tool];
    if (userCredits < cost) {
      toast({
        title: "Insufficient credits",
        description: `You need ${cost} credits but only have ${userCredits}`,
        variant: "destructive"
      });
      return;
    }

    let inputs = {};

    // Handle file uploads for texturing and img2video
    if (tool === "texturing" && uploadedFiles.texturing) {
      // For demo purposes, we'll use a placeholder URL
      // In a real implementation, you'd upload the file first
      inputs = {
        modelUrl: "https://example.com/uploaded-model.glb",
        options: { resolution: 1024 }
      };
    } else if (tool === "img2video" && uploadedFiles.img2video) {
      // For demo purposes, we'll use a placeholder URL
      inputs = {
        imageUrl: "https://example.com/uploaded-image.jpg",
        options: { duration: 5, fps: 24 }
      };
    }

    createJobMutation.mutate({ tool, prompt, inputs });
  };

  const handleFileUpload = (tool: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFiles(prev => ({
        ...prev,
        [tool]: file
      }));
    }
  };

  const canAfford = (tool: keyof typeof toolCosts) => userCredits >= toolCosts[tool];
  const isLoading = createJobMutation.isPending;

  return (
    <div className="w-full space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-px rounded-md border border-border bg-border p-0 sm:grid-cols-4">
          {Object.entries(toolInfo).map(([key, info]) => {
            const Icon = info.icon;
            const cost = toolCosts[key as keyof typeof toolCosts];
            const affordable = canAfford(key as keyof typeof toolCosts);
            
            return (
              <TabsTrigger
                key={key}
                value={key}
                className="group relative flex flex-col items-start gap-3 rounded-none border-0 bg-card p-4 text-left text-muted-foreground transition-colors data-[state=active]:bg-secondary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                data-testid={`tab-${key}`}
              >
                <span className="absolute inset-x-0 top-0 h-px bg-[var(--flux)] opacity-0 group-data-[state=active]:opacity-100" />
                <Icon className="h-4 w-4 shrink-0 group-data-[state=active]:text-[var(--flux)]" strokeWidth={1.75} />
                <span className="text-[13px] font-semibold leading-tight">{info.title}</span>
                <span className={`font-mono text-[10px] uppercase tracking-[0.12em] ${affordable ? "text-muted-foreground" : "text-[var(--fail)]"}`}>
                  {cost} cr
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(toolInfo).map(([key, info]) => {
          const tool = key as keyof typeof toolCosts;
          const Icon = info.icon;
          const cost = toolCosts[tool];
          const affordable = canAfford(tool);
          const needsFileUpload = tool === "texturing" || tool === "img2video";

          return (
            <TabsContent key={key} value={key} className="mt-8">
              <Card className="panel">
                <CardHeader>
                  <CardTitle className="flex items-start gap-3">
                    <Icon className="mt-1 h-5 w-5 shrink-0 text-[var(--flux)]" strokeWidth={1.75} />
                    <div className="min-w-0">
                      <div className="text-lg font-bold tracking-tight">{info.title}</div>
                      <div className="mt-1 text-sm font-normal text-muted-foreground">{info.description}</div>
                    </div>
                    <div className="ml-auto shrink-0 text-right">
                      <div className="mono-label">cost</div>
                      <div className={`font-mono text-sm ${affordable ? "text-[var(--mesh)]" : "text-[var(--fail)]"}`}>
                        {cost} cr
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* File upload for texturing and img2video */}
                  {needsFileUpload && (
                    <div className="space-y-2">
                      <Label className="mono-label">
                        {tool === "texturing" ? "model (.glb)" : "source image"}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept={tool === "texturing" ? ".glb,.gltf" : "image/*"}
                          onChange={(e) => handleFileUpload(tool, e)}
                          className="panel-inset font-mono text-xs file:mr-3 file:border-0 file:bg-[var(--flux)] file:px-3 file:py-1 file:font-mono file:text-[10px] file:uppercase file:tracking-[0.12em] file:text-[var(--primary-foreground)]"
                          data-testid={`input-file-${tool}`}
                        />
                        <Upload className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </div>
                      {uploadedFiles[tool] && (
                        <p className="font-mono text-xs text-[var(--mesh)]">
                          {uploadedFiles[tool]!.name} attached
                        </p>
                      )}
                    </div>
                  )}

                  {/* Prompt input */}
                  <div className="space-y-2">
                    <Label htmlFor={`prompt-${tool}`} className="mono-label">
                      {tool === "texturing" ? "material" : "prompt"}
                    </Label>
                    <Textarea
                      id={`prompt-${tool}`}
                      placeholder={
                        tool === "text2image" ? "A beautiful sunset over a mountain range..." :
                        tool === "text2mesh" ? "A futuristic robot with glowing eyes..." :
                        tool === "texturing" ? "Rusty metal with scratches and wear..." :
                        "Describe the motion or scene you want..."
                      }
                      value={prompts[tool]}
                      onChange={(e) => setPrompts(prev => ({ ...prev, [tool]: e.target.value }))}
                      className="panel-inset min-h-[120px] font-mono text-sm leading-relaxed placeholder:text-muted-foreground/60"
                      data-testid={`input-prompt-${tool}`}
                    />
                  </div>

                  {/* Additional options for some tools */}
                  {tool === "img2video" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="mono-label">duration · sec</Label>
                        <Input
                          type="number"
                          defaultValue={5}
                          min={1}
                          max={10}
                          className="panel-inset font-mono text-sm"
                          data-testid="input-duration"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="mono-label">frame rate · fps</Label>
                        <Input
                          type="number"
                          defaultValue={24}
                          min={12}
                          max={60}
                          className="panel-inset font-mono text-sm"
                          data-testid="input-fps"
                        />
                      </div>
                    </div>
                  )}

                  {/* Generate button */}
                  <Button
                    onClick={() => handleSubmit(tool)}
                    disabled={!affordable || isLoading || !prompts[tool].trim()}
                    className="w-full rounded-[var(--radius)] bg-[var(--flux)] font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--primary-foreground)] hover:brightness-110 disabled:opacity-40"
                    data-testid={`button-generate-${tool}`}
                  >
                    {isLoading ? (
                      <>
                        <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                        Running…
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Run · {cost} cr
                      </>
                    )}
                  </Button>

                  {!affordable && (
                    <p className="text-center font-mono text-xs text-[var(--fail)]">
                      Need {cost - userCredits} more credits to run this.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}