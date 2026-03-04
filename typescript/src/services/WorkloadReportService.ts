import { WorkloadReport } from 'WorkloadReport';
import { Teacher, Subject, TeacherStudentAssignment } from '../models';
import { AssignmentWithCount } from 'AssignmentWithCount';
import { col, fn } from 'sequelize';

export class WorkloadReportService {
  async getWorkloadReport(where: Record<string, string | number>) : Promise<WorkloadReport> {
    const assignments: AssignmentWithCount[] = await TeacherStudentAssignment.findAll({
      where,
      attributes: [
        'teacherId',
        'subjectId',
        [fn('COUNT', fn('DISTINCT', col('classId'))), 'numberOfClasses'],
      ],
      include: [
        { model: Teacher, attributes: ['name'] },
        { model: Subject, attributes: ['subjectCode', 'name'] },
      ],
      group: ['teacherId', 'subjectId', 'Teacher.id', 'Subject.id'],
    }) as AssignmentWithCount[];

    // Build report
    const report: WorkloadReport = {};

    assignments.forEach((assignment) => {
      const teacher = (assignment as AssignmentWithCount).Teacher;
      const subject = (assignment as AssignmentWithCount).Subject;
      const numberOfClasses = parseInt((assignment as AssignmentWithCount).dataValues.numberOfClasses, 10);

      if (!report[teacher?.name]) {
        report[teacher?.name] = [];
      }

      report[teacher?.name].push({
        subjectCode: subject?.subjectCode,
        subjectName: subject?.name,
        numberOfClasses,
      });
    });
    return report;
  }
}


