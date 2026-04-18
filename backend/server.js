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

  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({
      error: "Code and language are required"
    });
  }

  try {

    const prompt = `
You are an expert ${language} debugger.

🔴 Bugs:
- List issues

🟡 Explanation:
- Explain clearly

🟢 Fixed Code:
- Provide corrected code

Code:
${code}
`;

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

    res.json({ result: data.choices[0].message.content });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI debugging failed" });
  }

});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running 🚀");
});