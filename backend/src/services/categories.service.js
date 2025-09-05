import { Service } from './service.js';
import { Note, Category } from '../models/models.js';

export class CategoriesService extends Service {
    constructor() {
        super(Category);
    }

    async getById(id) {
        return await this.model.findByPk(id, { include: { model: Note } });
    }
}

export const categoriesService = new CategoriesService();
