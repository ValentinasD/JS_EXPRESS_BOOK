// filepath: e:\BOOKS_Express\controller\AuthorController.mjs
import { 
    createAuthor, 
    getAuthorById,
    updateAuthor,
    deleteAuthor,
    getAllAuthors,
    getAuthorWithBooks
} from '../model/AuthorModel.mjs';
import { logError } from '../logger.mjs';
import { validationResult } from 'express-validator';

// Create a new author
export const addAuthor = async (req, res) => {
    try {
        // Tikrinti validacijos klaidas
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validacijos klaida',
                errors: errors.array()
            });
        }
        
        const { name, birthDate, biography } = req.body;
        
        // Basic validation
        if (!name || !birthDate) {
            return res.status(400).json({ 
                success: false, 
                message: 'Prašome pateikti autoriaus vardą ir gimimo datą' 
            });
        }
        
        // sukurti nauja Autoriu 
        const authorData = { name, birthDate, biography };
        const newAuthor = await createAuthor(authorData);
        
        res.status(201).json({
            success: true,
            message: 'Autorius sukurtas sėkmingai',
            data: newAuthor
        });
    } catch (error) {
        logError('Error in addAuthor controller', error.stack);
        res.status(500).json({
            success: false,
            message: 'Nepavyko sukurti autoriaus',
            error: error.message
        });
    }
};

// Get author by ID
export const getAuthor = async (req, res) => {
    try {
        const authorId = req.params.id;
        
        const author = await getAuthorById(authorId);
        if (!author) {
            return res.status(404).json({
                success: false,
                message: 'Tokio autoriaus nėra'
            });
        }
        
        res.status(200).json({
            success: true,
            data: author
        });
    } catch (error) {
        logError('Error in getAuthor controller', error.stack);
        res.status(500).json({
            success: false,
            message: 'Negalima gauti autoriaus duomenų',
            error: error.message
        });
    }
};

// Get author with their books
export const getAuthorBooks = async (req, res) => {
    try {
        const authorId = req.params.id;
        
        const authorWithBooks = await getAuthorWithBooks(authorId);
        if (!authorWithBooks) {
            return res.status(404).json({
                success: false,
                message: 'Nėra tokio autoriaus'
            });
        }
        
        res.status(200).json({
            success: true,
            data: authorWithBooks
        });
    } catch (error) {
        logError('Error in getAuthorBooks controller', error.stack);
        res.status(500).json({
            success: false,
            message: 'Negalima gauti autoriaus knygų',
            error: error.message
        });
    }
};

// Update author
export const updateAuthorInfo = async (req, res) => {
    try {
        // Tikrinti validacijos klaidas
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validacijos klaida',
                errors: errors.array()
            });
        }
        
        const authorId = req.params.id;
        const { name, birthDate, biography } = req.body;
        
        // At least one field should be provided
        if (!name && !birthDate && biography === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: 'Norėdami atnaujinti, pateikite bent vieną lauką' 
            });
        }
        
        // Check if author exists
        const existingAuthor = await getAuthorById(authorId);
        if (!existingAuthor) {
            return res.status(404).json({
                success: false,
                message: 'Autoriaus nėra'
            });
        }
        
        // Update the author
        const authorData = {};
        if (name) authorData.name = name;
        if (birthDate) authorData.birthDate = birthDate;
        if (biography !== undefined) authorData.biography = biography;
        
        const updatedAuthor = await updateAuthor(authorId, authorData);
        
        res.status(200).json({
            success: true,
            message: 'Autorius sėkmingai atnaujintas',
            data: updatedAuthor
        });
    } catch (error) {
        logError('Error in updateAuthorInfo controller', error.stack);
        res.status(500).json({
            success: false,
            message: 'Autoriaus nepavyko atnaujinti',
            error: error.message
        });
    }
};

// Delete author
export const removeAuthor = async (req, res) => {
    try {
        const authorId = req.params.id;
        
        // Check if author exists
        const existingAuthor = await getAuthorById(authorId);
        if (!existingAuthor) {
            return res.status(404).json({
                success: false,
                message: 'Autoriaus nera'
            });
        }
        
        // Delete author (and associated books due to CASCADE constraint)
        await deleteAuthor(authorId);
        
        res.status(200).json({
            success: true,
            message: 'Autorius sekmingai pashalintas'
        });
    } catch (error) {
        logError('Error in removeAuthor controller', error.stack);
        res.status(500).json({
            success: false,
            message: 'nepavyko pashalinti autoriaus',
            error: error.message
        });
    }
};

// Get all authors
export const getAllAuthorsList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const authorsData = await getAllAuthors(page, limit);
        
        res.status(200).json({
            success: true,
            message: 'Visas sarasas Autoriu',
            data: authorsData
        });
    } catch (error) {
        logError('Error in getAllAuthorsList controller', error.stack);
        res.status(500).json({
            success: false,
            message: 'Nepavyko gauti sarasho Autoriu',
            error: error.message
        });
    }
};