// filepath: e:\BOOKS_Express\middleware\validators.mjs
import { body, param, query } from 'express-validator';

// User validators
export const registerValidator = [
    body('username')
        .isString().withMessage('Username должен быть строкой')
        .notEmpty().withMessage('Username обязателен')
        .isLength({ min: 3 }).withMessage('Username должен содержать не менее 3 символов'),
    
    body('email')
        .isEmail().withMessage('Введите корректный email')
        .notEmpty().withMessage('Email обязателен'),
    
    body('password')
        .isString().withMessage('Пароль должен быть строкой')
        .notEmpty().withMessage('Пароль обязателен')
        .isLength({ min: 6 }).withMessage('Пароль должен содержать не менее 6 символов'),
    
    body('role')
        .optional()
        .isIn(['user', 'admin']).withMessage('Роль должна быть "user" или "admin"')
];

export const loginValidator = [
    body('email')
        .isEmail().withMessage('Введите корректный email')
        .notEmpty().withMessage('Email обязателен'),
    
    body('password')
        .isString().withMessage('Пароль должен быть строкой')
        .notEmpty().withMessage('Пароль обязателен')
];

// Author validators
export const authorValidator = [
    body('name')
        .isString().withMessage('Name must be a string')
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
    
    body('birthDate')
        .isISO8601().withMessage('Birth date must be in YYYY-MM-DD format')
        .notEmpty().withMessage('Birth date is required'),
    
    body('biography')
        .optional()
        .isString().withMessage('Biography must be a string')
        .isLength({ max: 150 }).withMessage('Biography cannot exceed 150 characters')
];

export const authorUpdateValidator = [
    body('name')
        .optional()
        .isString().withMessage('Name must be a string')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
    
    body('birthDate')
        .optional()
        .isISO8601().withMessage('Birth date must be in YYYY-MM-DD format'),
    
    body('biography')
        .optional()
        .isString().withMessage('Biography must be a string')
        .isLength({ max: 150 }).withMessage('Biography cannot exceed 150 characters')
];

// Book validators
export const bookValidator = [
    body('title')
        .isString().withMessage('Title must be a string')
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3 }).withMessage('Title must be at least 3 characters long'),
    
    body('summary')
        .optional()
        .isString().withMessage('Summary must be a string'),
    
    body('isbn')
        .isString().withMessage('ISBN must be a string')
        .notEmpty().withMessage('ISBN is required')
        .matches(/^[0-9-]{10,13}$/).withMessage('ISBN must be 10-13 characters containing only digits and hyphens')
        .custom(value => {
            // Remove hyphens and check if it's only digits
            const cleanedIsbn = value.replace(/-/g, '');
            if (!/^\d+$/.test(cleanedIsbn)) {
                throw new Error('ISBN can only contain digits and hyphens');
            }
            if (cleanedIsbn.length !== 10) {
                throw new Error('ISBN must contain exactly 10 digits (excluding hyphens)');
            }
            return true;
        }),
    
    body('author_id')
        .isInt().withMessage('Author ID must be an integer')
        .notEmpty().withMessage('Author ID is required')
];

export const bookUpdateValidator = [
    body('title')
        .optional()
        .isString().withMessage('Title must be a string')
        .isLength({ min: 3 }).withMessage('Title must be at least 3 characters long'),
    
    body('summary')
        .optional()
        .isString().withMessage('Summary must be a string'),
    
    body('isbn')
        .optional()
        .isString().withMessage('ISBN must be a string')
        .matches(/^[0-9-]{10,13}$/).withMessage('ISBN must be 10-13 characters containing only digits and hyphens')
        .custom(value => {
            // Remove hyphens and check if it's only digits
            const cleanedIsbn = value.replace(/-/g, '');
            if (!/^\d+$/.test(cleanedIsbn)) {
                throw new Error('ISBN can only contain digits and hyphens');
            }
            if (cleanedIsbn.length !== 10) {
                throw new Error('ISBN must contain exactly 10 digits (excluding hyphens)');
            }
            return true;
        }),
    
    body('author_id')
        .optional()
        .isInt().withMessage('Author ID must be an integer')
];

// Pagination validators
export const paginationValidator = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// Search validators
export const searchValidator = [
    query('title')
        .optional()
        .isString().withMessage('Title must be a string'),
    
    query('authorId')
        .optional()
        .isInt().withMessage('Author ID must be an integer')
];