import express from 'express';
import { userController } from '../controller/userController.js';
const router = express.Router();
router.get('/User/DateRange', userController.getUsersByDateRange.bind(userController));
export default router;