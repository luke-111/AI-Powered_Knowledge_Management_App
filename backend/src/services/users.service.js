import { Service } from './service.js';
import { User } from '../models/models.js';
import bcrypt from 'bcrypt';

class UsersService extends Service{
    constructor() {
        super(User);
    }

    async getByUsername(username) {
        if (!username) {
            throw new Error('Username is required');
        }
        return await this.model.findOne({ where: { username } });
    }

    async getById(id) {
        if (!id) {
            throw new Error('ID is required');
        }
        return await this.model.findOne({ where: { id } });
    }

    async create(data) {
        if (!data || !data.username || !data.password) {
            throw new Error('Username and password are required');
        }
        const existingUser = await this.getByUsername(data.username);
        if (existingUser) {
            throw new Error('User with specified username already exists');
        }

        const hash = await bcrypt.hash(data.password, 10);
        data.password = hash;
        return await this.model.create(data);
    }
}

export const usersService = new UsersService();