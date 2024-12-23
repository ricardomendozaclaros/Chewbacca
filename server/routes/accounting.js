import express from 'express';
import { accountingController } from '../controller/accountingController.js';

const router = express.Router();

router.get('/AccountingMovement', accountingController.getAccountingMovements.bind(accountingController));

export default router;