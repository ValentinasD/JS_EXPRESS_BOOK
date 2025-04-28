// failas: e:\BOOKS_Express\model\BookModel.mjs
import { query } from '../DB_Conection.mjs';
import { logError } from '../logger.mjs';

// Sukurti naują knygą
export const createBook = async (bookData) => {
    try {
        // Įterpti naują knygą į duomenų bazę
        const result = await query(
            `INSERT INTO books (title, summary, isbn, author_id) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, title, summary, isbn, author_id, created_at`,
            [bookData.title, bookData.summary, bookData.isbn, bookData.author_id]
        );
        
        return result.rows[0];
    } catch (error) {
        logError('Klaida kuriant knygą', error.stack);
        throw error;
    }
};

// Gauti knygą pagal ID
export const getBookById = async (bookId) => {
    try {
        const result = await query(
            `SELECT b.id, b.title, b.summary, b.isbn, b.author_id, b.created_at, 
             a.name as author_name, a.birthDate as author_birthDate, a.biography as author_biography
             FROM books b
             JOIN authors a ON b.author_id = a.id
             WHERE b.id = $1`,
            [bookId]
        );
        
        return result.rows[0] || null;
    } catch (error) {
        logError('Klaida gaunant knygą pagal ID', error.stack);
        throw error;
    }
};

// Atnaujinti knygą
export const updateBook = async (bookId, bookData) => {
    try {
        // Sukurti atnaujinimo užklausą dinamiškai pagal pateiktus laukus
        const updates = [];
        const values = [];
        let paramCount = 1;
        
        if (bookData.title) {
            updates.push(`title = $${paramCount}`);
            values.push(bookData.title);
            paramCount++;
        }
        
        if (bookData.summary !== undefined) {
            updates.push(`summary = $${paramCount}`);
            values.push(bookData.summary);
            paramCount++;
        }
        
        if (bookData.isbn) {
            updates.push(`isbn = $${paramCount}`);
            values.push(bookData.isbn);
            paramCount++;
        }
        
        if (bookData.author_id) {
            updates.push(`author_id = $${paramCount}`);
            values.push(bookData.author_id);
            paramCount++;
        }
        
        // Jei nėra laukų atnaujinimui, grąžinti knygą be pakeitimų
        if (updates.length === 0) {
            return getBookById(bookId);
        }
        
        // Pridėti knygos ID reikšmių masyvo pabaigoje
        values.push(bookId);
        
        const result = await query(
            `UPDATE books 
             SET ${updates.join(', ')} 
             WHERE id = $${paramCount} 
             RETURNING id, title, summary, isbn, author_id, created_at`,
            values
        );
        
        return result.rows[0] || null;
    } catch (error) {
        logError('Klaida atnaujinant knygą', error.stack);
        throw error;
    }
};

// Ištrinti knygą
export const deleteBook = async (bookId) => {
    try {
        const result = await query(
            `DELETE FROM books 
             WHERE id = $1 
             RETURNING id, title, summary, isbn, author_id, created_at`,
            [bookId]
        );
        
        return result.rows[0] || null;
    } catch (error) {
        logError('Klaida ištrinant knygą', error.stack);
        throw error;
    }
};

// Gauti visas knygas (su pasirenkamu puslapiavimu)
export const getAllBooks = async (page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;
        
        const result = await query(
            `SELECT b.id, b.title, b.summary, b.isbn, b.author_id, b.created_at, 
             a.name as author_name, a.birthDate as author_birthDate, a.biography as author_biography
             FROM books b
             JOIN authors a ON b.author_id = a.id
             ORDER BY b.title ASC 
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        
        // Gauti bendrą knygų skaičių puslapiavimo informacijai
        const countResult = await query('SELECT COUNT(*) FROM books');
        
        return {
            books: result.rows,
            total: parseInt(countResult.rows[0].count),
            page: page,
            totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
        };
    } catch (error) {
        logError('Klaida gaunant visas knygas', error.stack);
        throw error;
    }
};

// Gauti knygas pagal autoriaus ID
export const getBooksByAuthorId = async (authorId, page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;
        
        const result = await query(
            `SELECT id, title, summary, isbn, author_id, created_at 
             FROM books 
             WHERE author_id = $1
             ORDER BY title ASC 
             LIMIT $2 OFFSET $3`,
            [authorId, limit, offset]
        );
        
        // Gauti bendrą šio autoriaus knygų skaičių
        const countResult = await query(
            'SELECT COUNT(*) FROM books WHERE author_id = $1',
            [authorId]
        );
        
        return {
            books: result.rows,
            total: parseInt(countResult.rows[0].count),
            page: page,
            totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
        };
    } catch (error) {
        logError('Klaida gaunant knygas pagal autoriaus ID', error.stack);
        throw error;
    }
};

// Ieškoti knygų pagal pavadinimą
export const searchBooksByTitle = async (titleQuery, page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;
        
        const result = await query(
            `SELECT b.id, b.title, b.summary, b.isbn, b.author_id, b.created_at, 
             a.name as author_name, a.birthDate as author_birthDate, a.biography as author_biography 
             FROM books b
             JOIN authors a ON b.author_id = a.id
             WHERE b.title ILIKE $1
             ORDER BY b.title ASC 
             LIMIT $2 OFFSET $3`,
            [`%${titleQuery}%`, limit, offset]
        );
        
        // Gauti bendrą paieškos rezultatų skaičių
        const countResult = await query(
            'SELECT COUNT(*) FROM books WHERE title ILIKE $1',
            [`%${titleQuery}%`]
        );
        
        return {
            books: result.rows,
            total: parseInt(countResult.rows[0].count),
            page: page,
            totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
        };
    } catch (error) {
        logError('Klaida ieškant knygų pagal pavadinimą', error.stack);
        throw error;
    }
};