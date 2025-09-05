export default class CategoriesDTO {
    static create({ name }) {
        if (typeof name !== 'string' || !name.trim()) {
            throw new Error('Name is required and must be a non-empty string');
        }
        return {
            name: name.trim(),
            createdAt: new Date().toISOString(),
            archived: false
        };
    }

    static update(original, changes) {
        const updated = { ...original };
        let modified = false;
        if ('name' in changes) {
            if (typeof changes.name !== 'string' || !changes.name.trim()) {
                throw new Error('Name must be a non-empty string');
            }
            updated.name = changes.name.trim();
            modified = true;
        }
        if (modified) {
            updated.modifiedAt = new Date().toISOString();
        }
        return updated;
    }
}
