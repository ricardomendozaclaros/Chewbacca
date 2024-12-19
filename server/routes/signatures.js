import express from 'express';
import { signatureController } from '../controller/signatureController.js';

const router = express.Router();

router.get('/SignatureProcesses/DateRange', signatureController.getSignaturesByDateRange.bind(signatureController));

export default router;
