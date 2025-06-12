import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Plus,
  User,
  FileText,
  TrendingUp,
  AlertCircle,
  LogOut,
  Home,
  Settings,
} from "lucide-react";
import axios from "axios";

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    const employeeId = sessionStorage.getItem("employeeId");
    if (!employeeId) return;

    axios
      .get(`http://localhost:8080/api/leaves/by-employee/${employeeId}`)
      .then((response) => {
        const requests = response.data.map((req, idx) => ({
          id: req.id || idx + 1,
          type: req.type,
          startDate: req.startDate,
          endDate: req.endDate,
          reason: req.reason,
          days:
            req.startDate && req.endDate
              ? Math.ceil(
                  (new Date(req.endDate) - new Date(req.startDate)) /
                    (1000 * 60 * 60 * 24)
                ) + 1
              : 1,
          status: req.status || "pending",
          appliedDate: req.appliedDate || req.createdAt || "",
          rejectionReason: req.rejectionReason || "",
        }));
        setLeaveRequests(requests);

        // Optionally, update leave balance based on fetched requests
        const used = requests
          .filter((r) => r.status === "approved")
          .reduce((sum, r) => sum + r.days, 0);
        setLeaveBalance((prev) => ({
          ...prev,
          used,
          remaining: prev.total - used,
        }));
      })
      .catch((err) => {
        console.error("Failed to fetch leave requests:", err);
      });
  }, []);


  // ...rest of your component...

  const [leaveBalance, setLeaveBalance] = useState({
    total: 20,
    used: 13,
    remaining: 7,
  });

  const [newLeaveRequest, setNewLeaveRequest] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const employeeData = {
    name: "John Doe",
    employeeId: "EMP001",
    department: "Information Technology",
    joinDate: "2023-01-15",
  };

  const handleLeaveSubmit = async () => {
    if (
      !newLeaveRequest.type ||
      !newLeaveRequest.startDate ||
      !newLeaveRequest.endDate ||
      !newLeaveRequest.reason
    ) {
      alert("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get employeeId and department from session storage
      const employeeId = sessionStorage.getItem("employeeId");
      const department = sessionStorage.getItem("department");

      if (!employeeId || !department) {
        throw new Error(
          "Employee information not found in session. Please log in again."
        );
      }

      // Calculate days
      const startDate = new Date(newLeaveRequest.startDate);
      const endDate = new Date(newLeaveRequest.endDate);
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      // Prepare request payload according to your API format
      const requestPayload = {
        type: newLeaveRequest.type,
        startDate: newLeaveRequest.startDate,
        endDate: newLeaveRequest.endDate,
        reason: newLeaveRequest.reason,
        employeeId: employeeId,
        department: department,
      };

      // Make API call using axios
      const response = await axios.post(
        "http://localhost:8080/api/leaves/submit",
        requestPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const responseData = response.data;

      // Create new request object for local state
      const newRequest = {
        id: responseData.id || leaveRequests.length + 1,
        ...newLeaveRequest,
        days,
        status: responseData.status,
        appliedDate: new Date().toISOString().split("T")[0],
      };

      // Update local state
      setLeaveRequests([newRequest, ...leaveRequests]);

      // Update leave balance (assuming pending requests are counted)
      setLeaveBalance((prev) => ({
        ...prev,
        used: prev.used + days,
        remaining: prev.remaining - days,
      }));

      // Reset form
      setNewLeaveRequest({ type: "", startDate: "", endDate: "", reason: "" });
      setShowLeaveForm(false);
      alert("Leave request submitted successfully!");
    } catch (error) {
      console.error("Error submitting leave request:", error);

      // Handle axios error response
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to submit leave request";

      alert(`Failed to submit leave request: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadReport = () => {
    const reportData = {
      employee: employeeData,
      leaveBalance,
      leaveHistory: leaveRequests,
      generatedDate: new Date().toLocaleDateString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leave-report-${
      employeeData.employeeId
    }-${new Date().getFullYear()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "rejected":
        return "text-red-700 bg-red-50 border-red-200";
      case "pending":
        return "text-amber-700 bg-amber-50 border-amber-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-3.5 h-3.5" />;
      case "rejected":
        return <XCircle className="w-3.5 h-3.5" />;
      case "pending":
        return <Clock className="w-3.5 h-3.5" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5" />;
    }
  };

  const approvedCount = leaveRequests.filter((req) => req.status === "approved").length;
  const pendingCount = leaveRequests.filter((req) => req.status === "pending").length;
  const rejectedCount = leaveRequests.filter((req) => req.status === "rejected").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-sky-100 to-blue-200">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Employee Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {employeeData.name}
                </p>
                <p className="text-xs text-gray-500">
                  {employeeData.employeeId}
                </p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: "overview", label: "Overview", icon: Home },
              { id: "request", label: "Request Leave", icon: Plus },
              { id: "history", label: "Leave History", icon: FileText },
              { id: "balance", label: "Leave Balance", icon: TrendingUp },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                  activeTab === id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {
                        approvedCount
                      }
                    </p>
                    <p className="text-gray-600 text-sm font-medium">
                      Approved Requests
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {
                        pendingCount
                      }
                    </p>
                    <p className="text-gray-600 text-sm font-medium">
                      Pending Requests
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {leaveBalance.remaining}
                    </p>
                    <p className="text-gray-600 text-sm font-medium">
                      Days Remaining
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {
                        rejectedCount
                      }
                    </p>
                    <p className="text-gray-600 text-sm font-medium">
                      Rejected Requests
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Requests */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Recent Leave Requests
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {leaveRequests.slice(0, 3).map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {getStatusIcon(request.status)}
                          <span className="capitalize">{request.status}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {request.type}
                          </p>
                          <p className="text-sm text-gray-500">
                            {request.startDate} to {request.endDate}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {request.days} days
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Request Leave Tab */}
        {activeTab === "request" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Request New Leave
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Leave Type
                  </label>
                  <select
                    value={newLeaveRequest.type}
                    onChange={(e) =>
                      setNewLeaveRequest({
                        ...newLeaveRequest,
                        type: e.target.value,
                      })
                    }
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select leave type</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Personal Leave">Personal Leave</option>
                    <option value="Emergency Leave">Emergency Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newLeaveRequest.startDate}
                      onChange={(e) =>
                        setNewLeaveRequest({
                          ...newLeaveRequest,
                          startDate: e.target.value,
                        })
                      }
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={newLeaveRequest.endDate}
                      onChange={(e) =>
                        setNewLeaveRequest({
                          ...newLeaveRequest,
                          endDate: e.target.value,
                        })
                      }
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Reason
                  </label>
                  <textarea
                    value={newLeaveRequest.reason}
                    onChange={(e) =>
                      setNewLeaveRequest({
                        ...newLeaveRequest,
                        reason: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Please provide a reason for your leave request..."
                  />
                </div>

                <button
                  onClick={handleLeaveSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                      Submitting Request...
                    </div>
                  ) : (
                    "Submit Leave Request"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leave History Tab */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Leave History
              </h2>
              <button
                onClick={downloadReport}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Days
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Applied
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaveRequests.map((request) => (
                      <tr
                        key={request.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {request.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {request.startDate} to {request.endDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {request.days}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(
                              request.status
                            )}`}
                          >
                            {getStatusIcon(request.status)}
                            <span className="capitalize">{request.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {request.appliedDate}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div
                            className="max-w-xs truncate"
                            title={request.reason}
                          >
                            {request.reason}
                          </div>
                          {request.status === "rejected" &&
                            request.rejectionReason && (
                              <div className="text-red-600 text-xs mt-1 font-medium">
                                Rejected: {request.rejectionReason}
                              </div>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Leave Balance Tab */}
        {activeTab === "balance" && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Leave Balance</h2>

            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-8">
                Annual Leave Allocation
              </h3>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Total Annual Leave
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {leaveBalance.total}
                    </p>
                    <p className="text-sm text-gray-500">days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Used Leave
                    </p>
                    <p className="text-3xl font-bold text-red-600">
                      {leaveBalance.used}
                    </p>
                    <p className="text-sm text-gray-500">days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Remaining Leave
                    </p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {leaveBalance.remaining}
                    </p>
                    <p className="text-sm text-gray-500">days</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress</span>
                    <span>
                      {Math.round(
                        (leaveBalance.used / leaveBalance.total) * 100
                      )}
                      % used
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (leaveBalance.used / leaveBalance.total) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Leave Breakdown by Type
              </h3>
              <div className="space-y-4">
                {["Sick Leave", "Personal Leave", "Emergency Leave"].map(
                  (type) => {
                    const typeRequests = leaveRequests.filter(
                      (req) => req.type === type && req.status === "approved"
                    );
                    const typeDays = typeRequests.reduce(
                      (total, req) => total + req.days,
                      0
                    );

                    return (
                      <div
                        key={type}
                        className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100"
                      >
                        <span className="font-medium text-gray-900">
                          {type}
                        </span>
                        <div className="text-right">
                          <span className="text-xl font-bold text-blue-600">
                            {typeDays}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            days used
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Leave Summary
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <p className="text-2xl font-bold text-blue-600 mb-1">
                    {leaveBalance.remaining}
                  </p>
                  <p className="text-sm font-medium text-gray-600">
                    Days Remaining
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-100">
                  <p className="text-2xl font-bold text-red-600 mb-1">
                    {leaveBalance.used}
                  </p>
                  <p className="text-sm font-medium text-gray-600">Days Used</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                  <p className="text-2xl font-bold text-amber-600 mb-1">
                    {
                      leaveRequests.filter((req) => req.status === "pending")
                        .length
                    }
                  </p>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Requests
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                  <p className="text-2xl font-bold text-emerald-600 mb-1">
                    {leaveBalance.total}
                  </p>
                  <p className="text-sm font-medium text-gray-600">
                    Annual Entitlement
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
