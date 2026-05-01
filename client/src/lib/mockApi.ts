// Mock API for portfolio/demo deployment.
// Intercepts /api/* fetch calls and returns canned responses so the app runs
// as a static SPA on Vercel without any backend, database, or paid AI keys.

type Tool = "text2image" | "text2mesh" | "texturing" | "img2video";
type JobStatus = "queued" | "processing" | "completed" | "failed";

interface Job {
  id: string;
  tool: Tool;
  prompt: string;
  inputs?: unknown;
  status: JobStatus;
  assetUrls?: string[];
  provider: string;
  providerJobId: string | null;
  meta: Record<string, unknown>;
  userId: string;
  sessionId: string;
  creditsUsed: number;
  createdAt: string;
  updatedAt: string;
}

interface Asset {
  id: string;
  prompt: string;
  url: string;
  jobType: "text-to-image" | "text-to-3D" | "image-to-video" | "texturing";
  userId: string;
  createdAt: string;
}

const TOOL_COSTS: Record<Tool, number> = {
  text2image: 1,
  text2mesh: 5,
  texturing: 3,
  img2video: 4,
};

const TOOL_TO_ASSET_TYPE: Record<Tool, Asset["jobType"]> = {
  text2image: "text-to-image",
  text2mesh: "text-to-3D",
  texturing: "texturing",
  img2video: "image-to-video",
};

const KEYS = {
  credits: "mock:credits",
  jobs: "mock:jobs",
  assets: "mock:assets",
};

const DEMO_USER = "demo-user";
const DEMO_SESSION = "demo-session";
const STARTING_CREDITS = 25;

// Public, royalty-free fallback assets.
const SAMPLE_GLB =
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb";
const SAMPLE_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const ARTIFICIAL_DELAY = { queue: 600, processing: 2400 };

function seedFrom(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function picsum(seed: string, w = 1024, h = 1024) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

function uuid() {
  return crypto.randomUUID();
}

function nowIso() {
  return new Date().toISOString();
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode */
  }
}

function getCredits(): number {
  const v = localStorage.getItem(KEYS.credits);
  if (v === null) {
    localStorage.setItem(KEYS.credits, String(STARTING_CREDITS));
    return STARTING_CREDITS;
  }
  return Number(v);
}

function setCredits(n: number) {
  localStorage.setItem(KEYS.credits, String(Math.max(0, n)));
}

function getJobs(): Record<string, Job> {
  return loadJSON<Record<string, Job>>(KEYS.jobs, {});
}

function saveJob(job: Job) {
  const all = getJobs();
  all[job.id] = job;
  saveJSON(KEYS.jobs, all);
}

function getAssets(): Asset[] {
  return loadJSON<Asset[]>(KEYS.assets, []);
}

function appendAsset(asset: Asset) {
  const all = getAssets();
  all.unshift(asset);
  saveJSON(KEYS.assets, all);
}

function buildAssetUrls(tool: Tool, prompt: string): string[] {
  const seed = seedFrom(prompt + ":" + tool);
  switch (tool) {
    case "text2image":
      return [picsum(seed, 1024, 1024)];
    case "text2mesh":
      // Sample model + a preview thumbnail seeded by the prompt.
      return [SAMPLE_GLB, picsum(seed, 800, 800)];
    case "texturing":
      // Albedo, normal, metallic-roughness — all picsum stand-ins.
      return [
        picsum(seed + "-albedo", 512, 512),
        picsum(seed + "-normal", 512, 512),
        picsum(seed + "-mr", 512, 512),
      ];
    case "img2video":
      return [SAMPLE_VIDEO];
  }
}

function thumbnailFor(tool: Tool, urls: string[], prompt: string): string {
  if (tool === "text2mesh") return urls[1] ?? picsum(seedFrom(prompt), 800, 800);
  if (tool === "img2video") return picsum(seedFrom(prompt) + "-poster", 1024, 576);
  return urls[0];
}

