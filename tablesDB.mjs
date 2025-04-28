import { query } from './DB_Conection.mjs';
import { logDB, logError } from './logger.mjs';

// vartotojo lentelė
const userTableQuery = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK(role IN ('user', 'admin')) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// autoriaus lentelė
const authorTableQuery = `
CREATE TABLE IF NOT EXISTS authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL CHECK(LENGTH(name) >= 2),
    birthDate DATE NOT NULL,
    biography VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// knygos lentelė
const bookTableQuery = `
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL CHECK(LENGTH(title) >= 3),
    summary TEXT,
    isbn VARCHAR(20) UNIQUE NOT NULL,
    author_id INTEGER REFERENCES authors(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// funkcija kurti lentelę
export const initUserTable = async () => {
    try {
        // Patikriname, ar lentelė egzistuoja
        const tableCheck = await query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name = 'users'
            );
        `);
        
        // tikriname, ar lentelė egzistuoja
        if (!tableCheck.rows[0].exists) {
            await query(userTableQuery);
            logDB('Vartotojų lentelė sukurta sėkmingai');
        } else {
            logDB('Vartotojų lentelė jau egzistuoja');
        }
    } catch (error) {
        logError('Klaida kuriant vartotojų lentelę', error.stack);
        throw error;
    }
};

// Funkcija autoriaus lentelei inicializuoti
export const initAuthorTable = async () => {
    try {
        // Patikriname, ar lentelė egzistuoja
        const tableCheck = await query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name = 'authors'
            );
        `);
        
        if (!tableCheck.rows[0].exists) {
            await query(authorTableQuery);
            logDB('Autorių lentelė sukurta sėkmingai');
        } else {
            logDB('Autorių lentelė jau egzistuoja');
        }
    } catch (error) {
        logError('Klaida kuriant autorių lentelę', error.stack);
        throw error;
    }
};

// Funkcija knygų lentelei inicializuoti
export const initBookTable = async () => {
    try {
        // Patikriname, ar lentelė egzistuoja
        const tableCheck = await query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name = 'books'
            );
        `);
        
        if (!tableCheck.rows[0].exists) {
            await query(bookTableQuery);
            logDB('Knygų lentelė sukurta sėkmingai');
        } else {
            logDB('Knygų lentelė jau egzistuoja');
        }
    } catch (error) {
        logError('Klaida kuriant knygų lentelę', error.stack);
        throw error;
    }
};

export { userTableQuery, authorTableQuery, bookTableQuery };