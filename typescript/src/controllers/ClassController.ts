import Express, { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import Logger from '../config/logger';
import { Class } from '../models';

const ClassController = Express.Router();
const LOG = new Logger('ClassController.js');

const getClassHandler: RequestHandler = async (req, res) => {
  try {
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    LOG.info(`Fetching classes, offset: ${offset}, limit: ${limit}`);

    const { count, rows } = await Class.findAndCountAll({
      limit,
      offset,
      order: [['classCode', 'ASC']],
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(StatusCodes.OK).json({
      message: 'Classes retrieved successfully',
      data: rows,
      pagination: {
        currentPage: Math.floor(offset / limit) + 1,
        totalPages,
        totalRecords: count,
        limit,
        hasNextPage: offset + limit < count,
        hasPreviousPage: offset > 0,
      },
    });
  } catch (error) {
    LOG.error(`Failed to fetch classes: ${error}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve classes',
    });
  }
}

const updateClassHandler: RequestHandler = async (req, res) => {
  const { classCode } = req.params;
  const { className } = req.body;

  try {
    const classRecord = await Class.findOne({ where: { classCode } });

    if (!classRecord) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `Class with code ${classCode} not found`,
      });
    }

    classRecord.name = className;
    await classRecord.save();

    return res.status(StatusCodes.OK).json({
      message: `Class ${classCode} updated successfully`,
      data: classRecord,
    });
  } catch (error) {
    LOG.error(`Failed to update class ${classCode}: ${error}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Failed to update class ${classCode}`,
    });
  }
}

ClassController.get('/classes', getClassHandler);
ClassController.put('/class/:classCode', updateClassHandler);

export default ClassController;
