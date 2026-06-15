import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api/v1'),

  DB_HOST: Joi.string().required().messages({
    'any.required': 'DB_HOST is required for database connection',
  }),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required().messages({
    'any.required': 'DB_USERNAME is required for database connection',
  }),
  DB_PASSWORD: Joi.string().required().messages({
    'any.required': 'DB_PASSWORD is required for database connection',
  }),
  DB_NAME: Joi.string().required().messages({
    'any.required': 'DB_NAME is required for database connection',
  }),

  JWT_SECRET: Joi.string().required().messages({
    'any.required': 'JWT_SECRET is required for token generation',
  }),
  JWT_EXPIRATION: Joi.string().default('1h'),
  JWT_REFRESH_SECRET: Joi.string().required().messages({
    'any.required':
      'JWT_REFRESH_SECRET is required for refresh token generation',
  }),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),

  MAIL_HOST: Joi.string().default('sandbox.smtp.mailtrap.io'),
  MAIL_PORT: Joi.number().default(2525),
  MAIL_USER: Joi.string().allow('').optional(),
  MAIL_PASS: Joi.string().allow('').optional(),
  MAIL_FROM: Joi.string().default(
    '"JobMatching Support" <noreply@jobmatching.com>',
  ),
});
