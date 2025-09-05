import Router from './router.js';
import { aiController } from '../controllers/ai.controller.js';

class AIRouter extends Router {
    init() {
        // Only authenticated users can access the AI feature.
        this.post('/generate', ["USER"], async (req, res) => this.controller.generate(req, res));
    }
}

export const aiRouter = new AIRouter(aiController);