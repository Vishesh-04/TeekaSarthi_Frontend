import React from 'react';
import { Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import AuthPage from "./pages/AuthPage";
import ForgotPassword from './pages/ForgotPassword';
import DashboardHome from './components/DashboardHome';
import SchedulePage from './pages/SchedulePage';
import Footer from "./components/Footer";
import Navbar from './components/Navbar';

import WorkerLogin from './pages/workers/WorkerLogin';
import WorkerDashboard from './pages/workers/Workerdashboard';
import PendingBeneficiaries from './pages/workers/PendingBeneficiaries';
// import VaccinationEntry from './pages/workers/VaccinationEntry';
import LocateAnganwadiCenter from './pages/LocateAnganwadiCenter';
import AddBeneficiarySelection from './pages/AddBeneficiarySelection';
import PersonalInformationForm from './pages/PersonalInformationForm';
import WorkerProtectedRoute from './components/WorkerProtectedRoute';
import BeneficiaryProtectedRoute from './components/BeneficiaryProtectedRoute';

import Nav from './components/Nav';

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <LandingPage />
            <Footer />
          </>
        }
      />

      <Route
        path="/login"
        element={
          <>
            <AuthPage />
            <Footer />
          </>
        }
      />

      <Route
        path="/register"
        element={
          <>
            <AuthPage />
            <Footer />
          </>
        }
      />

      <Route
        path="/workerlogin"
        element={
          <>
            <WorkerLogin />
            <Footer />
          </>
        }
      />

      <Route
        path="/worker/dashboard"
        element={
          <WorkerProtectedRoute>
            <WorkerDashboard />
            <Footer />
          </WorkerProtectedRoute>
        }
      />
      <Route
        path="/worker/pending-beneficiaries"
        element={
          <WorkerProtectedRoute>
            <PendingBeneficiaries />
            <Footer />
          </WorkerProtectedRoute>
        }
      />

      <Route
        path="/add-beneficiary"
        element={
          <BeneficiaryProtectedRoute>
            <Nav />
            <AddBeneficiarySelection />
            <Footer />
          </BeneficiaryProtectedRoute>
        }
      />

      <Route
        path="/locate-center"
        element={
          <BeneficiaryProtectedRoute>
            <Nav />
            <LocateAnganwadiCenter />
            <Footer />
          </BeneficiaryProtectedRoute>
        }
      />
      <Route
        path="/beneficiary-info"
        element={
          <BeneficiaryProtectedRoute>
            <Nav />
            <PersonalInformationForm />
            <Footer />
          </BeneficiaryProtectedRoute>
        }
      />

      {/* <Route path="/worker/vaccination-entry" element={<VaccinationEntry />} /> */}

      <Route
        path="/forgot-password"
        element={
          <>
            <ForgotPassword />
            <Footer />
          </>
        }
      />

      <Route
        path="/dashboard"
        element={
          <BeneficiaryProtectedRoute>
            <Navbar />
            <DashboardHome />
            <Footer />
          </BeneficiaryProtectedRoute>
        }
      />

      <Route
        path="/dashboard/register"
        element={
          <BeneficiaryProtectedRoute>
            <Navbar />
            <DashboardHome />
            <Footer />
          </BeneficiaryProtectedRoute>
        }
      />

      <Route
        path="/schedule"
        element={
          <BeneficiaryProtectedRoute>
            <SchedulePage />
          </BeneficiaryProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;