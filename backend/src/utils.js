import { usersService } from "./services/users.service.js";

export const createAdminUserIfNotExists = async () => {

    const adminUser = await usersService.getByUsername('admin');

    if (!adminUser) {
        await usersService.create({
            username: 'admin',
            password: 'admin',
        });
        console.log('Admin user created');
    }
}