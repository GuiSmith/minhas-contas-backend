// Modelos
import UserModel from '../database/models/userModel.js';
import tokenModel from '../database/models/tokenModel.js';

// Bibliotecas
import bcrypt from 'bcryptjs';

const profile = async (req, res) => {
    try {
        // Sanitizing password
        const user = req.user;
        const { password: _, ...userSafe } = user.toObject ? user.toObject() : user;

        return res.status(200).json(userSafe);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body ?? {};

        if (!email || !password) {
            return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
        }

        const existing = await UserModel.findOne({ where: { email } });
        if (existing) {
            return res.status(409).json({ message: 'Usuário já existe.' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await UserModel.create({ name, email, password: hashed });

        const { password: _, ...userSafe } = user.dataValues || {};
        return res.status(201).json(userSafe);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body ?? {};

        if (!email || !password) {
            return res.status(400).json({ message: "Email e senha são obrigatórios." });
        }

        const user = await UserModel.findOne({
            where: { email },
            raw: true,
        });

        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const token = await tokenModel.create({ id_user: user.id });

        if (!token) {
            return res.status(500).json({ message: "Erro ao gerar token. Contate o suporte!" });
        }

        res.cookie('session', token.token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
            maxAge: 1000 * 60 * 60 * 8 // 8h, por exemplo
        })

        return res.status(200).json({ message: `Login realizado com sucesso!` });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

const logout = async (req, res) => {
    try {
        // Limpa o cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: '/',
        });

        return res.status(200).json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
        console.error('Erro no logout:', error);
        return res.status(500).json({ message: 'Erro interno no logout' });
    }
};

export default { register, login, profile, logout };