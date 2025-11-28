import axios from "axios";

export async function evaluateWithLlama(prompt) {
  try {
    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3.2",
        prompt,
        stream: false,
      }
    );

    return response.data?.response;
  } catch (err) {
    console.error("LLaMA API Error:", err.message);
    throw new Error("Failed to call LLaMA model");
  }
}
