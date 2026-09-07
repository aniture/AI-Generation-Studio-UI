import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StudioTabs } from "@/components/studio-tabs";
import { JobStatus } from "@/components/job-status";

export default function Generate() {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const { data: creditsData } = useQuery({
    queryKey: ["/api/credits"],
    queryFn: async () => {
      const response = await fetch("/api/credits");
      if (!response.ok) throw new Error("Failed to fetch credits");
      return response.json();
    },
    refetchInterval: 30000,
  });

  const userCredits = creditsData?.credits || 0;

  return (
    <div className="min-h-screen">
      {/* Console header — a status bar, not a hero */}
      <div className="border-b border-border">
        <div className="container flex flex-wrap items-center justify-between gap-4 py-5">
          <div>
            <div className="mono-label">studio</div>
            <h1 className="mt-1.5 text-2xl">Generate</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="mono-label">credits</div>
              <div className="font-mono text-lg tabular-nums text-[var(--mesh)]">
                {userCredits}
              </div>
            </div>
            <div className="text-right">
              <div className="mono-label">queue</div>
              <div className="font-mono text-lg tabular-nums">
                {activeJobId ? 1 : 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <StudioTabs userCredits={userCredits} onJobCreated={setActiveJobId} />
          </div>

          <div className="lg:col-span-1">
            {activeJobId ? (
              <JobStatus jobId={activeJobId} onClose={() => setActiveJobId(null)} />
            ) : (
              <div className="panel p-6">
                <div className="mono-label">job status</div>
                <div className="mt-6 border-t border-border pt-6">
                  {/* Empty state as an invitation, with the wireframe motif reused */}
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    className="opacity-40"
                    aria-hidden
                  >
                    <path
                      d="M20 4 34 12v16l-14 8-14-8V12z"
                      fill="none"
                      stroke="var(--mesh)"
                      strokeWidth="1"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 12l14 8 14-8M20 20v16"
                      fill="none"
                      stroke="var(--mesh)"
                      strokeWidth="0.75"
                      opacity="0.6"
                    />
                  </svg>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    Nothing running. Start a generation and its progress, logs, and output
                    files appear here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
