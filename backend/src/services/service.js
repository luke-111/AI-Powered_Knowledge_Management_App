export class Service {
    constructor(model) {
        this.model = model;
    }

    async getAll(query) {
        return await this.model.findAll();
    }

    async getById(id) {
        return await this.model.findByPk(id);
    }

    async create(data) {
        return await this.model.create(data);
    }

    async update(id, data) {
        const record = await this.model.findByPk(id);
        if (!record) return null;
        await record.update(data);
        return record;
    }

    async delete(id) {
        const record = await this.model.findByPk(id);
        if (!record) return null;
        await record.destroy();
        return record;
    }
}
