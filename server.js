// Bibliotecas
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Middlewares
import corsMiddleware from './src/middlewares/corsMiddleware.js';
import authMiddleware from './src/middlewares/authMiddleware.js';

// Banco
import database from './src/database/database.js';

// Rotas
import userRoutes from './src/routes/userRoutes.js';

const PORT = process.env.BACK_PORT;

const app = express();
app.use(express.json());
app.use(cors(corsMiddleware.options));
app.use(cookieParser());
app.use(authMiddleware.auth);

// Conexão com DB
database
    .authenticate()
    .then(() => console.log("Banco de dados conectado com sucesso!"))
    .catch(error => {
        console.log("Erro ao conectar-se com o banco de dados");
        console.log(error);
    });

// Rotas
app.get('/', (req, res, next) => res.status(200).json({ message: 'API is ok' }));
app.get('/auth', (req, res, next) => res.status(200).json({ message: 'Autorizado' }));
app.use('/user', userRoutes);

app.listen(
    PORT,
    '0.0.0.0',
    () => console.log(`Servidor conectado na porta ${PORT}`)
);