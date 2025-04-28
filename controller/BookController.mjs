// filepath: e:\BOOKS_Express\controller\BookController.mjs
import { 
    createBook, 
    getBookById,
    updateBook,
    deleteBook,
    getAllBooks,
    getBooksByAuthorId,
    searchBooksByTitle
} from '../model/BookModel.mjs';
import { getAuthorById } from '../model/AuthorModel.mjs';
import { logError } from '../logger.mjs';
import { validationResult } from 'express-validator';

// Create a new book
export const addBook = async (req, res) => {
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
        
        const { title, summary, isbn, author_id } = req.body;
        
        // Basic validation
        if (!title || !isbn || !author_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Nurodykite knygos pavadinimą, ISBN ir autoriaus ID' 
            });
        }
        
        // Check if author exists
        const author = await getAuthorById(author_id);
        if (!author) {
            return res.status(404).json({
                success: false,
                message: 'Autorius nerastas'
            });
        }
        
        // Create new book
        const bookData = { title, summary, isbn, author_id };
        const newBook = await createBook(bookData);
        
        res.status(201).json({
            success: true,
            message: 'Knyga pridėta sėkmingai',
            data: newBook
        });
    } catch (error) {
        logError('Error in addBook controller', error.stack);
        res.status(500).json({
            success: false,
            message: 'Nepavyko pridėti knygos',
            error: error.message
        });
    }
};

// Get book by ID
export const getBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        
        const book = await getBookById(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Knyga nerasta'
            });
        }
        
        res.status(200).json({
            success: true,
            data: book
        });
    } catch (error) {
        logError('Error in getBook controller', error.stack);
        res.status(500).json({
            success: false,
            message: 'Nepavyko gauti knygos',
            error: error.message
        });
    }
};

// Update book
export const updateBookInfo = async (req, res) => {
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
        
        const bookId = req.params.id;
        const { title, summary, isbn, author_id } = req.body;
        
        // At least one field should be provided
        if (!title && summary === undefined && !isbn && !author_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Norėdami atnaujinti, pateikite bent vieną lauką' 
            });
        }
        
        // Check if book exists
        const existingBook = await getBookById(bookId);
        if (!existingBook) {
            return res.status(404).json({
                success: false,
                message: 'Knyga nerasta'
            });
        }
        
        // If author_id is provided, check if author exists
        if (author_id) {
            const author = await getAuthorById(author_id);
            if (!author) {
                return res.status(404).json({
                    success: false,
                    message: 'Autorius nerastas'
                });
            }
        }
        
        // Update the book
        const bookData = {};
        if (title) bookData.title = title;
        if (summary !== undefined) bookData.summary = summary;
        if (isbn) bookData.isbn = isbn;
        if (author_id) bookData.author_id = author_id;
        
        const updatedBook = await updateBook(bookId, bookData);
        
        res.status(200).json({
            success: true,
            message: 'Knyga sėkmingai atnaujinta',
            data: updatedBook
        });
    } catch (error) {
        logError('Error in updateBookInfo controller', error.stack);
        res.status(500).json({
            success: false,
            message: 'Nepavyko atnaujinti knygos',
            error: error.message
        });
    }
};

// Delete book
export const removeBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        
        // Check if book exists
        const existingBook = await getBookById(bookId);
        if (!existingBook) {
            return res.status(404).json({
                success: false,
                message: 'Knyga nerasta'
            });
        }
        
        // Delete book
        await deleteBook(bookId);
        
        res.status(200).json({
            success: true,
            message: 'Knyga sekmingai pashalinta'
        });
    } catch (error) {
        logError('Error in removeBook controller', error.stack);
        res.status(500).json({
            success: false,
            message: 'nepavyko pashalinti knygos',
            error: error.message
        });
    }
};

// Get all books
export const getAllBooksList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const title = req.query.title;
        const authorId = req.query.authorId;
        
        // Jei yra pavadinimo paieška
        if (title) {
            const searchResults = await searchBooksByTitle(title, page, limit);
            return res.status(200).json({
                success: true,
                message: 'Knygos pagal pavadinimą gautos sėkmingai',
                data: searchResults
            });
        }
        
        // Jei yra filtravimas pagal autorių
        if (authorId) {
            // Check if author exists
            const author = await getAuthorById(authorId);
            if (!author) {
                return res.status(404).json({
                    success: false,
                    message: 'Autorius nerastas'
                });
            }
            
            const booksData = await getBooksByAuthorId(authorId, page, limit);
            return res.status(200).json({
                success: true,
                message: 'Knygos pagal autorių gautos sėkmingai',
                data: booksData
            });
        }
        
        // Standartinė knygų paieška
        const booksData = await getAllBooks(page, limit);
        
        res.status(200).json({
            success: true,
            message: 'Knygos gautos sėkmingai',
            data: booksData
        });
    } catch (error) {
        logError('Error in getAllBooksList controller', error.stack);
        res.status(500).json({
            success: false,
            message: 'Nepavyko gauti knygų',
            error: error.message
        });
    }
};

// Get books by author ID
export const getAuthorBooksList = async (req, res) => {
    try {
        const authorId = req.params.authorId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        // Check if author exists
        const author = await getAuthorById(authorId);
        if (!author) {
            return res.status(404).json({
                success: false,
                message: 'Autorius nerastas'
            });
        }
        
        const booksData = await getBooksByAuthorId(authorId, page, limit);
        
        res.status(200).json({
            success: true,
            message: 'Knygos sėkmingai gautos',
            data: booksData
        });
    } catch (error) {
        logError('Error in getAuthorBooksList controller', error.stack);
        res.status(500).json({
            success: false,
            message: 'Nepavyko gauti knygų pagal autorių',
            error: error.message
        });
    }
};