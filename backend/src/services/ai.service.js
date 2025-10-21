import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

const DEFAULT_TEXT_MODEL =
  process.env.GOOGLE_COMPLETION_MODEL || 'gemini-flash-latest';
const DEFAULT_EMBEDDING_MODEL =
  process.env.GOOGLE_EMBEDDING_MODEL || 'text-embedding-004';
const KNOWLEDGE_ASSISTANT_PROMPT =
  'You are an assistant helping knowledge workers capture concise, structured knowledge.';

class AIService {
  constructor() {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('Google API key not found. Please set GOOGLE_API_KEY in your environment.');
    }

    this.client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    this.textModel = this.client.getGenerativeModel({ model: DEFAULT_TEXT_MODEL });
    this.embeddingModel = this.client.getGenerativeModel({
      model: DEFAULT_EMBEDDING_MODEL,
    });
  }

  async generateContent(prompt) {
    try {
      const response = await this.textModel.generateContent({
        contents: [
          { role: 'user', parts: [{ text: KNOWLEDGE_ASSISTANT_PROMPT }] },
          { role: 'user', parts: [{ text: prompt }] },
        ],
      });

      const text = this.#extractText(response?.response);
      if (!text) {
        throw new Error('No text returned from Google Generative AI.');
      }
      return text;
    } catch (error) {
      console.error('Error generating content with Google Generative AI:', error);
      throw new Error('Failed to generate content from Google Generative AI service.');
    }
  }

  async summarizeContent(title, content) {
    const prompt = `Summarize the following knowledge entry in 3-4 concise bullet points.

Title: ${title}
Content:
${content}

Focus on actionable ideas and key takeaways.`;

    return this.generateContent(prompt);
  }

  async generateEmbedding(text) {
    try {
      const response = await this.embeddingModel.embedContent({
        content: { parts: [{ text }] },
      });

      const vector = response?.embedding?.values ?? response?.embedding;
      if (!Array.isArray(vector)) {
        throw new Error('Embedding response did not include a values array.');
      }
      return vector;
    } catch (error) {
      console.error('Error generating embedding with Google Generative AI:', error);
      throw new Error('Failed to generate embedding from Google Generative AI service.');
    }
  }

  #extractText(result) {
    if (!result) return null;

    const helperText =
      typeof result.text === 'function' ? result.text() : result.text;
    if (typeof helperText === 'string' && helperText.trim()) {
      return helperText.trim();
    }

    const parts = result.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts)) {
      const merged = parts
        .map((part) => part?.text ?? '')
        .join('')
        .trim();
      if (merged) {
        return merged;
      }
    }

    return null;
  }
}

export const aiService = new AIService();
