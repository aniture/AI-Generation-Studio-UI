import { useState } from "react";
import { Check, Copy } from "lucide-react";

const BASE = "https://api.forge.dev";

interface Endpoint {
  method: "POST" | "GET";
  path: string;
  summary: string;
  request: string;
  response: string;
  responseLabel: string;
}

const endpoints: Endpoint[] = [
  {
    method: "POST",
    path: "/v1/jobs",
    summary: "Queue a generation. Returns immediately with a job id.",
    request: `curl -X POST ${BASE}/v1/jobs \\
  -H "Authorization: Bearer $FORGE_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "tool": "text2mesh",
    "prompt": "brass astrolabe, engraved",
    "options": { "format": "glb" }
  }'`,
    responseLabel: "202 Accepted",
    response: `{
  "id": "job_3910179b4678",
  "status": "queued",
  "tool": "text2mesh",
  "creditsUsed": 5
}`,
  },
  {
    method: "GET",
    path: "/v1/jobs/:id",
    summary: "Poll a job. Assets appear once status is completed.",
    request: `curl ${BASE}/v1/jobs/job_3910179b4678 \\
  -H "Authorization: Bearer $FORGE_KEY"`,
    responseLabel: "200 OK",
    response: `{
  "id": "job_3910179b4678",
  "status": "completed",
  "tool": "text2mesh",
  "assetUrls": [
    "${BASE}/assets/job_3910179b4678.glb"
  ],
  "meta": { "tris": 24576, "durationMs": 38210 }
}`,
  },
];

const limits = [
  { k: "rate limit", v: "100 req / min / key" },
  { k: "typical job", v: "5–40 s" },
  { k: "retention", v: "30 days" },
  { k: "formats", v: "glb · usdz · fbx · png · mp4" },
];

function CodeBlock({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="panel-inset overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="mono-label">{label}</span>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-[var(--flux)]"
          data-testid={`button-copy-${label.replace(/\s+/g, "-")}`}
        >
          {copied ? <Check className="h-3 w-3 text-[var(--mesh)]" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-foreground">
        {code}
      </pre>
    </div>
  );
}

export default function Playground() {
  return (
    <div>
      <div className="border-b border-border">
        <div className="container py-5">
          <div className="mono-label">reference</div>
          <h1 className="mt-1.5 text-2xl">API</h1>
        </div>
      </div>

      <div className="container space-y-10 py-8">
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Two calls run the whole pipeline: queue a job, then poll it or wait for the
          webhook. Every response carries the credits it cost.
        </p>

        {endpoints.map((ep) => (
          <section key={ep.path} className="panel overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 border-b border-border p-5">
              <span
                className={`rounded-[var(--radius)] border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${
                  ep.method === "POST"
                    ? "border-[var(--flux)]/40 text-[var(--flux)]"
                    : "border-[var(--mesh)]/40 text-[var(--mesh)]"
                }`}
              >
                {ep.method}
              </span>
              <code className="font-mono text-sm text-foreground">{ep.path}</code>
              <p className="w-full text-sm text-muted-foreground sm:w-auto sm:flex-1 sm:text-right">
                {ep.summary}
              </p>
            </div>

            <div className="grid gap-4 p-5 lg:grid-cols-2">
              <CodeBlock label="request" code={ep.request} />
              <CodeBlock label={ep.responseLabel} code={ep.response} />
            </div>
          </section>
        ))}

        <section>
          <div className="flex items-center gap-3">
            <span className="h-px w-6 bg-[var(--flux)]" />
            <span className="mono-label">limits</span>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-border pt-6 sm:grid-cols-4">
            {limits.map((l) => (
              <div key={l.k}>
                <dt className="mono-label">{l.k}</dt>
                <dd className="mt-1.5 font-mono text-[13px] text-foreground">{l.v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
