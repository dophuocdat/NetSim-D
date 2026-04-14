import { Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { LessonPage } from './pages/LessonPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import FundamentalsEncapsulation from './pages/modules/FundamentalsEncapsulation';
import FundamentalsSubnetting from './pages/modules/FundamentalsSubnetting';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="/lesson/:slug" element={<LessonPage />} />
      <Route path="/modules/1/encapsulation" element={<FundamentalsEncapsulation />} />
      <Route path="/modules/1/subnetting" element={<FundamentalsSubnetting />} />
    </Routes>
  );
}
