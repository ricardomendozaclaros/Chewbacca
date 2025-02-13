import express from 'express';
import { signatureController } from '../controller/signatureController.js';
import { signatureCertifirmaController } from '../controller/signatureCertifirmaController.js';
const router = express.Router();

router.get('/SignatureProcesses/DateRange', signatureController.getSignaturesByDateRange.bind(signatureController));
router.get('/SignatureProcessesCertifirma/DateRange', signatureCertifirmaController.getSignaturesByDateRange.bind(signatureCertifirmaController));

export default router;