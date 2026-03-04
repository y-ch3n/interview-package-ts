import Express, { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import Logger from '../config/logger';
import { WorkloadReportService } from '../services/WorkloadReportService';
import { Teacher } from '../models';

const TeacherWorkloadController = Express.Router();
const LOG = new Logger('TeacherWorkloadController');

const getTeacherWorkloadHandler: RequestHandler = async (req, res) => {
  try {
    const value = req.query;

    LOG.info('Fetching teacher workload report');
    
    // Build where clause for optional teacher filter
    const where: Record<string, string | number> = {};
    if (value.teacherEmail) {
      const teacher = await Teacher.findOne({ where: { email: value.teacherEmail } });
      if (!teacher) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: `Teacher ${value.teacherEmail} not found`,
        });
      }
      where.teacherId = teacher.id;
    }

    const report = await new WorkloadReportService().getWorkloadReport(where);

    return res.status(StatusCodes.OK).json(report);
  } catch (error) {
    LOG.error(`Failed to fetch teacher workload: ${error}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve teacher workload report',
    });
  }
};

TeacherWorkloadController.get('/reports/workload', getTeacherWorkloadHandler);

export default TeacherWorkloadController;
