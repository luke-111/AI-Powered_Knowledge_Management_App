import { Service } from './service.js';
import { Note, Category } from '../models/models.js';
import { categoriesService } from './categories.service.js';

export class NotesService extends Service {
    constructor() {
        super(Note);
    }

    async getAll(query) {
        const where = {};
        if (typeof query?.archived !== 'undefined') {
            if (query.archived === 'true') where.archived = true;
            else if (query.archived === 'false') where.archived = false;
        }
        if (typeof query?.category !== 'undefined') {
            if (query.category === '-1') {
                where.category = null;
            } else {
                const category = await categoriesService.getById(query.category);
                if (!category) {
                    return [];
                }
                
                where.category = category.id;
            }
        }
        return await this.model.findAll({ where, include: { model: Category } });
    }

    async getById(id) {
        return await this.model.findByPk(id, { include: { model: Category } });
    }
}

export const notesService = new NotesService();
