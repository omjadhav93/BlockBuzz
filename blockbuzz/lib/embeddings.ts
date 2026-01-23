import { pipeline } from "@xenova/transformers";

let extractor: any;

export async function getEmbedding(text: string) {
    if (!extractor) {
        extractor = await pipeline(
            "feature-extraction",
            "Xenova/all-MiniLM-L6-v2"
        );
    }

    const output = await extractor(text, {
        pooling: "mean",
        normalize: true,
    });

    return Array.from(output.data);
}