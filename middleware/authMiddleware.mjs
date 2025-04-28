import jwt from 'jsonwebtoken';
import { logError } from '../logger.mjs';
import dotenv from 'dotenv';

dotenv.config();

// Gauname slaptą raktą iš aplinkos kintamųjų
export const JWT_SECRET = process.env.JWT_SECRET;

// Tarpinė programinė įranga JWT žetonui tikrinti
export const authenticateJWT = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Nėra prieigos tokeno'
            });
        }

        // Formatas: Bearer <token>
        const token = authHeader.split(' ')[1];
        
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: 'Neteisingas arba pasibaigęs tokenas'
                });
            }
            
            // Pridedame vartotojo informaciją prie užklausos objekto
            req.user = user;
            next();
        });
    } catch (error) {
        logError('Autentifikavimo tarpinės programinės įrangos klaida', error.stack);
        res.status(500).json({
            success: false,
            message: 'Serverio autentifikavimo klaida'
        });
    }
};

// Tarpinė programinė įranga administratoriaus rolei tikrinti
export const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Prieiga uždrausta: reikalingos administratoriaus teisės'
        });
    }
};