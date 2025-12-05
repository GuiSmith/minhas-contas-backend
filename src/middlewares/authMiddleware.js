import UserModel from '../database/models/userModel.js';
import TokenModel from '../database/models/tokenModel.js';

const publicRoutes = [
    { path: '/user/login', method: 'POST' },
    { path: '/user/register', method: 'POST' },
    { path: '/', method: 'GET' },
];

const tokenExpirationHour = 3;
const tokenExpirationMiliseconds = tokenExpirationHour * 60 * 60 * 1000;

const auth = async (req, res, next) => {
    try {

        // If route is pubic, continue
        const isPublicRoute = publicRoutes.find(route => route.path == req.path && route.method == req.method);
        if (isPublicRoute) {
            return next();
        }

        // Retrieving token
        let retrievedToken;
        const cookieToken = req.cookies.session ?? null;

        if(cookieToken === null){
            const headerToken = req.headers['authorization']?.split(" ")[1];
            if(!headerToken){
                return res.status(401).json({ message: `Token de autenticação não informado` });
            } else {
                retrievedToken = headerToken;
            }
        } else {
            retrievedToken = cookieToken;
        }

        // Finding token
        const existingToken = await TokenModel.findOne({
            where: { token: retrievedToken },
            raw: true,
        });

        if(!existingToken){
            return res.status(401).json({ message: `Token não encontrado` });
        }

        // Checking token's expiration

        const tokenCreationDate = new Date(existingToken.created_at);
        const tokenExpirationDate = new Date(new Date() - tokenExpirationMiliseconds);

        if(tokenCreationDate < tokenExpirationDate){
            return res.status(401).json({ message: `Token expirado` });
        }

        // Authenticated
        // Retrieving user information
        const user = await UserModel.findByPk(existingToken.id_user, { raw: true });

        req.user = user;
        return next();

    } catch (error) {
        console.log("Erro no middleware de autenticação");
        console.log(error);
        return res.status(500).json({ message: `Erro interno de autenticação. Contate o suporte` });
    }
};

export default { auth };