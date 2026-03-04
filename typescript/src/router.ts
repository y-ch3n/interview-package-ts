import Express from 'express';
import DataImportController from './controllers/DataImportController';
import HealthcheckController from './controllers/HealthcheckController';
import ClassStudentController from './controllers/ClassStudentController';
import ClassController from './controllers/ClassController';

const router = Express.Router();

router.use('/', DataImportController);
router.use('/', ClassStudentController);
router.use('/', ClassController);
router.use('/', HealthcheckController);

export default router;
