import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './Contexts/AuthContext.jsx';

import LoginPage from './Screens/LoginPage.jsx';
import RegisterPage from './Screens/RegisterPage.jsx';
import LandingPage from './Screens/LandingPage.jsx';
import Navbar from './Components/navbar.jsx';
import ProtectedRoute from './Contexts/ProtectedRoute.jsx';
import AdminProtectedRoute from './Contexts/AdminProtectedRoute.jsx';

//All for Admin/Organization manager use only.
import AdminMenu from './Screens/Admin/AdminMenu.jsx';
import AddUser from './Screens/Admin/AddUser.jsx';
import ChangeShiftInfo from './Screens/Admin/ChangeShiftInfo.jsx';
import CreateShift from './Screens/Admin/CreateShift.jsx';
import DeleteEmployee from './Screens/Admin/DeleteEmployee.jsx';
import DeleteShift from './Screens/Admin/DeleteShift.jsx';
import UpdateEmployeeRecord from './Screens/Admin/UpdateEmployeeRecord.jsx';
import ViewEmployees from './Screens/Admin/ViewEmployees.jsx';
import ViewShifts from './Screens/Admin/ViewShifts.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<App />} />  {/* Home page */}
          <Route path="/login" element={<LoginPage />} /> {/* Login page */}
          <Route path="/Register" element={<RegisterPage />} /> {/* Register Page */}
            <Route path="/LandingPage" element={<ProtectedRoute>
                                                  <LandingPage />
                                                </ProtectedRoute> } /> {/* Landing page */}
            
            {/* All of these are Admin-only pages. used for direct interaction with the database*/}
            <Route path="/Admin/AdminMenu" element={<AdminProtectedRoute>
                                                <AdminMenu/>
                                              </AdminProtectedRoute>} /> {/* Admin Page, locked by AdminProtectedRoute */}
            <Route path="/Admin" element={<AdminProtectedRoute>
                                                <AdminMenu/>
                                              </AdminProtectedRoute>} /> {/* Alternate path to admin page */}
            <Route path="/Admin/AddUser" element={<AdminProtectedRoute>
                                                <AddUser/>
                                              </AdminProtectedRoute>} /> {/* Admin Page, locked by AdminProtectedRoute */}
            <Route path="/Admin/ChangeShiftInfo" element={<AdminProtectedRoute>
                                                <ChangeShiftInfo/>
                                              </AdminProtectedRoute>} /> {/* Admin Page, locked by AdminProtectedRoute */}
            <Route path="/Admin/CreateShift" element={<AdminProtectedRoute>
                                                <CreateShift/>
                                              </AdminProtectedRoute>} /> {/* Admin Page, locked by AdminProtectedRoute */}
            <Route path="/Admin/DeleteEmployee" element={<AdminProtectedRoute>
                                                <DeleteEmployee/>
                                              </AdminProtectedRoute>} /> {/* Admin Page, locked by AdminProtectedRoute */}
            <Route path="/Admin/DeleteShift" element={<AdminProtectedRoute>
                                                <DeleteShift/>
                                              </AdminProtectedRoute>} /> {/* Admin Page, locked by AdminProtectedRoute */}
            <Route path="/Admin/UpdateEmployeeRecord" element={<AdminProtectedRoute>
                                                <UpdateEmployeeRecord/>
                                              </AdminProtectedRoute>} /> {/* Admin Page, locked by AdminProtectedRoute */}
            <Route path="/Admin/ViewEmployees" element={<AdminProtectedRoute>
                                                <ViewEmployees/>
                                              </AdminProtectedRoute>} /> {/* Admin Page, locked by AdminProtectedRoute */}
            <Route path="/Admin/ViewShifts" element={<AdminProtectedRoute>
                                                <ViewShifts/>
                                              </AdminProtectedRoute>} /> {/* Admin Page, locked by AdminProtectedRoute */}
            
        </Routes>
      </Router>
    </AuthProvider>
  </StrictMode>,
)
