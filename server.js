import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/summarize", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    const apiKey = process.env.GEMINI_API_KEY;

  

    const payload = {
      contents: [
        {
          parts: [
            { text: `Summarize the following email into 3-5 bullet points:\n\n${text}` }
          ]
        }
      ]
    };


  const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );
    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data.error);
      return res.status(response.status).json({
        error: "Gemini API error",
        // Pass along the specific message from Google
        details: data.error?.message || "Unknown API error"
      });
    }
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      console.warn("Gemini Warning: No content generated.", data);
      const finishReason = data.candidates?.[0]?.finishReason || "No content";
      return res.status(500).json({
        error: "Gemini error: No content generated.",
        details: `The model finished for a reason: ${finishReason}`
      });
    }

    const summary = data.candidates[0].content.parts[0].text;
    return res.json({ summary });

  } catch (error) {

    console.error("Server Error:", error.message);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
});

const PORT =  3000;
app.listen(PORT, () => console.log("Backend running on " + PORT));