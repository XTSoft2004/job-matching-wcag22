import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateJob from './pages/CreateJob';
import JobDetails from './pages/JobDetails';
import { AuthProvider } from './contexts/AuthContext';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminJobs from './pages/AdminJobs';
import EmployerJobs from './pages/EmployerJobs';
import EmployerApplicants from './pages/EmployerApplicants';
import CandidateApplied from './pages/CandidateApplied';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dang-tin" element={<CreateJob />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/jobs" element={<AdminJobs />} />
            <Route path="/employer/jobs" element={<EmployerJobs />} />
            <Route path="/employer/applicants" element={<EmployerApplicants />} />
            <Route path="/candidate/applied" element={<CandidateApplied />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
