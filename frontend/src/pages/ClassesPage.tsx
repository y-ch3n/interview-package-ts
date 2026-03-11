import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getClasses, updateClass } from '../api/classes'
import Pagination from '../components/Pagination'
import type { ClassItem } from '../types'

const PAGE_SIZE = 10

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Inline edit state
  const [editingCode, setEditingCode] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const fetchPage = async (page: number) => {
    setLoading(true)
    setError(null)
    try {
      const offset = (page - 1) * PAGE_SIZE
      const res = await getClasses(offset, PAGE_SIZE)
      setClasses(res.data)
      setPagination({
        currentPage: res.pagination.currentPage,
        totalPages: res.pagination.totalPages,
        totalRecords: res.pagination.totalRecords,
      })
    } catch {
      setError('Failed to load classes. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPage(1) }, [])

  const startEdit = (cls: ClassItem) => {
    setEditingCode(cls.classCode)
    setEditValue(cls.name)
    setSaveError(null)
  }

  const cancelEdit = () => {
    setEditingCode(null)
    setEditValue('')
    setSaveError(null)
  }

  const saveEdit = async (classCode: string) => {
    if (!editValue.trim()) return
    setSaving(true)
    setSaveError(null)
    try {
      const updated = await updateClass(classCode, editValue.trim())
      setClasses(prev => prev.map(c => (c.classCode === classCode ? updated : c)))
      setEditingCode(null)
    } catch {
      setSaveError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Classes</h1>

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classes.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400">No classes found.</td>
                  </tr>
                )}
                {classes.map(cls => (
                  <tr key={cls.classCode} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-700">
                      <Link
                        to={`/class/${cls.classCode}/students`}
                        className="text-indigo-600 hover:underline"
                      >
                        {cls.classCode}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {editingCode === cls.classCode ? (
                        <div>
                          <input
                            autoFocus
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveEdit(cls.classCode)
                              if (e.key === 'Escape') cancelEdit()
                            }}
                            className="border border-indigo-400 rounded px-2 py-1 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          />
                          {saveError && <p className="text-red-500 text-xs mt-1">{saveError}</p>}
                        </div>
                      ) : (
                        cls.name
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {editingCode === cls.classCode ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(cls.classCode)}
                            disabled={saving}
                            className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={saving}
                            className="px-3 py-1 border rounded text-xs hover:bg-gray-100 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(cls)}
                            className="px-3 py-1 border border-indigo-300 text-indigo-600 rounded text-xs hover:bg-indigo-50"
                          >
                            Edit
                          </button>
                          <Link
                            to={`/class/${cls.classCode}/students`}
                            className="px-3 py-1 border border-gray-300 text-gray-600 rounded text-xs hover:bg-gray-100"
                          >
                            View Students
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-gray-500">{pagination.totalRecords} class(es) total</span>
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
