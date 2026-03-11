// API response types

export interface ClassItem {
  id: number
  classCode: string
  name: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

export interface Pagination {
  currentPage: number
  totalPages: number
  totalRecords: number
  limit: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface ClassesResponse {
  message: string
  data: ClassItem[]
  pagination: Pagination
}

export interface CombinedStudent {
  name: string
  email?: string | null
  source: 'internal' | 'external'
}

export interface StudentsResponse {
  message: string
  data: CombinedStudent[]
  pagination: Pagination
}

export interface WorkloadItem {
  subjectCode: string
  subjectName: string
  numberOfClasses: number
}

export interface WorkloadReport {
  [teacherName: string]: WorkloadItem[]
}

export interface UploadResponse {
  status: number
  message: string
}