function scheduleJobProgress(jobId: string) {
  setTimeout(() => {
    const all = getJobs();
    const j = all[jobId];
    if (!j || j.status !== "queued") return;
    j.status = "processing";
    j.updatedAt = nowIso();
    saveJob(j);
  }, ARTIFICIAL_DELAY.queue);

  setTimeout(() => {
    const all = getJobs();
    const j = all[jobId];
    if (!j) return;
    j.status = "completed";
    j.assetUrls = buildAssetUrls(j.tool, j.prompt);
    j.updatedAt = nowIso();
    saveJob(j);

    appendAsset({
      id: j.id,
      prompt: j.prompt,
      url: thumbnailFor(j.tool, j.assetUrls!, j.prompt),
      jobType: TOOL_TO_ASSET_TYPE[j.tool],
      userId: DEMO_USER,
      createdAt: j.createdAt,
    });
  }, ARTIFICIAL_DELAY.queue + ARTIFICIAL_DELAY.processing);
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function handleMockRoute(method: string, path: string, body: unknown): Promise<Response> {
  // GET /api/credits
  if (method === "GET" && path === "/api/credits") {
    return jsonResponse({ credits: getCredits() });
  }

  // POST /api/jobs
  if (method === "POST" && path === "/api/jobs") {
    const { tool, prompt, inputs } = (body ?? {}) as {
      tool?: Tool;
      prompt?: string;
      inputs?: unknown;
    };
    if (!tool || !TOOL_COSTS[tool]) {
      return jsonResponse({ error: "Invalid tool" }, 400);
    }
    if (!prompt || !prompt.trim()) {
      return jsonResponse({ error: "Prompt required" }, 400);
    }
    const cost = TOOL_COSTS[tool];
    const credits = getCredits();
    if (credits < cost) {
      return jsonResponse({ message: `Insufficient credits. Need ${cost}, have ${credits}.` }, 402);
    }
    setCredits(credits - cost);

    const job: Job = {
      id: uuid(),
      tool,
      prompt,
      inputs,
      status: "queued",
      provider: "SIM",
      providerJobId: null,
      meta: { mocked: true },
      userId: DEMO_USER,
      sessionId: DEMO_SESSION,
      creditsUsed: cost,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    saveJob(job);
    scheduleJobProgress(job.id);

    return jsonResponse({ success: true, job });
  }

  // GET /api/jobs/:id
  const jobMatch = path.match(/^\/api\/jobs\/([^/]+)$/);
  if (method === "GET" && jobMatch) {
    const job = getJobs()[jobMatch[1]];
    if (!job) return jsonResponse({ error: "Job not found" }, 404);
    return jsonResponse(job);
  }

  // GET /api/assets
  if (method === "GET" && path === "/api/assets") {
    return jsonResponse(getAssets());
  }

  // GET /api/assets/:id/download
  const downloadMatch = path.match(/^\/api\/assets\/([^/]+)\/download$/);
  if (method === "GET" && downloadMatch) {
    const id = downloadMatch[1];
    const job = getJobs()[id];
    const url = job?.assetUrls?.[0];
    if (!url) return jsonResponse({ error: "Asset not ready" }, 404);
    // Redirect the browser to the actual asset.
    return Response.redirect(url, 302);
  }

  return jsonResponse({ error: `Mock API: unhandled ${method} ${path}` }, 404);
}

export function installMockApi() {
  if (typeof window === "undefined") return;
  if ((window as any).__mockApiInstalled) return;
  (window as any).__mockApiInstalled = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    let url: string;
    let method = (init?.method || "GET").toUpperCase();
    let bodyText: string | undefined;

    if (typeof input === "string") {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else {
      url = input.url;
      method = (input.method || method).toUpperCase();
    }

    let path = url;
    try {
      // Handle absolute URLs to the same origin too.
      const u = new URL(url, window.location.origin);
      if (u.origin === window.location.origin) path = u.pathname + u.search;
    } catch {
      /* relative URL, keep as-is */
    }

    if (!path.startsWith("/api/")) {
      return originalFetch(input as RequestInfo, init);
    }

    if (init?.body) {
      bodyText =
        typeof init.body === "string" ? init.body : await new Response(init.body).text();
    } else if (input instanceof Request) {
      bodyText = await input.clone().text();
    }

    let parsedBody: unknown;
    if (bodyText) {
      try {
        parsedBody = JSON.parse(bodyText);
      } catch {
        parsedBody = bodyText;
      }
    }

    // Strip query string for routing simplicity.
    const cleanPath = path.split("?")[0];
    return handleMockRoute(method, cleanPath, parsedBody);
  };
}
