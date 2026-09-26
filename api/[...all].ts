let appInstance: any = null;

async function getApp() {
  if (!appInstance) {
    const { createApp } = await import("../apps/api/src/app.js");
    appInstance = createApp();
  }
  return appInstance;
}

export default async function handler(req: any, res: any) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (err: any) {
    console.error("Vercel Serverless Function error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: err?.message || "Internal Server Error", stack: err?.stack }));
  }
}
