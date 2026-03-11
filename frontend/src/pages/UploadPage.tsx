import { useRef, useState } from 'react'
import { uploadCsv } from '../api/upload'

export default function UploadPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setSelectedFile(file)
    setStatus('idle')
    setMessage(null)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0] ?? null
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file)
      setStatus('idle')
      setMessage(null)
    }
  }

  const handleSubmit = async () => {
    if (!selectedFile) return
    setStatus('loading')
    setMessage(null)
    try {
      const res = await uploadCsv(selectedFile)
      setStatus('success')
      setMessage(res.message)
    } catch (err: unknown) {
      setStatus('error')
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
      ) {
        setMessage((err as { response: { data: { message: string } } }).response.data.message)
      } else {
        setMessage('Upload failed. Please try again.')
      }
    }
  }

  const reset = () => {
    setSelectedFile(null)
    setStatus('idle')
    setMessage(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">Data Import</h1>
      <p className="text-sm text-gray-500 mb-6">
        Upload a CSV file to create, update, or delete teacher–student assignments.
        The file must have the columns:<br />
        <span className="font-mono text-xs">teacherEmail, teacherName, studentEmail, studentName, classCode, classname, subjectCode, subjectName, toDelete</span>
      </p>

      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer bg-white"
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />
        {selectedFile ? (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-800">{selectedFile.name}</p>
            <p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-500">Drag &amp; drop a CSV file here, or click to browse</p>
            <p className="text-xs text-gray-400">.csv files only</p>
          </div>
        )}
      </div>

      {status === 'success' && (
        <div className="mt-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded">
          {message}
        </div>
      )}
      {status === 'error' && (
        <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {message}
        </div>
      )}

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={!selectedFile || status === 'loading'}
          className="px-5 py-2 bg-indigo-600 text-white rounded font-medium text-sm hover:bg-indigo-700 disabled:opacity-40"
        >
          {status === 'loading' ? 'Uploading...' : 'Upload'}
        </button>
        {(selectedFile || status !== 'idle') && (
          <button
            onClick={reset}
            className="px-5 py-2 border border-gray-300 rounded text-sm hover:bg-gray-100"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
