import { ClassStudentService } from '../../services/ClassStudentService';
import { TeacherStudentAssignment, Class } from '../../models';
import axios from 'axios';

jest.mock('../../config/logger', () => {
  return jest.fn().mockImplementation(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }));
});

jest.mock('../../models', () => ({
  TeacherStudentAssignment: {
    findAll: jest.fn(),
  },
  Student: {},
  Class: {},
}));

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ClassStudentService', () => {
  let service: ClassStudentService;

  const mockClassRecord = {
    id: 1,
    classCode: 'P1-1',
    name: 'P1 Integrity',
  } as Class;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ClassStudentService();
  });

  it('should return internal students only when no external students', async () => {
    (TeacherStudentAssignment.findAll as jest.Mock).mockResolvedValue([
      { Student: { name: 'Alice', email: 'alice@gmail.com' } },
      { Student: { name: 'Bob', email: 'bob@gmail.com' } },
    ]);

    mockedAxios.get.mockResolvedValue({ data: { students: [] } });

    const result = await service.getStudentsByClass(mockClassRecord);

    expect(result).toHaveLength(2);
    expect(result).toEqual([
      { name: 'Alice', email: 'alice@gmail.com', source: 'internal' },
      { name: 'Bob', email: 'bob@gmail.com', source: 'internal' },
    ]);
  });

  it('should return external students only when no internal students', async () => {
    (TeacherStudentAssignment.findAll as jest.Mock).mockResolvedValue([]);

    mockedAxios.get.mockResolvedValue({
      data: {
        students: [
          { name: 'Charlie', email: 'charlie@gmail.com' },
          { name: 'Diana', email: 'diana@gmail.com' },
        ],
      },
    });

    const result = await service.getStudentsByClass(mockClassRecord);

    expect(result).toHaveLength(2);
    expect(result).toEqual([
      { name: 'Charlie', email: 'charlie@gmail.com', source: 'external' },
      { name: 'Diana', email: 'diana@gmail.com', source: 'external' },
    ]);
  });

  it('should combine internal and external students', async () => {
    (TeacherStudentAssignment.findAll as jest.Mock).mockResolvedValue([
      { Student: { name: 'Alice', email: 'alice@gmail.com' } },
    ]);

    mockedAxios.get.mockResolvedValue({
      data: {
        students: [
          { name: 'Bob', email: 'bob@gmail.com' },
        ],
      },
    });

    const result = await service.getStudentsByClass(mockClassRecord);

    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Alice', source: 'internal' }),
        expect.objectContaining({ name: 'Bob', source: 'external' }),
      ]),
    );
  });

  it('should deduplicate by email with internal taking priority', async () => {
    (TeacherStudentAssignment.findAll as jest.Mock).mockResolvedValue([
      { Student: { name: 'Alice Internal', email: 'alice@gmail.com' } },
    ]);

    mockedAxios.get.mockResolvedValue({
      data: {
        students: [
          { name: 'Alice External', email: 'alice@gmail.com' },
        ],
      },
    });

    const result = await service.getStudentsByClass(mockClassRecord);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: 'Alice Internal',
      email: 'alice@gmail.com',
      source: 'internal',
    });
  });

  it('should include external students without email', async () => {
    (TeacherStudentAssignment.findAll as jest.Mock).mockResolvedValue([]);

    mockedAxios.get.mockResolvedValue({
      data: {
        students: [
          { name: 'No Email Student', email: null },
        ],
      },
    });

    const result = await service.getStudentsByClass(mockClassRecord);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: 'No Email Student',
      email: null,
      source: 'external',
    });
  });

  it('should return internal students when external API fails', async () => {
    (TeacherStudentAssignment.findAll as jest.Mock).mockResolvedValue([
      { Student: { name: 'Alice', email: 'alice@gmail.com' } },
    ]);

    mockedAxios.get.mockRejectedValue(new Error('External API down'));

    const result = await service.getStudentsByClass(mockClassRecord);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: 'Alice',
      email: 'alice@gmail.com',
      source: 'internal',
    });
  });

  it('should return empty array when no students found', async () => {
    (TeacherStudentAssignment.findAll as jest.Mock).mockResolvedValue([]);
    mockedAxios.get.mockResolvedValue({ data: { students: [] } });

    const result = await service.getStudentsByClass(mockClassRecord);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should sort students alphabetically by name', async () => {
    (TeacherStudentAssignment.findAll as jest.Mock).mockResolvedValue([
      { Student: { name: 'Charlie', email: 'charlie@gmail.com' } },
      { Student: { name: 'Alice', email: 'alice@gmail.com' } },
    ]);

    mockedAxios.get.mockResolvedValue({
      data: {
        students: [
          { name: 'Bob', email: 'bob@gmail.com' },
        ],
      },
    });

    const result = await service.getStudentsByClass(mockClassRecord);

    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
    expect(result[2].name).toBe('Charlie');
  });

  it('should call external API with correct params', async () => {
    (TeacherStudentAssignment.findAll as jest.Mock).mockResolvedValue([]);
    mockedAxios.get.mockResolvedValue({ data: { students: [] } });

    await service.getStudentsByClass(mockClassRecord);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/students'),
      {
        params: {
          class: 'P1-1',
          offset: 0,
          limit: 100,
        },
      },
    );
  });

  it('should handle external API returning no students key', async () => {
    (TeacherStudentAssignment.findAll as jest.Mock).mockResolvedValue([
      { Student: { name: 'Alice', email: 'alice@gmail.com' } },
    ]);

    mockedAxios.get.mockResolvedValue({ data: {} });

    const result = await service.getStudentsByClass(mockClassRecord);

    expect(result).toHaveLength(1);
    expect(result[0].source).toBe('internal');
  });
});
