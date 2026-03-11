import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getClassStudents } from '../api/students'
import Pagination from '../components/Pagination'
import type { CombinedStudent } from '../types'

const PAGE_SIZE = 10

export default function ClassStudentsPage() {
  const { classCode } = useParams<{ classCode: string }>()
  const [students, setStudents] = useState<CombinedStudent[]>([])
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPage = async (page: number) => {
    if (!classCode) return
    setLoading(true)
    setError(null)
    try {
      const offset = (page - 1) * PAGE_SIZE
      const res = await getClassStudents(classCode, offset, PAGE_SIZE)
      setStudents(res.data)
      setPagination({
        currentPage: res.pagination.currentPage,
        totalPages: res.pagination.totalPages,
        totalRecords: res.pagination.totalRecords,
      })
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { status?: number } }).response?.status === 'number' &&
        (err as { response: { status: number } }).response.status === 404
      ) {
        setError(`Class "${classCode}" not found.`)
      } else {
        setError('Failed to load students. Make sure the backend is running.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPage(1) }, [classCode])

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="text-indigo-600 hover:underline text-sm">← Classes</Link>
        <h1 className="text-2xl font-semibold text-gray-800">
          Students — <span className="font-mono">{classCode}</span>
        </h1>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.length === 0 && !error && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No students found.</td>
                  </tr>
                )}
                {students.map((student, idx) => (
                  <tr key={`${student.email ?? student.name}-${idx}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {(pagination.currentPage - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{student.email ?? '—'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          student.source === 'internal'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {student.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-gray-500">{pagination.totalRecords} student(s) total</span>
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={fetchPage}
            />
          </div>
        </>
      )}
    </div>
  )
}
