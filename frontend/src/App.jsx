import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EmployeeRegistrationForm from "./Pages/Forms/EmployeeRegistrationForm";
import EmployeeLoginForm from "./Pages/Forms/EmployeeLoginForm";
import EmployeeDashboard from "./Pages/dashboard/EmployeeDashboard";
import HeadsLoginForm from "./Pages/Forms/HeadsLoginForm";
import SystemAdminDashboard from "./Pages/dashboard/SystemAdminDashboard";
import DepartmentHeadDashboard from "./Pages/dashboard/DepartmentHeadDashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EmployeeRegistrationForm />} />
        <Route path="/register" element={<EmployeeRegistrationForm />} />
        <Route path="/login" element={<EmployeeLoginForm />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard/>}/>
        <Route path="/heads-login" element={<HeadsLoginForm/>}/>
        <Route path="/admin" element={<SystemAdminDashboard/>}/>
        <Route path="/head-dashboard" element={<DepartmentHeadDashboard/>}/>
      </Routes>
    </Router>
  );
};

export default App;
