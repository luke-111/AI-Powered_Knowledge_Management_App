import { Note } from './note.model.js';
import { Category } from './category.model.js';
import { User } from './user.model.js';

Note.belongsTo(Category, { foreignKey: 'category' });
Category.hasMany(Note, { foreignKey: 'category' });

export { Note, Category, User };
