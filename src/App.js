
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollTop';
import { Toaster } from 'react-hot-toast';
// import Signup from './components/SignUp';
import UsersDetails from "./Admin/UserDetails";
import AdminDashboard from "./Admin/AdminDashboard";
import ProtectedRoute from "./Admin/ProtectedRoute";
import Analytics from "./Admin/Analytics";
// User components
import NotFound from './pages/NotFound';
import Sales from './pages/Sales';
import Stock from './pages/Stock';
import Home from './pages/Home';
import Profile from './pages/Profile';
import ManageDistributors from './Admin/ManageDistributors';
import ManageStock from './Admin/ManageStock';
import ManageSales from './Admin/ManageSales';
import Registration from './pages/Registration';

const App = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const isLoggedIn = !!token;
  const isAdmin = user?.isAdmin;

  // Paths where Navbar/Footer should be hidden
  const hideNavAndFooterPaths = ['/', '/admin'];

  const shouldHideNavAndFooter = hideNavAndFooterPaths.includes(location.pathname);

  return (
    <div>
      <ScrollToTop />
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          success: {
            style: {
              background: '#D1FAE5',
              color: '#065F46',
            },
          },
          error: {
            style: {
              background: '#FEE2E2',
              color: '#991B1B',
            },
          },
        }}
      />

      {/* Conditionally show Navbar */}
      {!shouldHideNavAndFooter && isLoggedIn && !isAdmin && <Navbar setIsLoggedIn={() => {}} />}

      <Routes>
        <Route path="/" element={<Login onLogin={() => {}} />} />

        {isLoggedIn && !isAdmin && (
          <>
            <Route path="/home" element={<Home />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/profile" element={<Profile />} />
            {/* <Route path="/massage" element={<Massage />} /> */}
            <Route path="/registration" element={<Registration />} />
          </>
        )}

        {/* Admin Routes */}
        <Route path="/admin" element={<Login />} />
        <Route
          path="/admin/dashboard/*"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="users" replace />} />
          <Route path="users" element={<UsersDetails />} />
          {/* <Route path="usersignup" element={<Signup />} /> */}
          <Route path="sales" element={<ManageSales />} />
          <Route path="stock" element={<ManageStock />} />
          <Route path="dist" element={<ManageDistributors />} />
          <Route path="analytics" element={<Analytics />} />
          {/* <Route path="massage" element={<ManageMassage />} /> */}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Conditionally show Footer */}
      {!shouldHideNavAndFooter && isLoggedIn && !isAdmin && <Footer />}
    </div>
  );
};

export default App;
