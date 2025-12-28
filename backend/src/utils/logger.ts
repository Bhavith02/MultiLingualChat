import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  if (stack) {
    msg += `\n${stack}`;
  }
  
  return msg;
});

// Create logger instance
const transports: winston.transport[] = [
  // File transport for errors
  new winston.transports.File({ 
    filename: 'logs/error.log', 
    level: 'error',
  }),
  // File transport for all logs
  new winston.transports.File({ 
    filename: 'logs/combined.log',
  }),
];

// Add console transport only once
if (process.env.NODE_ENV !== 'production') {
  transports.push(new winston.transports.Console({
    format: combine(
      colorize(),
      logFormat
    ),
  }));
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports,
});
