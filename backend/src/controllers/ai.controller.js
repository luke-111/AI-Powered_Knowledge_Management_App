import { aiService } from '../services/ai.service.js';

class AIController {
    async generate(req, res) {
        const { prompt } = req.body;

        if (!prompt) {
            return res.sendBadRequestError("'prompt' is required in the request body.");
        }

        try {
            const generatedText = await aiService.generateContent(prompt);
            res.sendOk({ content: generatedText });
        } catch (error) {
            req.logger.error(`AI content generation failed: ${error.message}`);
            res.sendInternalServerError("Error generating content with AI.");
        }
    }
}

export const aiController = new AIController();