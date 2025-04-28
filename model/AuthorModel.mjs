// failas: e:\BOOKS_Express\model\AuthorModel.mjs
import { query } from '../DB_Conection.mjs';
import { logError } from '../logger.mjs';

// Sukurti naują autorių
export const createAuthor = async (authorData) => {
    try {
        // Įterpti naują autorių į duomenų bazę
        const result = await query(
            `INSERT INTO authors (name, birthDate, biography) 
             VALUES ($1, $2, $3) 
             RETURNING id, name, birthDate, biography, created_at`,
            [authorData.name, authorData.birthDate, authorData.biography]
        );
        
        return result.rows[0];
    } catch (error) {
        logError('Klaida kuriant autorių', error.stack);
        throw error;
    }
};

// Gauti autorių pagal ID
export const getAuthorById = async (authorId) => {
    try {
        const result = await query(
            `SELECT id, name, birthDate, biography, created_at 
             FROM authors 
             WHERE id = $1`,
            [authorId]
        );
        
        return result.rows[0] || null;
    } catch (error) {
        logError('Klaida gaunant autorių pagal ID', error.stack);
        throw error;
    }
};

// Atnaujinti autorių
export const updateAuthor = async (authorId, authorData) => {
    try {
        // Sukurti atnaujinimo užklausą dinamiškai pagal pateiktus laukus
        const updates = [];
        const values = [];
        let paramCount = 1;
        
        if (authorData.name) {
            updates.push(`name = $${paramCount}`);
            values.push(authorData.name);
            paramCount++;
        }
        
        if (authorData.birthDate) {
            updates.push(`birthDate = $${paramCount}`);
            values.push(authorData.birthDate);
            paramCount++;
        }
        
        if (authorData.biography !== undefined) {
            updates.push(`biography = $${paramCount}`);
            values.push(authorData.biography);
            paramCount++;
        }
        
        // Jei nėra laukų atnaujinimui, grąžinti autorių be pakeitimų
        if (updates.length === 0) {
            return getAuthorById(authorId);
        }
        
        // Pridėti autoriaus ID reikšmių masyvo pabaigoje
        values.push(authorId);
        
        const result = await query(
            `UPDATE authors 
             SET ${updates.join(', ')} 
             WHERE id = $${paramCount} 
             RETURNING id, name, birthDate, biography, created_at`,
            values
        );
        
        return result.rows[0] || null;
    } catch (error) {
        logError('Klaida atnaujinant autorių', error.stack);
        throw error;
    }
};

// Ištrinti autorių
export const deleteAuthor = async (authorId) => {
    try {
        const result = await query(
            `DELETE FROM authors 
             WHERE id = $1 
             RETURNING id, name, birthDate, biography, created_at`,
            [authorId]
        );
        
        return result.rows[0] || null;
    } catch (error) {
        logError('Klaida ištrinant autorių', error.stack);
        throw error;
    }
};

// Gauti visus autorius (su pasirenkamu puslapiavimu)
export const getAllAuthors = async (page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;
        
        const result = await query(
            `SELECT id, name, birthDate, biography, created_at 
             FROM authors 
             ORDER BY name ASC 
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        
        // Gauti bendrą autorių skaičių puslapiavimo informacijai
        const countResult = await query('SELECT COUNT(*) FROM authors');
        
        return {
            authors: result.rows,
            total: parseInt(countResult.rows[0].count),
            page: page,
            totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
        };
    } catch (error) {
        logError('Klaida gaunant visus autorius', error.stack);
        throw error;
    }
};

// Gauti autorių su jo knygomis
export const getAuthorWithBooks = async (authorId) => {
    try {
        // Gauti autoriaus duomenis
        const authorResult = await query(
            `SELECT id, name, birthDate, biography, created_at 
             FROM authors 
             WHERE id = $1`,
            [authorId]
        );
        
        if (!authorResult.rows[0]) {
            return null;
        }
        
        // Gauti šio autoriaus knygas
        const booksResult = await query(
            `SELECT id, title, summary, isbn, created_at 
             FROM books 
             WHERE author_id = $1 
             ORDER BY title ASC`,
            [authorId]
        );
        
        return {
            ...authorResult.rows[0],
            books: booksResult.rows
        };
    } catch (error) {
        logError('Klaida gaunant autorių su knygomis', error.stack);
        throw error;
    }
};