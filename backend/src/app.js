import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { notesRouter } from './routes/notesRouter.js';
import { categoriesRouter } from './routes/categoriesRouter.js';
import { sessionsRouter } from './routes/sessionsRouter.js';
import { docsSpecs } from './config/swagger.config.js';
import cookieParser from 'cookie-parser';
import swaggerUiExpress from "swagger-ui-express";
import { initializePassport } from './config/passport.config.js'
import passport from 'passport';
import { addLogger } from './config/logger.config.js';
import { sequelize } from './config/database.js';
import './models/models.js';
import { createAdminUserIfNotExists } from './utils.js';
import { aiRouter } from './routes/aiRouter.js';

const PORT = process.env.PORT || 3000;

const app = express();

const allowedOrigins = [`http://localhost:${PORT}`, 'http://localhost:3001', 'http://localhost:3004', 'http://localhost:8080'];

console.log("CORS is configured for these origins1:", allowedOrigins);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
initializePassport();
app.use(passport.initialize());




app.use(addLogger);
app.use('/api/notes', notesRouter.getRouter());
app.use('/api/categories', categoriesRouter.getRouter());
app.use('/api/sessions', sessionsRouter.getRouter());
app.use('/api/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(docsSpecs, { swaggerOptions: { withCredentials: true } }));
app.use('/api/ai', aiRouter.getRouter());

sequelize.authenticate()
    .then(async () => {
        console.log('Database connection established');
        await sequelize.sync({ alter: true });
        await createAdminUserIfNotExists();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    });

