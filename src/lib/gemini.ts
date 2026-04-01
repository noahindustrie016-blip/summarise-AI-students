import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

export async function summarizeText(text: string) {
  if (!text || text.trim().length === 0) {
    throw new Error("No text provided for summarization.");
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Please provide a concise and well-structured summary of the following academic text. Use bullet points for key takeaways and a brief introductory paragraph. Focus on the main arguments and conclusions.

Text:
${text.substring(0, 30000)}`, // Limit text to avoid token limits
    config: {
      systemInstruction: "You are a helpful academic assistant that specializes in summarizing complex documents for students.",
    },
  });

  return response.text;
}
