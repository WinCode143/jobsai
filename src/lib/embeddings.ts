import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "embedding-001" });

export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await model.embedContent(text);
  return result.embedding.values;
}

export function jobToEmbeddingText(job: {
  title: string;
  company: string;
  description: string;
  tags: string[];
  location: string | null;
}): string {
  return [
    `Job title: ${job.title}`,
    `Company: ${job.company}`,
    `Location: ${job.location ?? "Remote"}`,
    `Tags: ${job.tags.join(", ")}`,
    `Description: ${job.description.slice(0, 1000)}`,
  ].join("\n");
}
