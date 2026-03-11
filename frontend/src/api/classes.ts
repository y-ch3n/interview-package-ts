import client from './client'
import type { ClassesResponse, ClassItem } from '../types'

export async function getClasses(offset = 0, limit = 10): Promise<ClassesResponse> {
  const res = await client.get<ClassesResponse>('/classes', { params: { offset, limit } })
  return res.data
}

export async function updateClass(classCode: string, className: string): Promise<ClassItem> {
  const res = await client.put<{ message: string; data: ClassItem }>(`/class/${classCode}`, { className })
  return res.data.data
}
