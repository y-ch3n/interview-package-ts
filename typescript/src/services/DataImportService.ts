import sequelize from '../config/database';
import { Teacher, Student, Class, Subject, TeacherStudentAssignment } from '../models/index';
import { CsvItem } from 'CsvItem';
import Logger from '../config/logger';

const LOG = new Logger('DataImportService.ts');

export class DataImportService {
  async importData(items: CsvItem[]): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      for (const item of items) {
        const [teacher] = await Teacher.findOrCreate({
          where: { email: item.teacherEmail },
          defaults: {
            email: item.teacherEmail,
            name: item.teacherName,
          },
          transaction,
        });
        if (teacher.name !== item.teacherName) {
          teacher.name = item.teacherName;
          await teacher.save({ transaction });
        }

        const [student] = await Student.findOrCreate({
          where: { email: item.studentEmail },
          defaults: {
            email: item.studentEmail,
            name: item.studentName,
          },
          transaction,
        });
        if (student.name !== item.studentName) {
          student.name = item.studentName;
          await student.save({ transaction });
        }

        const [classRecord] = await Class.findOrCreate({
          where: { classCode: item.classCode },
          defaults: {
            classCode: item.classCode,
            name: item.classname,
          },
          transaction,
        });
        if (classRecord.name !== item.classname) {
          classRecord.name = item.classname;
          await classRecord.save({ transaction });
        }

        const [subject] = await Subject.findOrCreate({
          where: { subjectCode: item.subjectCode },
          defaults: {
            subjectCode: item.subjectCode,
            name: item.subjectName,
          },
          transaction,
        });
        if (subject.name !== item.subjectName) {
          subject.name = item.subjectName;
          await subject.save({ transaction });
        }

        const existingAssignment = await TeacherStudentAssignment.findOne({
          where: {
            teacherId: teacher.id,
            studentId: student.id,
            classId: classRecord.id,
            subjectId: subject.id,
          },
          paranoid: false,
          transaction,
        });

        if (existingAssignment) {
          if (item.toDelete === '1') {
            await existingAssignment.destroy({ transaction });
          } else if (existingAssignment.deletedAt) {
            await existingAssignment.restore({ transaction });
          }
        } else if (item.toDelete !== '1') {
          await TeacherStudentAssignment.create(
            {
              teacherId: teacher.id,
              studentId: student.id,
              classId: classRecord.id,
              subjectId: subject.id,
            },
            { transaction }
          );
        }
      }

      await transaction.commit();
      LOG.info(`Successfully imported ${items.length} records`);
    } catch (error) {
      await transaction.rollback();
      LOG.error(`Failed to import data: ${error}`);
      throw error;
    }
  }
}

export default new DataImportService();
