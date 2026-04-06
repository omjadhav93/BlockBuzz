/**
 * embeddings.ts
 * -------------
 * Generates L2-normalised 384-dim embeddings using the @huggingface/inference
 * SDK with model sentence-transformers/all-MiniLM-L6-v2.
 *
 * The SDK handles routing automatically (no manual URL management needed).
 * Same model as generate_embeddings.py so vectors are in the same space.
 */

import { HfInference } from "@huggingface/inference";

const HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2";

function normalize(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  return norm === 0 ? vec : vec.map(v => v / norm);
}

/**
 * Returns a normalised 384-dim embedding for the given text.
 * Uses the @huggingface/inference SDK which handles the new router endpoint.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) throw new Error("HF_API_KEY environment variable is not set");

  const hf = new HfInference(apiKey);

  let result = await hf.featureExtraction({
    model: HF_MODEL,
    inputs: text,
  });

  // SDK can return a nested array for single-string input — unwrap if needed
  if (Array.isArray(result) && result.length > 0 && Array.isArray(result[0])) {
    result = result[0] as number[];
  }

  if (!Array.isArray(result) || typeof (result as number[])[0] !== "number") {
    throw new Error(
      `Unexpected HF response shape: ${JSON.stringify(result).slice(0, 120)}`
    );
  }

  return normalize(result as number[]);
}
