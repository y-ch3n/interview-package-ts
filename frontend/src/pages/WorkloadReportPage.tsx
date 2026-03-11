import { useState } from 'react'
import { getWorkloadReport } from '../api/reports'
import type { WorkloadReport } from '../types'

export default function WorkloadReportPage() {
  const [emailFilter, setEmailFilter] = useState('')
  const [report, setReport] = useState<WorkloadReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReport = async () => {
    setLoading(true)
    setError(null)
    setReport(null)
    try {
      const data = await getWorkloadReport(emailFilter.trim() || undefined)
      setReport(data)
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
      ) {
        setError((err as { response: { data: { message: string } } }).response.data.message)
      } else {
        setError('Failed to load report. Make sure the backend is running.')
      }
    } finally {
      setLoading(false)
    }
  }

  const teachers = report ? Object.keys(report) : []

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Teacher Workload Report</h1>

      <div className="flex gap-3 mb-6">
        <input
          type="email"
          placeholder="Filter by teacher email (optional)"
          value={emailFilter}
          onChange={e => setEmailFilter(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchReport()}
          className="border rounded px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          onClick={fetchReport}
          disabled={loading}
          className="px-5 py-2 bg-indigo-600 text-white rounded font-medium text-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load Report'}
        </button>
        {emailFilter && (
          <button
            onClick={() => { setEmailFilter(''); setReport(null); setError(null) }}
            className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-100"
          >
            Clear
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {report !== null && teachers.length === 0 && (
        <div className="text-gray-500">No workload data found.</div>
      )}

      {report && teachers.length > 0 && (
        <div className="space-y-6">
          {teachers.map(teacher => (
            <div key={teacher} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-100">
                <h2 className="font-semibold text-indigo-800">{teacher}</h2>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Code</th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Name</th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. of Classes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report[teacher].map(item => (
                    <tr key={item.subjectCode} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-mono text-gray-700">{item.subjectCode}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{item.subjectName}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{item.numberOfClasses}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
