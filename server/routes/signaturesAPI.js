import express from 'express';
import { signatureProcessesController } from '../controller/signatureProcessAPIController.js';

const router = express.Router();

router.get('/GetCountSigningCore', signatureProcessesController.getCountSigningCore);
router.get('/GetCountMPL', signatureProcessesController.getCountMPL);
router.get('/GetCountPromissoryNote', signatureProcessesController.getCountPromissoryNote);

export default router;