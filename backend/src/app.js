import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import swaggerUiExpress from 'swagger-ui-express';

import { notesRouter } from './routes/notesRouter.js';
import { categoriesRouter } from './routes/categoriesRouter.js';
import { sessionsRouter } from './routes/sessionsRouter.js';
import { aiRouter } from './routes/aiRouter.js';
import { docsSpecs } from './config/swagger.config.js';
import { initializePassport } from './config/passport.config.js';
import { addLogger } from './config/logger.config.js';
import { sequelize } from './config/database.js';
import { createAdminUserIfNotExists } from './utils.js';
import './models/models.js';

const PORT = process.env.PORT || 3000;
const DEFAULT_ORIGINS = `http://localhost:${PORT},http://localhost:3001,http://localhost:3004,http://localhost:8080`;
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || DEFAULT_ORIGINS)
  .split(',')
  .map((origin) => origin.trim());

const app = express();

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
initializePassport();
app.use(passport.initialize());
app.use(addLogger);

app.use('/api/notes', notesRouter.getRouter());
app.use('/api/categories', categoriesRouter.getRouter());
app.use('/api/sessions', sessionsRouter.getRouter());
app.use(
  '/api/docs',
  swaggerUiExpress.serve,
  swaggerUiExpress.setup(docsSpecs, { swaggerOptions: { withCredentials: true } })
);
app.use('/api/ai', aiRouter.getRouter());

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    await createAdminUserIfNotExists();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

start();
