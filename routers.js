import express from "express";
import { evaluateWithLlama } from "./llama.js";
import { parseEvaluation } from "./helpers.js";

const router = express.Router();

// ---------- 1. /evaluate-answer ----------
router.post("/evaluate-answer", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const candidateAnswer = text.replace(/^Candidate says:\s*/i, "");

    const systemInstruction = `
You are an interview evaluator. 
Return ONLY valid JSON with the following structure:
{
  "score": 1-5,
  "summary": "One-line summary of the answer",
  "improvement": "One improvement suggestion"
}
Evaluate the candidate's answer now:
`;

    const modelPrompt = systemInstruction + candidateAnswer;

    const raw = await evaluateWithLlama(modelPrompt);
    const result = parseEvaluation(raw);

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------- 2. /rank-candidates ----------
router.post("/rank-candidates", async (req, res) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        error: "'answers' must be a non-empty array of strings",
      });
    }

    const evaluations = [];

    const instruction = `
You are an interview evaluator.
Return ONLY valid JSON in this format:
{
  "score": 1-5,
  "summary": "One-line summary of the answer",
  "improvement": "One improvement suggestion"
}
Do not include anything except the JSON.

Candidate answer:
`;

    for (let i = 0; i < answers.length; i++) {
      const cleaned = answers[i].replace(/^Candidate says:\s*/i, "");
      const prompt = instruction + cleaned;
      const raw = await evaluateWithLlama(prompt);
      const parsed = parseEvaluation(raw);

      evaluations.push({
        index: i,
        original: answers[i],
        ...parsed,
      });
    }

    evaluations.sort((a, b) => b.score - a.score);

    return res.json({ ranked: evaluations });

    // res.json({ ranked: evaluations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
