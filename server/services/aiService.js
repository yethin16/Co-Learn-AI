const axios = require("axios");

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function summarizeWithAI(text) {
  if (!text || text.trim().length === 0) {
    return "Nothing to summarize.";
  }

  if (!GROQ_API_KEY) {
    console.error("GROQ_API_KEY is missing");
    return "AI summarization not available (API key missing).";
  }

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/responses",
      {
        model: "openai/gpt-oss-20b",
        input: `Summarize the following content clearly and concisely:\n\n${text}`
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const output = response.data.output?.find(o => o.type === "message");

    return output?.content?.[0]?.text || "Summary could not be generated.";
  } catch (err) {
    console.error("🔥 GROQ ERROR:", err.response?.data || err.message);
    return "AI summarization failed due to API error.";
  }
}

module.exports = { summarizeWithAI };
