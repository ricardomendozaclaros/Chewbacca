import express from 'express';
import { userController } from '../controller/userController.js';
import { userCertifirmaController } from '../controller/userCertifirmaController.js';
const router = express.Router();
router.get('/User/DataRange', userController.getUsersByDateRange.bind(userController));
router.get('/UserCertifirma/DataRange', userCertifirmaController.getUsersCertifirmaByDateRange.bind(userCertifirmaController));
export default router;