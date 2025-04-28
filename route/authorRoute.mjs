// filepath: e:\BOOKS_Express\route\authorRoute.mjs
import express from 'express';
import {
    addAuthor,
    getAuthor,
    getAuthorBooks,
    updateAuthorInfo,
    removeAuthor,
    getAllAuthorsList
} from '../controller/AuthorController.mjs';
import { authenticateJWT, adminOnly } from '../middleware/authMiddleware.mjs';
import {
    authorValidator,
    authorUpdateValidator,
    paginationValidator
} from '../middleware/validators.mjs';

const router = express.Router();

// Публичные маршруты (для чтения информации)
router.get('/:id', getAuthor);
router.get('/', paginationValidator, getAllAuthorsList);
router.get('/:id/books', [paginationValidator], getAuthorBooks);

// Защищенные маршруты (требуют аутентификации и роли админа)
router.post('/', [authenticateJWT, adminOnly, ...authorValidator], addAuthor);
router.patch('/:id', [authenticateJWT, adminOnly, ...authorUpdateValidator], updateAuthorInfo);
router.delete('/:id', [authenticateJWT, adminOnly], removeAuthor);

export default router;