// export function parseEvaluation(text) {
//   try {
//     const jsonMatch = text.match(/\{[\s\S]*\}/);
//     if (!jsonMatch) {
//       return {
//         score: 1,
//         summary: "Could not parse answer.",
//         improvement: "Return valid JSON next time."
//       };
//     }

//     const parsed = JSON.parse(jsonMatch[0]);
//     parsed.score = Math.max(1, Math.min(parsed.score, 5));

//     return parsed;
//   } catch {
//     return {
//       score: 2,
//       summary: "Invalid response format",
//       improvement: "Ensure JSON is structured correctly."
//     };
//   }
// }

export function parseEvaluation(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Model did not return JSON");

  const parsed = JSON.parse(match[0]);

  return {
    score: Math.max(1, Math.min(5, parsed.score)),
    summary: parsed.summary,
    improvement: parsed.improvement
  };
}
