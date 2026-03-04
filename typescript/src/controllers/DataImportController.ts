import Express, { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import Logger from '../config/logger';
import upload from '../config/multer';
import { convertCsvToJson } from '../utils';
import DataImportService from '../services/DataImportService';

const DataImportController = Express.Router();
const LOG = new Logger('DataImportController.js');

// TODO: Please implement Question 1 requirement here
const dataImportHandler: RequestHandler = async (req, res) => {
  const { file } = req;

  if (!file) {
    return res.status(StatusCodes.BAD_REQUEST).send({
      status: StatusCodes.BAD_REQUEST,
      message: 'No file uploaded',
    });
  }

  const data = await convertCsvToJson(file.path);
  // For debugging purposes, you can log the parsed data to verify its structure
  LOG.info(JSON.stringify(data, null, 2));

  await DataImportService.importData(data);

  return res.send({
    status: StatusCodes.OK,
    message: `${data.length} records imported successfully`,
  });
}

DataImportController.post('/upload', upload.single('data'), dataImportHandler);

export default DataImportController;
