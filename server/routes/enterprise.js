import express from 'express';
import { enterpriseController } from '../controller/enterpriseController.js';
const router = express.Router();
router.get('/Enterprise/GetEnterprises', enterpriseController.getEnterprises.bind(enterpriseController));
export default router;