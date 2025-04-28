import express from 'express';
import {
    register,
    login,
    getUserProfile,
    updateUserProfile,
    removeUser,
    getAllUsersList
} from '../controller/UserController.mjs';
import { authenticateJWT, adminOnly } from '../middleware/authMiddleware.mjs';
import { 
    registerValidator, 
    loginValidator, 
    paginationValidator 
} from '../middleware/validators.mjs';

const router = express.Router();

// Публичные маршруты (не требуют аутентификации)
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

// Маршруты пользователя (защищены аутентификацией)
router.get('/profile/:id', authenticateJWT, getUserProfile);
router.put('/profile/:id', authenticateJWT, updateUserProfile);
router.delete('/:id', authenticateJWT, removeUser);

// Маршруты администратора (защищены аутентификацией и ролью админа)
router.get('/all', [authenticateJWT, adminOnly, ...paginationValidator], getAllUsersList);

export default router;