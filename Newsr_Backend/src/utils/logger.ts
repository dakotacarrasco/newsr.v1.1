import winston from 'winston';
import path from 'path';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// Create logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // Console output
    new winston.transports.Console(),
    
    // File output - error logs
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'error.log'), 
      level: 'error' 
    }),
    
    // File output - combined logs
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'combined.log') 
    }),
    
    // File output - digest specific logs
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'digest.log'),
      level: 'info'
    })
  ]
});

export default logger; 