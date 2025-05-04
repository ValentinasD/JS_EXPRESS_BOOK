import { query } from '../DB_Conection.mjs';
import bcrypt from 'bcrypt';
import { logError } from '../logger.mjs';

// Sukurti naują vartotoją
export const createUser = async (userData) => {
    try {
        // Užšifruoti slaptažodį
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
        
        // Įterpti naują vartotoją į duomenų bazę
        const result = await query(
            `INSERT INTO users (username, email, password, role) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, username, email, role, created_at`,
            [userData.username, userData.email, hashedPassword, userData.role || 'user']
        );
        
        return result.rows[0];
    } catch (error) {
        logError('Klaida kuriant vartotoją', error.stack);
        throw error;
    }
};

// Gauti vartotoją pagal ID
export const getUserById = async (userId) => {
    try {
        const result = await query(
            `SELECT id, username, email, role, created_at 
             FROM users 
             WHERE id = $1`,
            [userId]
        );
        
        return result.rows[0] || null;
    } catch (error) {
        logError('Klaida gaunant vartotoją pagal ID', error.stack);
        throw error;
    }
};

// Gauti vartotoją pagal el. paštą
export const getUserByEmail = async (email) => {
    try {
        const result = await query(
            `SELECT id, username, email, password, role, created_at 
             FROM users 
             WHERE email = $1`,
            [email]
        );
        
        return result.rows[0] || null;
    } catch (error) {
        logError('Klaida gaunant vartotoją pagal el. paštą', error.stack);
        throw error;
    }
};

// Atnaujinti vartotoją
export const updateUser = async (userId, userData) => {
    try {
        // Sukurti atnaujinimo užklausą dinamiškai pagal pateiktus laukus
        const updates = [];
        const values = [];
        let paramCount = 1;
        
        if (userData.username) {
            updates.push(`username = $${paramCount}`);
            values.push(userData.username);
            paramCount++;
        } else if (userData.name) {
            // Для обратной совместимости также обрабатываем поле name
            updates.push(`username = $${paramCount}`);
            values.push(userData.name);
            paramCount++;
        }
        
        if (userData.email) {
            updates.push(`email = $${paramCount}`);
            values.push(userData.email);
            paramCount++;
        }
        
        if (userData.password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
            updates.push(`password = $${paramCount}`);
            values.push(hashedPassword);
            paramCount++;
        }
        
        if (userData.role) {
            updates.push(`role = $${paramCount}`);
            values.push(userData.role);
            paramCount++;
        }
        
        // Jei nėra laukų atnaujinimui, grąžinti vartotoją be pakeitimų
        if (updates.length === 0) {
            return getUserById(userId);
        }
        
        // Pridėti vartotojo ID reikšmių masyvo pabaigoje
        values.push(userId);
        
        const result = await query(
            `UPDATE users 
             SET ${updates.join(', ')} 
             WHERE id = $${paramCount} 
             RETURNING id, username, email, role, created_at`,
            values
        );
        
        return result.rows[0] || null;
    } catch (error) {
        logError('Klaida atnaujinant vartotoją', error.stack);
        throw error;
    }
};

// Ištrinti vartotoją
export const deleteUser = async (userId) => {
    try {
        const result = await query(
            `DELETE FROM users 
             WHERE id = $1 
             RETURNING id, username, email, role, created_at`,
            [userId]
        );
        
        return result.rows[0] || null;
    } catch (error) {
        logError('Klaida ištrinant vartotoją', error.stack);
        throw error;
    }
};

// Gauti visus vartotojus (su pasirenkamu puslapiavimu)
export const getAllUsers = async (page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;
        
        const result = await query(
            `SELECT id, username, email, role, created_at 
             FROM users 
             ORDER BY created_at DESC 
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        
        // Gauti bendrą vartotojų skaičių puslapiavimo informacijai
        const countResult = await query('SELECT COUNT(*) FROM users');
        
        return {
            users: result.rows,
            total: parseInt(countResult.rows[0].count),
            page: page,
            totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
        };
    } catch (error) {
        logError('Klaida gaunant visus vartotojus', error.stack);
        throw error;
    }
};

// Patikrinti vartotojo slaptažodį prisijungimui
export const verifyPassword = async (plainPassword, hashedPassword) => {
    try {
        return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
        logError('Klaida tikrinant slaptažodį', error.stack);
        throw error;
    }
};