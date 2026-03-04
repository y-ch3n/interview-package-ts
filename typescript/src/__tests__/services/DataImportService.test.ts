import { DataImportService } from '../../services/DataImportService';
import { Teacher, Student, Class, Subject, TeacherStudentAssignment } from '../../models';
import sequelize from '../../config/database';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    transaction: jest.fn(),
  },
}));

jest.mock('../../models', () => ({
  Teacher: {
    findOrCreate: jest.fn(),
  },
  Student: {
    findOrCreate: jest.fn(),
  },
  Class: {
    findOrCreate: jest.fn(),
  },
  Subject: {
    findOrCreate: jest.fn(),
  },
  TeacherStudentAssignment: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

describe('DataImportService', () => {
  let service: DataImportService;
  let mockTransaction: { commit: jest.Mock; rollback: jest.Mock };

  const mockItem = {
    teacherEmail: 'teacher7@gmail.com',
    teacherName: 'Teacher 7',
    studentEmail: 'student7@gmail.com',
    studentName: 'Student 7',
    classCode: 'P7-1',
    classname: 'P7 Integrity',
    subjectCode: 'MATHS',
    subjectName: 'Mathematics',
    toDelete: '0',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DataImportService();
    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };
    (sequelize.transaction as jest.Mock).mockResolvedValue(mockTransaction);

    const mockTeacher = { id: 1, name: 'Teacher 7', save: jest.fn() };
    const mockStudent = { id: 1, name: 'Student 7', save: jest.fn() };
    const mockClass = { id: 1, classCode: 'P7-1', name: 'P7 Integrity', save: jest.fn() };
    const mockSubject = { id: 1, subjectCode: 'MATHS', name: 'Mathematics', save: jest.fn() };

    (Teacher.findOrCreate as jest.Mock).mockResolvedValue([mockTeacher, true]);
    (Student.findOrCreate as jest.Mock).mockResolvedValue([mockStudent, true]);
    (Class.findOrCreate as jest.Mock).mockResolvedValue([mockClass, true]);
    (Subject.findOrCreate as jest.Mock).mockResolvedValue([mockSubject, true]);
    (TeacherStudentAssignment.findOne as jest.Mock).mockResolvedValue(null);
    (TeacherStudentAssignment.create as jest.Mock).mockResolvedValue({});
  });

  it('should create a new assignment', async () => {
    await service.importData([mockItem]);

    expect(Teacher.findOrCreate).toHaveBeenCalledWith({
      where: { email: 'teacher7@gmail.com' },
      defaults: { email: 'teacher7@gmail.com', name: 'Teacher 7' },
      transaction: mockTransaction,
    });
    expect(Student.findOrCreate).toHaveBeenCalledWith({
      where: { email: 'student7@gmail.com' },
      defaults: { email: 'student7@gmail.com', name: 'Student 7' },
      transaction: mockTransaction,
    });
    expect(Class.findOrCreate).toHaveBeenCalledWith({
      where: { classCode: 'P7-1' },
      defaults: { classCode: 'P7-1', name: 'P7 Integrity' },
      transaction: mockTransaction,
    });
    expect(Subject.findOrCreate).toHaveBeenCalledWith({
      where: { subjectCode: 'MATHS' },
      defaults: { subjectCode: 'MATHS', name: 'Mathematics' },
      transaction: mockTransaction,
    });
    expect(TeacherStudentAssignment.create).toHaveBeenCalled();
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('should not create assignment when toDelete is 1', async () => {
    const deleteItem = { ...mockItem, toDelete: '1' };

    await service.importData([deleteItem]);

    expect(TeacherStudentAssignment.create).not.toHaveBeenCalled();
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('should soft delete existing assignment when toDelete is 1', async () => {
    const mockDestroy = jest.fn();
    (TeacherStudentAssignment.findOne as jest.Mock).mockResolvedValue({
      destroy: mockDestroy,
      deletedAt: null,
    });

    const deleteItem = { ...mockItem, toDelete: '1' };
    await service.importData([deleteItem]);

    // Verify it searched for the assignment including soft-deleted records
    expect(TeacherStudentAssignment.findOne).toHaveBeenCalledWith({
      where: {
        teacherId: 1,
        studentId: 1,
        classId: 1,
        subjectId: 1,
      },
      paranoid: false,
      transaction: mockTransaction,
    });

    // Verify it was destroyed
    expect(mockDestroy).toHaveBeenCalledWith({ transaction: mockTransaction });
    expect(TeacherStudentAssignment.create).not.toHaveBeenCalled();
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('should restore soft-deleted assignment when toDelete is 0', async () => {
    const mockRestore = jest.fn();
    (TeacherStudentAssignment.findOne as jest.Mock).mockResolvedValue({
      deletedAt: new Date(),
      restore: mockRestore,
    });

    await service.importData([mockItem]);

    expect(mockRestore).toHaveBeenCalledWith({ transaction: mockTransaction });
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('should rollback transaction on error', async () => {
    (Teacher.findOrCreate as jest.Mock).mockRejectedValue(new Error('DB error'));

    await expect(service.importData([mockItem])).rejects.toThrow('DB error');

    expect(mockTransaction.rollback).toHaveBeenCalled();
    expect(mockTransaction.commit).not.toHaveBeenCalled();
  });
});
