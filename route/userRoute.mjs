import express from 'express';
import {
    register,
    login,
    getUserProfile,
    updateUserProfile,
    removeUser,
    getAllUsersList,
    getUserByEmailAddress
} from '../controller/UserController.mjs';
import { authenticateJWT, adminOnly } from '../middleware/authMiddleware.mjs';
import { 
    registerValidator, 
    loginValidator, 
    paginationValidator 
} from '../middleware/validators.mjs';

const router = express.Router();

// Vieši maršrutai (nereikalauja autentifikacijos)
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

// Autentifikuoti maršrutai
router.get('/profile/:id', authenticateJWT, getUserProfile);
router.put('/profile/:id', authenticateJWT, updateUserProfile);
router.delete('/:id', authenticateJWT, removeUser);
router.get('/email/:email', authenticateJWT, getUserByEmailAddress);

// Tik administratoriaus maršrutai (reikalinga role='admin')
router.get('/all', [authenticateJWT, adminOnly, ...paginationValidator], getAllUsersList);

export default router;