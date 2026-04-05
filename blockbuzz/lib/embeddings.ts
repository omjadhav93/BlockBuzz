const HF_API_URL =
  "https://router.huggingface.co/hf-inference/models/intfloat/e5-small-v2";

export async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch(HF_API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      inputs: `passage: ${text}`,
    }),
  });

  if (!res.ok) {
    throw new Error(`HF API error: ${await res.text()}`);
  }

  const data = await res.json();

  return normalize(data);
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

