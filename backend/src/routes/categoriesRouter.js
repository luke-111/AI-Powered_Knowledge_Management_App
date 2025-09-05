import Router from './router.js'
import { categoriesController } from '../controllers/controllers.js' 

class CategoriesRouter extends Router {
    init() {
        this.get('/', ["USER"], async (req, res) => this.controller.get(req, res));

        this.post('/', ["USER"], async (req, res) => this.controller.create(req, res));

        this.delete('/:id', ["USER"], async (req, res) => this.controller.delete(req, res));

        this.patch('/:id', ["USER"], async (req, res) => this.controller.update(req, res));
    }
}

export const categoriesRouter = new CategoriesRouter(categoriesController);