import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_API_KEY);

export async function getEmbedding(text: string): Promise<number[]> {
  const result = await hf.featureExtraction({
    model: "intfloat/e5-small-v2",
    inputs: `passage: ${text}`,
  });

  // featureExtraction returns arrays. Usually 1D array of floats for a single string.
  return normalize(result as unknown as number[]);
}

function meanPooling(vectors: number[][]): number[] {
  const dim = vectors[0].length;
  const mean = new Array(dim).fill(0);

  for (const vec of vectors) {
    for (let i = 0; i < dim; i++) {
      mean[i] += vec[i];
    }
  }

  for (let i = 0; i < dim; i++) {
    mean[i] /= vectors.length;
  }

  return mean;
}

function normalize(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  return vec.map(v => v / norm);
}
