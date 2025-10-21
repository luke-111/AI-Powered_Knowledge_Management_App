import Router from './router.js'
import { notesController } from '../controllers/controllers.js' 
import { notesService } from '../services/notes.service.js';

class NotesRouter extends Router {
    init() {
        this.get('/', ["USER"], async (req, res) => this.controller.get(req, res));

        this.post('/', ["USER"], async (req, res) => this.controller.create(req, res));

        this.delete('/:id', ["USER"], async (req, res) => this.controller.delete(req, res));

        this.patch('/:id', ["USER"], async (req, res) => this.controller.update(req, res));

        this.post('/search', ["USER"], async (req, res) => {
            const { query } = req.body;
            if (!query || !query.trim()) {
                return res.sendBadRequestError("'query' is required in the request body.");
            }

            try {
                const results = await notesService.semanticSearch(query);
                res.sendOk(results);
            } catch (error) {
                req.logger?.error?.(`Semantic search failed: ${error.message}`);
                res.sendInternalServerError("Failed to run semantic search.");
            }
        });

        this.post('/:id/summarize', ["USER"], async (req, res) => {
            const { id } = req.params;
            if (!id) {
                return res.sendBadRequestError("Note ID is required.");
            }

            try {
                const summary = await notesService.summarize(id);
                if (!summary) {
                    return res.sendNotFoundError(`Note with ID ${id} not found`);
                }
                res.sendOk(summary);
            } catch (error) {
                req.logger?.error?.(`Summarization failed for note ${id}: ${error.message}`);
                res.sendInternalServerError("Failed to summarize knowledge entry.");
            }
        });
    }
}

export const notesRouter = new NotesRouter(notesController);
