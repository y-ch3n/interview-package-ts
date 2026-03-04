export interface TeacherStudentAssignment {
  id: number;
  teacherId: number;
  studentId: number;
  classId: number;
  subjectId: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
