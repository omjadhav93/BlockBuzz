const HF_API_URL =
  "https://api-inference.huggingface.co/pipeline/feature-extraction/Xenova/all-MiniLM-L6-v2";

const headers = {
  Authorization: `Bearer ${process.env.HF_API_KEY}`,
  "Content-Type": "application/json",
};

export async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch(HF_API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      inputs: text,
      options: { wait_for_model: true },
    }),
  });

  if (!res.ok) {
    throw new Error(`HF API error: ${await res.text()}`);
  }

  const data = await res.json();

  // HF returns: number[][] (token embeddings)
  const embedding = meanPooling(data);
  return normalize(embedding);
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

