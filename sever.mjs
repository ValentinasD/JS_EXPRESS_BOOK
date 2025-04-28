import express from "express";  
import dotenv from "dotenv"; 
import { connectDB, disconnectDB, query } from "./DB_Conection.mjs";
import { initUserTable, initAuthorTable, initBookTable } from "./tablesDB.mjs";
import userRoutes from "./route/userRoute.mjs";
import authorRoutes from "./route/authorRoute.mjs";
import bookRoutes from "./route/bookRoute.mjs";

// Funkcija serverio pranešimams registruoti
const logExpress = (message) => {
  console.log(message);
};

dotenv.config(); 
const PORT = process.env.PORT || 3000;
const app = express();

// Tarpinė programinė įranga JSON užklausų apdorojimui
app.use(express.json());

app.use((req, res, next) => {
    const start = Date.now();
    next();
    const end = Date.now();
    console.log(`${req.method} ${req.url} - ${end - start}ms`);
});

// Inicializuoti serverį ir duomenų bazę
const initServer = async () => {
  try {
    // Prisijungti prie duomenų bazės
    await connectDB();
    
    // Inicializuoti lenteles
    await initUserTable();
    await initAuthorTable();
    await initBookTable();
    
    // Paleisti serverį
    app.listen(PORT, () => {
      logExpress(`SERVERIS ĮJUNGTAS http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Nepavyko inicializuoti serverio:", error);
    process.exit(1);
  }
};

// Registruoti maršrutus
app.use('/api/users', userRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/books', bookRoutes);

// Inicializuoti serverį
initServer();




