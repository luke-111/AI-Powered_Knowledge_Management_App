import NotesDTO from '../dto/notes.dto.js';
import CategoriesDTO from '../dto/categories.dto.js';
import { notesService } from '../services/notes.service.js';
import { categoriesService } from '../services/categories.service.js';

class Controller {
    constructor(service, name, dto) {
        this.service = service;
        this.name = name;
        this.dto = dto;
    }

    async get(req, res) {
        try {
            const data = await this.service.getAll(req.query);
            res.sendOk(data);
        } catch (error) {
            req.logger.error(`Error fetching all ${this.name}: ${error.message}`);
            res.sendInternalServerError(`Error fetching all ${this.name}`);
        }
    }

    async create(req, res) {
        let data;
        let props = req.body;

        try {
            data = await this.dto.create(props);
        } catch (error) {
            return res.sendBadRequestError(`Invalid data for creating ${this.name}: ${error.message}`);
        }

        try {
            const createdData = await this.service.create(data);
            res.sendCreated(createdData);
        } catch (error) {
            req.logger.error(`Error creating ${this.name}: ${error.message}`);
            res.sendInternalServerError(`Error creating ${this.name}`);
        }
    }

    async delete(req, res) {
        const id = req.params.id;

        if (!id) {
            return res.sendBadRequestError(`ID is required to delete ${this.name}`);
        }

        try {
            const deletedData = await this.service.delete(id);
            if (!deletedData) {
                return res.sendNotFoundError(`${this.name} with ID ${id} not found`);
            }
            res.sendOk(deletedData);
        } catch (error) {
            req.logger.error(`Error deleting ${this.name} with ID ${id}: ${error.message}`);
            res.sendInternalServerError(`Error deleting ${this.name} with ID ${id}`);
        }
    }

    async update(req, res) {
        const id = req.params.id;
        let props = req.body;

        if (!id) {
            return res.sendBadRequestError(`ID is required to update ${this.name}`);
        }

        let original;
        try {
            original = await this.service.getById(id);
            if (!original) {
                return res.sendNotFoundError(`${this.name} with ID ${id} not found`);
            }
        } catch (error) {
            req.logger.error(`Error fetching ${this.name} with ID ${id}: ${error.message}`);
            return res.sendInternalServerError(`Error fetching ${this.name} with ID ${id}`);
        }

        let updatedData;
        try {
            updatedData = await this.dto.update(original, props);
        } catch (error) {
            return res.sendBadRequestError(`Invalid data for updating ${this.name}: ${error.message}`);
        }

        try {
            const result = await this.service.update(id, updatedData);
            res.sendOk(result);
        } catch (error) {
            req.logger.error(`Error updating ${this.name} with ID ${id}: ${error.message}`);
            res.sendInternalServerError(`Error updating ${this.name} with ID ${id}`);
        }
    }
}

export const notesController = new Controller(notesService, "notes", NotesDTO);
export const categoriesController = new Controller(categoriesService, "categories", CategoriesDTO);