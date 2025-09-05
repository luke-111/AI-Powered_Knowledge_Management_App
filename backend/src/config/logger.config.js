import winston from 'winston';

export const logger = winston.createLogger({
    transports: [
        new winston.transports.File({
            filename: "./logs/errors.log",
            level: "error",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        })
    ]
});

export const addLogger = (req, res, next) => {
    req.logger = logger;
    next();
}