import client from './client'
import type { UploadResponse } from '../types'

export async function uploadCsv(file: File): Promise<UploadResponse> {
  const form = new FormData()
  form.append('data', file)
  const res = await client.post<UploadResponse>('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}
