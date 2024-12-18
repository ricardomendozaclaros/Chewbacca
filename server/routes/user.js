import express from 'express'
import { userController } from '../controller/userController'

const router = express.Router();

router.get('/User/DataRange' , userController.getUserByDateRange.bind(userController));

export default router;