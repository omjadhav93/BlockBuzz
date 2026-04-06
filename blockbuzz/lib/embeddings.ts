/**
 * embeddings.ts
 * -------------
 * Generates L2-normalised 384-dim embeddings using the HuggingFace Inference
 * API with model  sentence-transformers/all-MiniLM-L6-v2.
 *
 * This is the same model used by the Python bulk-embedding script
 * (generate_embeddings.py), so query vectors and document vectors live in the
 * same embedding space, making cosine-similarity search correct.
 */

const HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2";
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

function normalize(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  return norm === 0 ? vec : vec.map(v => v / norm);
}

/**
 * Calls the HuggingFace Inference API and returns a normalised embedding.
 * Retries up to `retries` times on transient 503 / model-loading responses.
 */
export async function getEmbedding(
  text: string,
  retries = 4,
  backoffMs = 5000,
): Promise<number[]> {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) throw new Error("HF_API_KEY environment variable is not set");

  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
        options: { wait_for_model: true },
      }),
    });

    // Model still loading → wait and retry
    if (res.status === 503) {
      if (attempt === retries) throw new Error("HF model unavailable after retries");
      const wait = backoffMs * attempt;
      console.warn(`[embeddings] 503 – model loading, retrying in ${wait}ms …`);
      await new Promise(r => setTimeout(r, wait));
      continue;
    }

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`HF API error ${res.status}: ${body}`);
    }

    let result: unknown = await res.json();

    // The API can return a 2-D array [[...]] for a single string input.
    // Unwrap one level if needed.
    if (
      Array.isArray(result) &&
      result.length > 0 &&
      Array.isArray(result[0])
    ) {
      result = result[0];
    }

    if (!Array.isArray(result) || typeof result[0] !== "number") {
      throw new Error(`Unexpected HF API response shape: ${JSON.stringify(result).slice(0, 120)}`);
    }

    return normalize(result as number[]);
  }

  throw new Error("getEmbedding: exceeded retry limit");
}
