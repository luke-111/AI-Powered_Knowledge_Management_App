import { categoriesService } from '../services/categories.service.js';

export default class NotesDTO {
    static async create({ title, content, category }) {
        if (typeof title !== 'string' || !title.trim()) {
            throw new Error('Title is required and must be a non-empty string');
        }
        if (typeof content !== 'string' || !content.trim()) {
            throw new Error('Content is required and must be a non-empty string');
        }
        if (category !== undefined) {
            const found = await categoriesService.getById(category);
            if (!found) {
                throw new Error('Category does not exist');
            }
        }
        const note = {
            title: title.trim(),
            content: content.trim(),
            createdAt: new Date().toISOString(),
            archived: false
        };
        if (category !== undefined) {
            note.category = category;
        }
        return note;
    }

    static async update(original, changes) {
        const updated = { ...original };
        let modified = false;

        if ('title' in changes) {
            if (typeof changes.title !== 'string' || !changes.title.trim()) {
                throw new Error('Title must be a non-empty string');
            }
            updated.title = changes.title.trim();
            modified = true;
        }
        if ('content' in changes) {
            if (typeof changes.content !== 'string' || !changes.content.trim()) {
                throw new Error('Content must be a non-empty string');
            }
            updated.content = changes.content.trim();
            modified = true;
        }
        if ('category' in changes) {
            const found = await categoriesService.getById(changes.category);
            if (!found) {
                throw new Error('Category does not exist');
            }
            updated.category = changes.category;
            modified = true;
        }
        if ('archived' in changes) {
            updated.archived = Boolean(changes.archived);
            modified = true;
        }
        if (modified) {
            updated.modifiedAt = new Date().toISOString();
        }
        return updated;
    }
}