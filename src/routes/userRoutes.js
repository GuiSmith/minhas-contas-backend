import express from 'express';
import userController from '../controllers/userController.js';

const router = express.Router();

router.post('/login', userController.login);
router.post('/register', userController.register);
router.get('/:id',userController.select);
router.delete('/logout', userController.logout);

export default router;