import * as winston from "winston";

export const LOGGER: winston.Logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple(),
        winston.format.printf(msg => {
            if (typeof msg.message == "object") {
                msg.message = JSON.stringify(msg.message, null, 2);
            }

            const timestampLevel = `${msg.timestamp} - ${msg.level} : `;
            return winston.format.colorize().colorize(msg.level, timestampLevel) + msg.message;
        })
    ),
    transports: [
        new winston.transports.Console({level: 'info'}),
        new winston.transports.File({filename: '../logger.log',
            maxFiles:5,
            maxsize: 15242880, //15 MB
            handleExceptions:true})
    ],
});