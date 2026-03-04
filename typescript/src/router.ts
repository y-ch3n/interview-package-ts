import Express from 'express';
import DataImportController from './controllers/DataImportController';
import HealthcheckController from './controllers/HealthcheckController';
import ClassStudentController from './controllers/ClassStudentController';

const router = Express.Router();

router.use('/', DataImportController);
router.use('/', ClassStudentController);
router.use('/', HealthcheckController);

export default router;
