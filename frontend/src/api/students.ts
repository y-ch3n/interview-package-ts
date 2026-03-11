import client from './client'
import type { StudentsResponse } from '../types'

export async function getClassStudents(classCode: string, offset = 0, limit = 10): Promise<StudentsResponse> {
  const res = await client.get<StudentsResponse>(`/class/${classCode}/students`, { params: { offset, limit } })
  return res.data
}
