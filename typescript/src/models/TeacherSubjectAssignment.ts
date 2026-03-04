import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { Teacher, Student, Class, Subject } from '.';
import { TeacherStudentAssignment as TeacherStudentAssignmentAttributes } from 'TeacherStudentAssignment';

type TeacherStudentAssignmentCreationAttributes = Optional<TeacherStudentAssignmentAttributes, 'id'>;

class TeacherStudentAssignment
  extends Model<TeacherStudentAssignmentAttributes, TeacherStudentAssignmentCreationAttributes>
  implements TeacherStudentAssignmentAttributes
{
  public id!: number;
  public teacherId!: number;
  public studentId!: number;
  public classId!: number;
  public subjectId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
  public readonly Teacher?: Teacher;
  public readonly Student?: Student;
  public readonly Class?: Class;
  public readonly Subject?: Subject;
}

TeacherStudentAssignment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subjectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'teacher_student_assignments',
    timestamps: true,
    paranoid: true,
  }
);

// Associations
TeacherStudentAssignment.belongsTo(Teacher, { foreignKey: 'teacherId' });
TeacherStudentAssignment.belongsTo(Student, { foreignKey: 'studentId' });
TeacherStudentAssignment.belongsTo(Class, { foreignKey: 'classId' });
TeacherStudentAssignment.belongsTo(Subject, { foreignKey: 'subjectId' });

Teacher.hasMany(TeacherStudentAssignment, { foreignKey: 'teacherId' });
Student.hasMany(TeacherStudentAssignment, { foreignKey: 'studentId' });
Class.hasMany(TeacherStudentAssignment, { foreignKey: 'classId' });
Subject.hasMany(TeacherStudentAssignment, { foreignKey: 'subjectId' });

export default TeacherStudentAssignment;
