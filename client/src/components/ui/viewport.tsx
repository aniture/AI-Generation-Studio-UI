import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/*
  The signature element.

  Rather than describing "text to 3D" with a gradient and a headline, the hero
  shows the thing itself: a mesh turning inside viewport chrome, with the
  readouts a DCC tool would actually surface (projection, tri count, sample
  progress). Built from CSS 3D transforms — no WebGL, no model download.
*/

const LONGITUDES = 12;
const LATITUDES = [0.32, 0.6, 0.82, 0.96];

function WireframeMesh() {
  return (
    <div
      className="relative"
      style={{ width: 200, height: 200, perspective: 800 }}
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(-16deg)",
          animation: "viewport-yaw 18s linear infinite",
        }}
      >
        {/* Longitude rings */}
        {Array.from({ length: LONGITUDES }).map((_, i) => (
          <div
            key={`lon-${i}`}
            className="absolute inset-0 rounded-full"
            style={{
              border: "1px solid var(--mesh)",
              opacity: 0.42,
              transform: `rotateY(${(180 / LONGITUDES) * i}deg)`,
            }}
          />
        ))}
        {/* Latitude rings */}
        {LATITUDES.map((scale, i) => {
          const offset = Math.sqrt(Math.max(0, 1 - scale * scale)) * 100;
          return [1, -1].map((dir) => (
            <div
              key={`lat-${i}-${dir}`}
              className="absolute rounded-full"
              style={{
                inset: 0,
                border: "1px solid var(--mesh)",
                opacity: 0.3,
                transform: `rotateX(90deg) translateZ(${dir * offset}px) scale(${scale})`,
              }}
            />
          ));
        })}
      </div>
    </div>
  );
}

function AxisGizmo() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden>
      <g strokeWidth="1.5" strokeLinecap="round">
        <line x1="26" y1="26" x2="46" y2="34" stroke="var(--fail)" />
        <line x1="26" y1="26" x2="26" y2="6" stroke="var(--mesh)" />
        <line x1="26" y1="26" x2="8" y2="36" stroke="#5b8dd6" />
      </g>
      <text x="47" y="39" fontSize="8" fill="var(--fail)" fontFamily="var(--font-mono)">x</text>
      <text x="23" y="6" fontSize="8" fill="var(--mesh)" fontFamily="var(--font-mono)">y</text>
      <text x="2" y="41" fontSize="8" fill="#5b8dd6" fontFamily="var(--font-mono)">z</text>
    </svg>
  );
}

interface ViewportProps {
  className?: string;
  /** Caption shown in the lower-left readout; defaults to the demo prompt. */
  prompt?: string;
  children?: ReactNode;
}

export function Viewport({ className, prompt = "brass astrolabe, engraved", children }: ViewportProps) {
  // Sample counter — a renderer converging, looping so the hero always has life.
  const [samples, setSamples] = useState(128);
  useEffect(() => {
    const id = setInterval(() => {
      setSamples((s) => (s >= 512 ? 128 : s + 8));
    }, 220);
    return () => clearInterval(id);
  }, []);

  const pct = Math.round((samples / 512) * 100);

  return (
    <div className={cn("panel tick-frame overflow-hidden", className)}>
      {/* Viewport header */}
      <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2">
        <div className="flex items-center gap-3">
          <span className="mono-label !text-[var(--flux)]">persp</span>
          <span className="mono-label">wireframe</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="pip h-1.5 w-1.5 rounded-full bg-[var(--flux)]" />
          <span className="mono-label">rendering</span>
        </div>
      </div>

      {/* Stage */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--ink)]">
        <div className="blueprint-grid absolute inset-0 opacity-60" />

        <div className="absolute inset-0 grid place-items-center">
          {children ?? <WireframeMesh />}
        </div>

        {/* Render sweep */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-8">
          <div
            className="viewport-sweep h-px w-full"
            style={{
              background:
                "linear-gradient(to right, transparent, var(--flux), transparent)",
            }}
          />
        </div>

        {/* Axis gizmo */}
        <div className="absolute bottom-2 left-2 opacity-80">
          <AxisGizmo />
        </div>

        {/* Bounds readout */}
        <div className="absolute right-3 top-3 text-right">
          <div className="mono-label">bounds</div>
          <div className="font-mono text-[11px] text-[var(--bone)]">2.04 × 2.04 × 2.04</div>
        </div>
      </div>

      {/* Viewport footer */}
      <div className="border-t border-[var(--line)] px-3 py-2.5">
        <div className="flex min-w-0 items-baseline justify-between gap-4">
          <span className="min-w-0 truncate font-mono text-[11px] text-[var(--dim)]">
            <span className="text-[var(--flux)]">&gt;</span> {prompt}
          </span>
          <span className="mono-label shrink-0">{samples}/512 spp</span>
        </div>
        <div className="mt-2 h-px w-full bg-[var(--line)]">
          <div
            className="h-px bg-[var(--flux)] transition-all duration-200"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="mono-label">24,576 tris</span>
          <span className="mono-label">glb · usdz · fbx</span>
        </div>
      </div>
    </div>
  );
}
