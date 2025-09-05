import Router from './router.js'
import { notesController } from '../controllers/controllers.js' 

class NotesRouter extends Router {
    init() {
        this.get('/', ["USER"], async (req, res) => this.controller.get(req, res));

        this.post('/', ["USER"], async (req, res) => this.controller.create(req, res));

        this.delete('/:id', ["USER"], async (req, res) => this.controller.delete(req, res));

        this.patch('/:id', ["USER"], async (req, res) => this.controller.update(req, res));
    }
}

export const notesRouter = new NotesRouter(notesController);