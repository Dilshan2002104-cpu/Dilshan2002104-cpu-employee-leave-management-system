import React, { useState } from 'react';
import { Users, Clock, CheckCircle, Calendar, MoreVertical, Search, Bell, Settings } from 'lucide-react';
import { useEffect } from 'react';
import { API_ENDPOINTS } from "../../config/api";


const DepartmentHeadDashboard = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);

useEffect(() => {
  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.LEAVES_ALL);
      const data = await response.json();

      const headdepartment = sessionStorage.getItem('headDepartement');
      console.log(headdepartment)

      // Filter leave requests that belong to this headdepartment
      const filteredData = data.filter(req => req.department === headdepartment);

      const formatted = filteredData.map(req => ({
        id: req.id,
        type: req.type,
        from: req.startDate,
        to: req.endDate,
        days: req.days,
        status: req.status,
        reason: req.reason,
        employee: req.employeeId,
        avatar: req.employeeId ? req.employeeId.slice(0, 2).toUpperCase() : 'NA',
      }));

      setLeaveRequests(formatted);
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
    }
  };

  fetchLeaveRequests();
}, []);

// ...existing code...

const handleUpdateStatus = async (id, newStatus) => {
  try {
    const response = await fetch(
      API_ENDPOINTS.LEAVES_UPDATE_STATUS(id, newStatus),
      { method: 'PUT' }
    );
    if (!response.ok) throw new Error('Failed to update status');
    setLeaveRequests(prev =>
      prev.map(req => req.id === id ? { ...req, status: newStatus } : req)
    );
  } catch (error) {
    console.error('Error updating leave status:', error);
    // Optionally show an error message to the user
  }
};

const handleApprove = (id) => {
  handleUpdateStatus(id, 'Approved');
};

const handleReject = (id) => {
  handleUpdateStatus(id, 'Rejected');
};

// ...existing code...

  

const stats = [
  {
    title: 'Total Employees',
    value: [...new Set(leaveRequests.map(req => req.employee))].length.toString(),
    icon: Users,
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    change: leaveRequests.length ? 'Active employees with leave records' : 'No employees',
  },
  {
    title: 'Pending Requests',
    value: leaveRequests.filter(req => req.status === 'Pending').length.toString(),
    icon: Clock,
    color: 'bg-gradient-to-br from-amber-500 to-orange-500',
    change: 'No pending requests',
  },
  {
    title: 'Approved This Month',
    value: leaveRequests.filter(req =>
      req.status === 'Approved' &&
      new Date(req.from).getMonth() === new Date().getMonth()
    ).length.toString(),
    icon: CheckCircle,
    color: 'bg-gradient-to-br from-emerald-500 to-green-600',
    change: 'No approvals yet',
  },
];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Department Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage your team's leave requests</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search employees..."
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                      <p className="text-xs text-slate-500 mt-1">{stat.change}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.color} shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Leave Requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Leave Requests</h2>
                <p className="text-slate-600 text-sm mt-1">Review and manage employee leave applications</p>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Calendar className="w-4 h-4" />
                <span>View Calendar</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Leave Details</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {leaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center space-y-3">
                        <Calendar className="w-12 h-12 text-slate-300" />
                        <p className="text-lg font-medium">No leave requests</p>
                        <p className="text-sm">Leave requests will appear here when submitted by employees</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leaveRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {request.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{request.employee}</p>
                            <p className="text-sm text-slate-500">Employee ID: {1000 + request.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{request.type}</p>
                          <p className="text-sm text-slate-500">{request.reason}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{request.from} - {request.to}</p>
                          <p className="text-sm text-slate-500">{request.days} days</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            request.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : request.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {request.status === 'Pending' ? (
                            <>
                              <button
                                onClick={() => handleApprove(request.id)}
                                className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(request.id)}
                                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentHeadDashboard;