import fs from "fs";
import path from "path";

// Load environment variables from .env or .env.local
let apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  const envPath = fs.existsSync(".env.local") ? ".env.local" : ".env";
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const match = line.match(/^OPENAI_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?/);
      if (match) {
        apiKey = match[1];
        break;
      }
    }
  }
}

console.log("Testing OpenAI API Live Connection...");
console.log(`API Key detected: ${apiKey ? apiKey.slice(0, 10) + "..." + apiKey.slice(-6) : "None"}`);

if (!apiKey) {
  console.error("FAIL: No OPENAI_API_KEY found.");
  process.exit(1);
}

const payload = {
  model: "gpt-4o",
  messages: [
    { role: "system", content: "You are a test assistant. Return valid JSON only." },
    { role: "user", content: "Ping: Respond with JSON { \"status\": \"connected\", \"model\": \"gpt-4o\", \"timestamp\": 1730000000 }" }
  ],
  response_format: { type: "json_object" },
  max_tokens: 50,
  temperature: 0.1
};

try {
  const start = Date.now();
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const duration = Date.now() - start;
  const status = response.status;
  const data = await response.json();

  console.log(`HTTP Status: ${status} (${response.statusText}) in ${duration}ms`);
  if (!response.ok) {
    console.error("OpenAI Error Response:", JSON.stringify(data, null, 2));
    process.exit(1);
  }

  const content = data.choices?.[0]?.message?.content;
  console.log("Raw Response Content:", content);
  const parsed = JSON.parse(content);
  console.log("Parsed JSON successfully:", parsed);
  console.log("✓ LIVE OPENAI GPT-4o TEST PASSED!");
} catch (err) {
  console.error("Network or Runtime Exception:", err.message);
  process.exit(1);
}
