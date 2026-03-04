import { TeacherStudentAssignment, Teacher, Subject } from '../models';
export interface AssignmentWithCount extends TeacherStudentAssignment {
  Teacher: Teacher;
  Subject: Subject;
  dataValues: {
    numberOfClasses: string;
  };
}
