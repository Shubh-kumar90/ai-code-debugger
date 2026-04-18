import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Code Debugger API Running 🚀");
});

app.post("/debug", async (req, res) => {

  const { code, language, mode } = req.body;

  if (!code || !language) {
    return res.status(400).json({
      error: "Code and language are required"
    });
  }

  let prompt = "";

  if (mode === "explain") {
    prompt = `
Explain this ${language} code step by step in simple terms.

Use clear headings and bullet points.

Code:
${code}
`;
  } 
  else if (mode === "optimize") {
    prompt = `
Optimize this ${language} code for:
- performance
- readability
- best practices

Provide improved code + explanation.

Code:
${code}
`;
  } 
  else {
    prompt = `
You are an expert ${language} debugger.

🔴 Bugs:
- Identify all issues

🟡 Explanation:
- Explain clearly

🟢 Fixed Code:
- Provide corrected version

Use proper formatting and sections.

Code:
${code}
`;
  }

  try {

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();

    if (!data || !data.choices) {
      return res.status(500).json({ error: "Invalid AI response" });
    }

    res.json({
      result: data.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI request failed" });
  }

});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running 🚀");
});