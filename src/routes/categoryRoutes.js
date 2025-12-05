import express from 'express';
import categoryController from '../controllers/categoryController.js';

const router = express.Router();

router.get('/:id',categoryController.select);
router.get('/list', categoryController.list);
router.put('/:id',categoryController.update);
router.post('/', categoryController.create);

export default router;