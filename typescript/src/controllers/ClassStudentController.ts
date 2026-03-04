import Express, { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import Logger from '../config/logger';
import { Class } from '../models';
import { ClassStudentService } from '../services/ClassStudentService';

const ClassStudentController = Express.Router();
const LOG = new Logger('ClassStudentController.js');

const getClassStudentHandler: RequestHandler = async (req, res) => {
  try {
    const { classCode } = req.params;
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    // For debugging purposes, you can log the parsed data to verify its structure
    LOG.info(JSON.stringify(classCode, null, 2));

    // Validate class exists
    const classRecord = await Class.findOne({
      where: { classCode },
    });

    if (!classRecord) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `Class ${classCode} not found`,
      });
    }

    const allStudents = await new ClassStudentService().getStudentsByClass(classRecord);

    // Paginate combined results
    const totalRecords = allStudents.length;
    const totalPages = Math.ceil(totalRecords / limit);
    const paginatedStudents = allStudents.slice(offset, offset + limit);

    return res.status(StatusCodes.OK).json({
      message: `Class ${classCode} students retrieved successfully`,
      data: paginatedStudents,
      pagination: {
        currentPage: Math.floor(offset / limit) + 1,
        totalPages,
        totalRecords,
        limit,
        hasNextPage: offset + limit < totalRecords,
        hasPreviousPage: offset > 0,
      },
    });
  } catch (error) {
    LOG.error(`Failed to fetch class students: ${error}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve class students',
    });
  }
}

ClassStudentController.get('/class/:classCode/students', getClassStudentHandler);

export default ClassStudentController;

