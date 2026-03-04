import { TeacherStudentAssignment, Student, Class } from '../models';
import axios from 'axios';
import { ExternalStudent } from 'ExternalStudent';
import { CombinedStudent } from 'CombinedStudent';
import Logger from '../config/logger';

const EXTERNAL_BASE_URL = process.env.EXTERNAL_BASE_URL || 'http://localhost:5001';
const LOG = new Logger('ClassStudentService.js');

export class ClassStudentService {
  async getStudentsByClass(classRecord: Class): Promise<CombinedStudent[]> {
    // Fetch internal students
    const internalAssignments = await TeacherStudentAssignment.findAll({
      where: { classId: classRecord.id },
      include: [
        { model: Student, attributes: ['email', 'name'] },
      ],
    });

    const internalStudents: CombinedStudent[] = internalAssignments.map((assignment) => {
      const student = (assignment as TeacherStudentAssignment).Student;
      return {
        name: student?.name,
        email: student?.email,
        source: 'internal' as const,
      } as CombinedStudent;
    });

    // Fetch external students
    let externalStudents: CombinedStudent[] = [];
    try {
      const response = await axios.get(`${EXTERNAL_BASE_URL}/students`, {
        params: {
          class: classRecord.classCode,
          offset: 0,
          limit: 100,
        },
      });

      externalStudents = (response.data.students || []).map((student: ExternalStudent) => ({
        name: student.name,
        email: student.email || null,
        source: 'external' as const,
      }));
    } catch (error) {
      LOG.error(`Failed to fetch external students: ${error}`);
      // Continue with internal students only
    }

    // Combine and deduplicate by email
    const studentMap = new Map<string, CombinedStudent>();

    internalStudents.forEach((student) => {
      if (student.email) {
        studentMap.set(student.email, student);
      }
    });

    externalStudents.forEach((student) => {
      if (student.email && !studentMap.has(student.email)) {
        studentMap.set(student.email, student);
      } else if (!student.email) {
        studentMap.set(`ext_${student.name}`, student);
      }
    });

    const allStudents = Array.from(studentMap.values());

    // Sort by name alphabetically
    allStudents.sort((a, b) => a.name.localeCompare(b.name));
    return allStudents;
  }
}
