import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import CreateJob from './pages/CreateJob';
import JobDetails from './pages/JobDetails';
import SearchResults from './pages/SearchResults';
import { AuthProvider } from './contexts/AuthContext';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminJobs from './pages/AdminJobs';
import EmployerJobs from './pages/EmployerJobs';
import EmployerApplicants from './pages/EmployerApplicants';
import CandidateApplied from './pages/CandidateApplied';

// Custom pages built inside note directory
import GrossToNet from './pages/note/GrossToNet';
import CvBuilder from './pages/note/CvBuilder';
import CareerHandbook from './pages/note/CareerHandbook';
import CandidateSearch from './pages/note/CandidateSearch';
import AiHrSolutions from './pages/note/AiHrSolutions';
import TermsAndPolicies from './pages/note/TermsAndPolicies';
import WcagReport from './pages/note/WcagReport';
import EmployerBadge from './pages/note/EmployerBadge';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/dang-tin" element={<CreateJob />} />
            <Route path="/jobs" element={<SearchResults />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/jobs" element={<AdminJobs />} />
            <Route path="/employer/jobs" element={<EmployerJobs />} />
            <Route path="/employer/applicants" element={<EmployerApplicants />} />
            <Route path="/candidate/applied" element={<CandidateApplied />} />
            
            {/* Custom page routes */}
            <Route path="/cv-builder" element={<CvBuilder />} />
            <Route path="/gross-to-net" element={<GrossToNet />} />
            <Route path="/career-handbook" element={<CareerHandbook />} />
            <Route path="/candidate-search" element={<CandidateSearch />} />
            <Route path="/ai-hr-solutions" element={<AiHrSolutions />} />
            <Route path="/terms-and-policies" element={<TermsAndPolicies />} />
            <Route path="/wcag-report" element={<WcagReport />} />
            <Route path="/employer-badge" element={<EmployerBadge />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
