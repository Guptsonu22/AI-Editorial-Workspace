async function testLiveDeploy() {
  const base = "https://ai-editorial-workspace-murex.vercel.app";
  const endpoints = [
    "/",
    "/research",
    "/writing",
    "/studio",
    "/saved",
    "/settings",
    "/api/settings",
    "/api/dashboard",
  ];

  console.log("Testing live deployment at:", base);
  for (const ep of endpoints) {
    try {
      const res = await fetch(base + ep);
      console.log(`[${res.status}] ${ep}`);
    } catch (err) {
      console.error(`[ERR] ${ep}:`, err.message);
    }
  }

  try {
    const res = await fetch(base + "/api/settings");
    const json = await res.json();
    console.log("Live settings payload:", JSON.stringify(json, null, 2));
  } catch (e) {
    console.error("Live settings error:", e);
  }
}

testLiveDeploy();
