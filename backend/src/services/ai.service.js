import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

class AIService {
    constructor() {
        if (!process.env.GOOGLE_API_KEY) {
            throw new Error("Google API Key not found. Please check your .env file.");
        }
        this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    /**
     * Generates content based on a user prompt.
     * @param {string} prompt - The user's request for the AI.
     * @returns {Promise<string>} The generated text.
     */
    async generateContent(prompt) {
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            return text;
        } catch (error) {
            console.error("Error generating content with AI:", error);
            throw new Error("Failed to generate content from AI service.");
        }
    }
}

export const aiService = new AIService();