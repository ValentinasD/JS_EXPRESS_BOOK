
import express from 'express';
import {
    addBook,
    getBook,
    updateBookInfo,
    removeBook,
    getAllBooksList,
    getAuthorBooksList
} from '../controller/BookController.mjs';
import { authenticateJWT, adminOnly } from '../middleware/authMiddleware.mjs';
import { 
    bookValidator, 
    bookUpdateValidator, 
    paginationValidator, 
    searchValidator 
} from '../middleware/validators.mjs';

const router = express.Router();


router.get('/:id', getBook);
router.get('/', [...paginationValidator, ...searchValidator], getAllBooksList);
router.get('/author/:authorId', paginationValidator, getAuthorBooksList);


router.post('/', [authenticateJWT, adminOnly, ...bookValidator], addBook);
router.patch('/:id', [authenticateJWT, adminOnly, ...bookUpdateValidator], updateBookInfo);
router.delete('/:id', [authenticateJWT, adminOnly], removeBook);

export default router;