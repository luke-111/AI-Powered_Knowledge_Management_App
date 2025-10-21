import { Service } from './service.js';
import { Note, Category } from '../models/models.js';
import { categoriesService } from './categories.service.js';
import { aiService } from './ai.service.js';

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
        return await this.model.findAll({
            where,
            include: { model: Category },
            attributes: { exclude: ['embedding'] },
        });
    }

    async getById(id) {
        return await this.model.findByPk(id, {
            include: { model: Category },
            attributes: { exclude: ['embedding'] },
        });
    }

    async create(data) {
        const embedding = await aiService.generateEmbedding(this.#composeEmbeddableText(data.title, data.content));
        const created = await this.model.create({ ...data, embedding });
        return this.getById(created.id);
    }

    async update(id, data) {
        const record = await this.model.findByPk(id);
        if (!record) return null;

        const payload = { ...data };
        const shouldRefreshEmbedding = typeof data.title !== 'undefined' || typeof data.content !== 'undefined';

        if (shouldRefreshEmbedding) {
            const nextTitle = typeof data.title !== 'undefined' ? data.title : record.title;
            const nextContent = typeof data.content !== 'undefined' ? data.content : record.content;
            payload.embedding = await aiService.generateEmbedding(this.#composeEmbeddableText(nextTitle, nextContent));
        }

        await record.update(payload);
        return this.getById(id);
    }

    async semanticSearch(query) {
        if (!query?.trim()) {
            return [];
        }

        const [notes, queryEmbedding] = await Promise.all([
            this.model.findAll({ include: { model: Category } }),
            aiService.generateEmbedding(query),
        ]);

        const results = [];
        for (const note of notes) {
            let embedding = note.embedding;
            if (!Array.isArray(embedding) || embedding.length === 0) {
                embedding = await aiService.generateEmbedding(this.#composeEmbeddableText(note.title, note.content));
                await note.update({ embedding });
            }

            const similarity = this.#cosineSimilarity(queryEmbedding, embedding);
            const payload = note.toJSON();
            delete payload.embedding;
            results.push({
                ...payload,
                similarityScore: Number(similarity.toFixed(4)),
            });
        }

        return results
            .sort((a, b) => b.similarityScore - a.similarityScore)
            .slice(0, 10);
    }

    async summarize(id) {
        const note = await this.model.findByPk(id);
        if (!note) {
            return null;
        }

        const summary = await aiService.summarizeContent(note.title, note.content);
        return { summary };
    }

    #cosineSimilarity(vectorA, vectorB) {
        const length = Math.min(vectorA.length, vectorB.length);
        if (length === 0) return 0;

        let dotProduct = 0;
        let magnitudeA = 0;
        let magnitudeB = 0;

        for (let i = 0; i < length; i++) {
            const a = vectorA[i];
            const b = vectorB[i];
            dotProduct += a * b;
            magnitudeA += a * a;
            magnitudeB += b * b;
        }

        const denominator = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
        return denominator === 0 ? 0 : dotProduct / denominator;
    }

    #composeEmbeddableText(title, content) {
        return `${title}\n\n${content}`;
    }
}

export const notesService = new NotesService();
