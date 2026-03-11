import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ClassesPage from './pages/ClassesPage'
import ClassStudentsPage from './pages/ClassStudentsPage'
import UploadPage from './pages/UploadPage'
import WorkloadReportPage from './pages/WorkloadReportPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<ClassesPage />} />
          <Route path="class/:classCode/students" element={<ClassStudentsPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="reports/workload" element={<WorkloadReportPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
