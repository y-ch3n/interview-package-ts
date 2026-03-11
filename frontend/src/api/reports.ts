import client from './client'
import type { WorkloadReport } from '../types'

export async function getWorkloadReport(teacherEmail?: string): Promise<WorkloadReport> {
  const params: Record<string, string> = {}
  if (teacherEmail) params.teacherEmail = teacherEmail
  const res = await client.get<WorkloadReport>('/reports/workload', { params })
  return res.data
}
