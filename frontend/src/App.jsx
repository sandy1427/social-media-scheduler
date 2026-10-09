import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ConnectedAccounts from './pages/ConnectedAccounts';
import OAuthSimulator from './pages/OAuthSimulator';
import CreatePost from './pages/CreatePost';
import MyPosts from './pages/MyPosts';
import Calendar from './pages/Calendar';
import Notifications from './pages/Notifications';
import Analytics from './pages/Analytics';
import AIAssistant from './pages/AIAssistant';
import MockProfile from './pages/MockProfile';
import DashboardLayout from './layouts/DashboardLayout';

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
      
      {/* OAuth Simulator Route */}
      <Route path="/oauth-simulator" element={<OAuthSimulator />} />
      <Route path="/mock-profile/:platform/:username" element={<MockProfile />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/connected-accounts" element={<ConnectedAccounts />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/posts" element={<MyPosts />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
        </Route>
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
