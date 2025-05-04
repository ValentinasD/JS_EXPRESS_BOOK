import { 
    createUser, 
    getUserById,
    getUserByEmail,
    updateUser,
    deleteUser,
    getAllUsers,
    verifyPassword
} from '../model/UserModel.mjs';
import { logError } from '../logger.mjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middleware/authMiddleware.mjs';
import { validationResult } from 'express-validator';

// Registruoti naują vartotoją
export const register = async (req, res) => {
    try {
        console.log('Registration request body:', req.body); // Derinimo išvestis
        
        // Tikrinti validacijos klaidas
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validacijos klaida',
                errors: errors.array()
            });
        }

        const { username, email, password, role } = req.body;
        
        // Privalomų laukų tikrinimas
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Prašome pateikti vardą, el. pašto adresą ir slaptažodį'
            });
        }
        
        // Patikrinti, ar vartotojas jau egzistuoja
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Vartotojas su tokiu email jau yra'
            });
        }
        
        // Sukurti naują vartotoją (rolė pagal nutylėjimą yra 'user', jei nenurodyta)
        // Передаем username напрямую вместо использования поля name
        const userData = { username, email, password, role };
        const newUser = await createUser(userData);
        
        // Sugeneruoti JWT žetoną
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Grąžinti vartotojo duomenis (be slaptažodžio) ir žetoną
        res.status(201).json({
            success: true,
            message: 'vartotojas sekmingas sukurtas',
            data: {
                user: newUser,
                token
            }
        });
    } catch (error) {
        logError('Klaida registracijos kontroleryje', error.stack);
        res.status(500).json({
            success: false,
            message: 'Klaida nepavyko sukurti vartotojo',
            error: error.message
        });
    }
};

// Vartotojo prisijungimas
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Pagrindinis patikrinimas
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Prašome pateikti el. pašto adresą ir slaptažodį'
            });
        }
        
        // Rasti vartotoją pagal el. paštą
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Neteisingi prisijungimo duomenys'
            });
        }
        
        // Patikrinti slaptažodį
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Neteisingi prisijungimo duomenys'
            });
        }
        
        // Sugeneruoti JWT žetoną
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Grąžinti vartotojo duomenis (be slaptažodžio) ir žetoną
        const { password: _, ...userWithoutPassword } = user;
        
        // Добавляем поле name для обратной совместимости
        const adaptedUser = {
            ...userWithoutPassword,
            name: user.username
        };
        
        res.status(200).json({
            success: true,
            message: 'PRISIJUNGIMAS SEKMINGAS!!!!',
            data: {
                user: adaptedUser,
                token
            }
        });
    } catch (error) {
        logError('Klaida prisijungimo kontroleryje', error.stack);
        res.status(500).json({
            success: false,
            message: 'NEPAVYKO PRISIJUNGTI !!!',
            error: error.message
        });
    }
};

// Gauti vartotojo profilį
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        
        const user = await getUserById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Vartotojas nerastas'
            });
        }
        
      
        const adaptedUser = {
            ...user,
            name: user.username 
        };
        
        res.status(200).json({
            success: true,
            data: adaptedUser
        });
    } catch (error) {
        logError('Klaida gaunant vartotojo profilį', error.stack);
        res.status(500).json({
            success: false,
            message: 'Nepavyko gauti vartojo profilio',
            error: error.message
        });
    }
};

// Atnaujinti vartotoją
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const updateData = req.body;
        
        // Patikrinti, ar vartotojas egzistuoja
        const existingUser = await getUserById(userId);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'Nepavyko gauti vartojo profilio'
            });
        }
        
        // Jei el. paštas atnaujinamas, patikrinti, ar jis jau naudojamas
        if (updateData.email && updateData.email !== existingUser.email) {
            const userWithEmail = await getUserByEmail(updateData.email);
            if (userWithEmail) {
                return res.status(409).json({
                    success: false,
                    message: 'Toks Email jau yra '
                });
            }
        }
        
        // Atnaujinti vartotoją
        const updatedUser = await updateUser(userId, updateData);
        
      
        const adaptedUser = {
            ...updatedUser,
            name: updatedUser.username
        };
        
        res.status(200).json({
            success: true,
            message: 'Vartotojas sekmingai atnaujintas ',
            data: adaptedUser
        });
    } catch (error) {
        logError('Klaida atnaujinant vartotojo profilį', error.stack);
        res.status(500).json({
            success: false,
            message: 'Nepavyko atnaujinti vartotojo ',
            error: error.message
        });
    }
};

// Ištrinti vartotoją
export const removeUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Patikrinti, ar vartotojas egzistuoja
        const existingUser = await getUserById(userId);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'Vartotojas nerastas'
            });
        }
        
        // Ištrinti vartotoją
        await deleteUser(userId);
        
        res.status(200).json({
            success: true,
            message: 'Vartotojas sekmingai ishtintas'
        });
    } catch (error) {
        logError('Klaida ištrinant vartotoją', error.stack);
        res.status(500).json({
            success: false,
            message: 'Nepavyko ishtrinti vartotojo ',
            error: error.message
        });
    }
};

// Gauti visus vartotojus (administratoriaus funkcija)
export const getAllUsersList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const usersData = await getAllUsers(page, limit);
        
        // Добавляем поле name для обратной совместимости для каждого пользователя
        const adaptedUsersData = {
            ...usersData,
            users: usersData.users.map(user => ({
                ...user,
                name: user.username // Добавляем поле name со значением из username
            }))
        };
        
        res.status(200).json({
            success: true,
            message: 'Vartotojai sėkmingai gauti',
            data: adaptedUsersData
        });
    } catch (error) {
        logError('Klaida gaunant vartotojų sąrašą', error.stack);
        res.status(500).json({
            success: false,
            message: 'Nepavyko gauti vartotojų',
            error: error.message
        });
    }
};

// Gauti vartotojo duomenis pagal el. paštą
export const getUserByEmailAddress = async (req, res) => {
    try {
        const { email } = req.params;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'El. pašto adresas yra privalomas'
            });
        }
        
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Vartotojas su tokiu el. paštu nerastas'
            });
        }
        
        // Pašaliname slaptažodžio lauką prieš grąžinant duomenis
        const { password: _, ...userWithoutPassword } = user;
        
        // Pridedame name lauką suderinamumui
        const adaptedUser = {
            ...userWithoutPassword,
            name: user.username
        };
        
        res.status(200).json({
            success: true,
            data: adaptedUser
        });
    } catch (error) {
        logError('Klaida gaunant vartotoją pagal el. paštą', error.stack);
        res.status(500).json({
            success: false,
            message: 'Nepavyko gauti vartotojo duomenų',
            error: error.message
        });
    }
};