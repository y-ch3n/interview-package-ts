import { WorkloadReportService } from '../../services/WorkloadReportService';
import { TeacherStudentAssignment, Teacher, Subject } from '../../models';

jest.mock('../../models', () => ({
  TeacherStudentAssignment: {
    findAll: jest.fn(),
  },
  Teacher: {},
  Subject: {},
}));

describe('WorkloadReportService', () => {
  let service: WorkloadReportService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new WorkloadReportService();
  });

  it('should return an empty report when there are no assignments', async () => {
    (TeacherStudentAssignment.findAll as jest.Mock).mockResolvedValue([]);

    const result = await service.getWorkloadReport({});

    expect(result).toEqual({});
    expect(TeacherStudentAssignment.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return a report grouped by teacher with subject details', async () => {
    (TeacherStudentAssignment.findAll as jest.Mock).mockResolvedValue([
      {
        teacherId: 1,
        subjectId: 1,
        Teacher: { name: 'Teacher A' },
        Subject: { subjectCode: 'MATHS', name: 'Mathematics' },
        dataValues: { numberOfClasses: '3' },
      },
      {
        teacherId: 1,
        subjectId: 2,
        Teacher: { name: 'Teacher A' },
        Subject: { subjectCode: 'SCI', name: 'Science' },
        dataValues: { numberOfClasses: '2' },
      },
    ]);

    const result = await service.getWorkloadReport({});

    expect(result).toEqual({
      'Teacher A': [
        { subjectCode: 'MATHS', subjectName: 'Mathematics', numberOfClasses: 3 },
        { subjectCode: 'SCI', subjectName: 'Science', numberOfClasses: 2 },
      ],
    });
  });

  it('should handle multiple teachers', async () => {
    (TeacherStudentAssignment.findAll as jest.Mock).mockResolvedValue([
      {
        teacherId: 1,
        subjectId: 1,
        Teacher: { name: 'Teacher A' },
        Subject: { subjectCode: 'MATHS', name: 'Mathematics' },
        dataValues: { numberOfClasses: '2' },
      },
      {
        teacherId: 2,
        subjectId: 1,
        Teacher: { name: 'Teacher B' },
        Subject: { subjectCode: 'MATHS', name: 'Mathematics' },
        dataValues: { numberOfClasses: '1' },
      },
    ]);

    const result = await service.getWorkloadReport({});

    expect(result).toEqual({
      'Teacher A': [
        { subjectCode: 'MATHS', subjectName: 'Mathematics', numberOfClasses: 2 },
      ],
      'Teacher B': [
        { subjectCode: 'MATHS', subjectName: 'Mathematics', numberOfClasses: 1 },
      ],
    });
  });

  it('should pass the where clause to findAll', async () => {
    (TeacherStudentAssignment.findAll as jest.Mock).mockResolvedValue([]);

    await service.getWorkloadReport({ teacherId: 5 });

    expect(TeacherStudentAssignment.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { teacherId: 5 },
      }),
    );
  });

  it('should include Teacher and Subject models in the query', async () => {
    (TeacherStudentAssignment.findAll as jest.Mock).mockResolvedValue([]);

    await service.getWorkloadReport({});

    expect(TeacherStudentAssignment.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        include: [
          { model: Teacher, attributes: ['name'] },
          { model: Subject, attributes: ['subjectCode', 'name'] },
        ],
      }),
    );
  });

  it('should group by teacherId, subjectId, Teacher.id, and Subject.id', async () => {
    (TeacherStudentAssignment.findAll as jest.Mock).mockResolvedValue([]);

    await service.getWorkloadReport({});

    expect(TeacherStudentAssignment.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        group: ['teacherId', 'subjectId', 'Teacher.id', 'Subject.id'],
      }),
    );
  });

  it('should parse numberOfClasses as an integer', async () => {
    (TeacherStudentAssignment.findAll as jest.Mock).mockResolvedValue([
      {
        teacherId: 1,
        subjectId: 1,
        Teacher: { name: 'Teacher A' },
        Subject: { subjectCode: 'ENG', name: 'English' },
        dataValues: { numberOfClasses: '7' },
      },
    ]);

    const result = await service.getWorkloadReport({});

    expect(result['Teacher A'][0].numberOfClasses).toBe(7);
    expect(typeof result['Teacher A'][0].numberOfClasses).toBe('number');
  });

  it('should propagate errors from the database', async () => {
    (TeacherStudentAssignment.findAll as jest.Mock).mockRejectedValue(
      new Error('DB connection failed'),
    );

    await expect(service.getWorkloadReport({})).rejects.toThrow('DB connection failed');
  });
});
