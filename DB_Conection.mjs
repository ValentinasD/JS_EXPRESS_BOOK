import dotenv from 'dotenv';
import pkg from 'pg';
import { logDB, logError } from './logger.mjs';

dotenv.config();

const { Pool } = pkg;

// DB prisijungimo pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
}); 

// prisijungimo klaidos
pool.on('error', (err) => {
  logError('Klaida jungiantis prie DB', err.stack);
});

// funkcija, kuri prisijungia prie DB
export const connectDB = async () => {
  try {
    await pool.connect();
    logDB('sėkmingai prisijungta prie DB');
  } catch (error) {
    logError('klaida prisijungiant prie DB', error.stack);
    // jei prisijungimas nepavyko, bandome dar kartą po 5 sek
    setTimeout(connectDB, 5000);
  }
};

// atsijungimo funkcija
export const disconnectDB = async () => {
  try {
    await pool.end();
    logDB('sėkmingai atsijungta nuo DB');
  } catch (error) {
    logError('klaida atsijungiant nuo DB', error.stack);
  }
};

// funkcija, kuri atlieka užklausas DB
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // logDB('užklausa', {
    logDB({
      query: text,
      params,
      duration,
      rows: res.rowCount,
      message: `užklausa įvykdyta per ${duration}ms`
    });
    
    return res;
  } catch (error) {
    const duration = Date.now() - start;
    logError({
      query: text,
      params,
      duration,
      message: 'klaida neįvykdyta užklausa',
    }, error.stack);
    
    throw error;
  }
};

export default pool;