import express from 'express';
import { customerAccountController } from '../controller/customerAccountController.js';

const router = express.Router();

router.get('/CustomerAccount', customerAccountController.getCustomerAccounts.bind(customerAccountController));

export default router;