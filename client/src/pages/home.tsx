import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Box, Image as ImageIcon, Layers, Video } from "lucide-react";
import { Viewport } from "@/components/ui/viewport";
import { StudioButton } from "@/components/ui/studio-button";
import { SectionTitle } from "@/components/ui/section-title";
import { PanelCard } from "@/components/ui/panel-card";

// Spec strip — the numbers a technical artist actually checks before adopting a tool.
const specs = [
  { k: "export", v: "glb · usdz · fbx" },
  { k: "turnaround", v: "~40s / mesh" },
  { k: "topology", v: "quad-dominant" },
  { k: "delivery", v: "webhook + poll" },
];

// A real ordered sequence, so the numbering carries information.
const pipeline = [
  {
    n: "01",
    title: "Prompt",
    body: "Describe the object in plain language. Reference images are optional and stack with the text.",
  },
  {
    n: "02",
    title: "Mesh",
    body: "A watertight base mesh is generated and remeshed to quad-dominant topology, then UV-unwrapped.",
  },
  {
    n: "03",
    title: "Texture",
    body: "PBR maps are synthesised against the unwrap — albedo, normal, roughness, metalness.",
  },
  {
    n: "04",
    title: "Export",
    body: "Converted to your target format and posted to your webhook, or pulled from the asset library.",
  },
];

const tools = [
  {
    icon: ImageIcon,
    title: "Text to image",
    body: "FLUX.1 renders concept frames and reference plates at up to 2K.",
    cost: 1,
    href: "/generate",
  },
  {
    icon: Box,
    title: "Text to 3D",
    body: "A full mesh with clean topology and a usable unwrap, straight from a sentence.",
    cost: 5,
    href: "/generate",
    lead: true,
  },
  {
    icon: Layers,
    title: "AI texturing",
    body: "Bring your own mesh and get a coherent PBR material set baked to its UVs.",
    cost: 3,
    href: "/generate",
  },
  {
    icon: Video,
    title: "Image to video",
    body: "Turn a still plate into a short camera move for turntables and pitch decks.",
    cost: 4,
    href: "/generate",
  },
];

export default function Home() {
  return (
    <div>
      {/* ---- Hero: the viewport is the argument ---- */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="container relative py-16 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16">
            <div className="min-w-0">
              <div className="mono-label">
                text → mesh → texture → export
              </div>

              <h1 className="mt-5 text-[2.5rem] leading-[1.0] sm:text-5xl lg:text-[3.5rem]">
                Prompt in.
                <span className="block text-[var(--flux)]">Production mesh out.</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Forge turns a sentence into a watertight, UV-unwrapped asset — textured,
                converted to your format, and delivered to your pipeline. No retopology
                pass, no cleanup afternoon.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="/generate">
                  <StudioButton size="lg" data-testid="hero-launch-studio">
                    Open the studio
                    <ArrowRight className="h-4 w-4" />
                  </StudioButton>
                </Link>
                <Link href="/playground">
                  <StudioButton variant="outline" size="lg" data-testid="hero-view-api">
                    Read the API
                  </StudioButton>
                </Link>
              </div>

              {/* Spec strip replaces generic trust badges */}
              <dl className="mt-12 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-7 sm:grid-cols-4">
                {specs.map((s) => (
                  <div key={s.k}>
                    <dt className="mono-label">{s.k}</dt>
                    <dd className="mt-1.5 font-mono text-[13px] text-foreground">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            >
              <Viewport />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ---- Pipeline ---- */}
      <section className="border-b border-border py-20">
        <div className="container">
          <SectionTitle
            eyebrow="the pipeline"
            title="Four stages, one call"
            description="Every job runs the same path. You can hook into it at any stage or just wait for the webhook."
          />

          <ol className="mt-14 grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
            {pipeline.map((step) => (
              <li key={step.n} className="bg-card p-7">
                <div className="font-mono text-2xl font-medium text-[var(--flux)]">{step.n}</div>
                <h3 className="mt-4 text-lg font-bold tracking-tight">{step.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- Tools ---- */}
      <section className="py-20">
        <div className="container">
          <SectionTitle
            eyebrow="generators"
            title="Four tools, priced per run"
            description="Credits are deducted when a job completes. Failed jobs are refunded automatically."
          />

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div key={tool.title}>
                  <PanelCard className="flex h-full flex-col p-6" accent={tool.lead}>
                    <div className="flex items-start justify-between">
                      <Icon
                        className={`h-5 w-5 ${tool.lead ? "text-[var(--flux)]" : "text-[var(--mesh)]"}`}
                        strokeWidth={1.75}
                      />
                      <span className="mono-label">
                        {tool.cost} cr
                      </span>
                    </div>
                    <h3 className="mt-5 text-base font-bold tracking-tight">{tool.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {tool.body}
                    </p>
                    <Link href={tool.href}>
                      <span className="mt-6 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--flux)] hover:underline">
                        Run it <ArrowRight className="h-3 w-3" />
                      </span>
                    </Link>
                  </PanelCard>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---- Close ---- */}
      <section className="border-t border-border py-20">
        <div className="container">
          <div className="panel tick-frame flex flex-col items-start justify-between gap-8 p-10 md:flex-row md:items-center md:p-14">
            <div>
              <h2 className="text-3xl md:text-4xl">Start with 25 credits</h2>
              <p className="mt-3 max-w-md text-muted-foreground">
                Enough for five meshes or twenty-five concept frames. No card, no trial clock.
              </p>
            </div>
            <Link href="/generate">
              <StudioButton size="lg" data-testid="cta-get-started">
                Open the studio
                <ArrowRight className="h-4 w-4" />
              </StudioButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
