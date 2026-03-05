import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Code Debugger API Running");
});

app.post("/debug", async (req, res) => {

  const { code, language } = req.body;

  try {

    const prompt = `
You are a senior software engineer.

Analyze this ${language} code.

1. Find bugs
2. Explain the issue
3. Provide corrected code

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
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    const result =
      data?.choices?.[0]?.message?.content ||
      "No AI response returned.";

    res.json({ result });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "AI debugging failed"
    });

  }

});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});