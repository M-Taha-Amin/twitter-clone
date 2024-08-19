import { Link, Navigate, Route, Routes } from 'react-router-dom';
import SignUpPage from './pages/auth/signup/SignUpPage';
import LoginPage from './pages/auth/login/LoginPage';
import NotificationPage from './pages/notification/NotificationPage';
import ProfilePage from './pages/profile/ProfilePage';
import HomePage from './pages/home/HomePage';
import Sidebar from './components/common/Sidebar';
import RightPanel from './components/common/RightPanel';
import { Toaster } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from './components/common/LoadingSpinner';

const App = () => {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ['getAuthUser'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (!response.ok) {
        return null;
      }
      return data;
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="flex max-w-6xl mx-auto">
      {authUser && <Sidebar />}
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/notifications"
          element={authUser ? <NotificationPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile/:username"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/*"
          element={
            <div className="flex min-h-screen flex-col items-center justify-center w-full p-0">
              <p className="text-2xl font-semibold">404 | Page not found</p>
              <Link
                to={authUser ? '/' : '/login'}
                className="mt-4 text-lg hover:text-blue-500">
                Go Back
              </Link>
            </div>
          }
        />
      </Routes>
      {authUser && <RightPanel />}
      <Toaster />
    </div>
  );
};
export default App;
