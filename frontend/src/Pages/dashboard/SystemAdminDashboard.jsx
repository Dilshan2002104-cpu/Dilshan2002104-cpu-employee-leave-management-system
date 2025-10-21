import { useState } from 'react';
import {useEffect } from 'react';
import { API_ENDPOINTS } from "../../config/api";


import {
    Users,
    UserPlus,
    Settings,
    BarChart3,
    Shield,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    Building2,
    Mail,
    Phone,
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
    Plus,
    X,
    Save
} from 'lucide-react';

// Move modal components outside the main component
const CreateUserModal = ({ 
    showCreateModal, 
    setShowCreateModal, 
    newUser, 
    setNewUser, 
    departments, 
    handleCreateUser 
}) => {
    if (!showCreateModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Create Department Head</h3>
                    <button
                        onClick={() => setShowCreateModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                        <input
                            type="text"
                            value={newUser.employeeId}
                            onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="DH001"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="John Smith"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <select
                            value={newUser.department}
                            onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Password"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            value={newUser.confirmPassword}
                            onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Confirm Password"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={() => setShowCreateModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateUser}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                        Create User
                    </button>
                </div>
            </div>
        </div>
    );
};

const EditUserModal = ({ 
    showEditModal, 
    setShowEditModal, 
    selectedUser, 
    setSelectedUser, 
    departments, 
    handleUpdateUser 
}) => {
    if (!showEditModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Edit Department Head</h3>
                    <button
                        onClick={() => setShowEditModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {selectedUser && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                            <input
                                type="text"
                                value={selectedUser.employeeId}
                                onChange={(e) => setSelectedUser({ ...selectedUser, employeeId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={selectedUser.name}
                                onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <select
                                value={selectedUser.department}
                                onChange={(e) => setSelectedUser({ ...selectedUser, department: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={() => setShowEditModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdateUser}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                        Update User
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function SystemAdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);




    // State for department heads
    const [departmentHeads, setDepartmentHeads] = useState([]);

    

    const [newUser, setNewUser] = useState({
        employeeId: '',
        name: '',
        department: '',
        password: '',
        confirmPassword: ''
    });

    const departments = [
        'HR',
        'IT',
        'Finance',
        'Marketing'
    ];

    const stats = {
        totalDepartmentHeads: departmentHeads.length,
        activeDepartmentHeads: departmentHeads.filter(user => user.status === 'Active').length,
        inactiveDepartmentHeads: departmentHeads.filter(user => user.status === 'Inactive').length,
        totalDepartments: departments.length
    };

    const filteredUsers = departmentHeads.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = selectedDepartment === '' || user.department === selectedDepartment;
        return matchesSearch && matchesDepartment;
    });


    const handleEditUser = (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const handleUpdateUser = () => {
        // Add your API call logic here
        console.log('Updating user:', selectedUser);
        
        setShowEditModal(false);
        setSelectedUser(null);
    };

    const handleDeleteUser = (userId) => {
        // Add your API call logic here
        console.log('Deleting user:', userId);
    };

    const toggleUserStatus = (userId) => {
        // Add your API call logic here
        console.log('Toggling user status:', userId);
    };

    const StatCard = ({ icon: Icon, title, value, color }) => ( // eslint-disable-line no-unused-vars
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
                <div className={`p-3 rounded-full ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );

        useEffect(() => {
        fetchDepartmentHeads();
    }, []);

    const fetchDepartmentHeads = async () => {
        try {
            const res = await fetch(API_ENDPOINTS.HEADS_ALL);
            const data = await res.json();
            setDepartmentHeads(data);
        } catch (error) {
            console.error('Failed to fetch department heads:', error);
            alert('Failed to fetch department heads');
        }
    };

    const handleCreateUser = async () => {
        if (newUser.password !== newUser.confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        try {
            const res = await fetch(API_ENDPOINTS.HEADS_CREATE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeId: newUser.employeeId,
                    name: newUser.name,
                    department: newUser.department,
                    password: newUser.password
                })
            });
            if (!res.ok) {
                throw new Error('Failed to create user');
            }
            await fetchDepartmentHeads(); // Refresh list
            setShowCreateModal(false);
            setNewUser({ employeeId: '', name: '', department: '', password: '', confirmPassword: '' });
        } catch (error) {
            console.error('Failed to create user:', error);
            alert('Failed to create user');
        }
    };


    
    return (
        <>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div className="flex items-center">
                                <Shield className="w-8 h-8 text-blue-600 mr-3" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">System Admin Dashboard</h1>
                                    <p className="text-sm text-gray-600">Manage department heads and system settings</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Add Department Head
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {[
                                { id: 'overview', name: 'Overview', icon: BarChart3 },
                                { id: 'users', name: 'Department Heads', icon: Users },
                                { id: 'settings', name: 'Settings', icon: Settings }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4 mr-2" />
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard
                                    icon={Users}
                                    title="Total Department Heads"
                                    value={stats.totalDepartmentHeads}
                                    color="bg-blue-500"
                                />
                                <StatCard
                                    icon={CheckCircle}
                                    title="Active Users"
                                    value={stats.activeDepartmentHeads}
                                    color="bg-green-500"
                                />
                                <StatCard
                                    icon={XCircle}
                                    title="Inactive Users"
                                    value={stats.inactiveDepartmentHeads}
                                    color="bg-red-500"
                                />
                                <StatCard
                                    icon={Building2}
                                    title="Total Departments"
                                    value={stats.totalDepartments}
                                    color="bg-purple-500"
                                />
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center text-sm">
                                            <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                                            <span className="text-gray-500">No recent activity</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="space-y-6">
                            {/* Search and Filter */}
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="Search by name or employee ID..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="sm:w-64">
                                        <select
                                            value={selectedDepartment}
                                            onChange={(e) => setSelectedDepartment(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">All Departments</option>
                                            {departments.map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Users Table */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    User
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Department
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Last Login
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                                        No department heads found
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredUsers.map((user) => (
                                                    <tr key={user.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="flex-shrink-0 h-10 w-10">
                                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                                        <span className="text-blue-600 font-medium text-sm">
                                                                            {user.name?.split(' ').map(n => n[0]).join('') || 'N/A'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</div>
                                                                    <div className="text-sm text-gray-500">{user.employeeId || 'N/A'}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{user.department || 'N/A'}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'Active'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {user.status || 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {user.lastLogin || 'Never'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <div className="flex items-center space-x-2">
                                                                <button
                                                                    onClick={() => handleEditUser(user)}
                                                                    className="text-blue-600 hover:text-blue-900"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => toggleUserStatus(user.id)}
                                                                    className={user.status === 'Active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                                                                >
                                                                    {user.status === 'Active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteUser(user.id)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
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
                    )}

                    {activeTab === 'settings' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">System Settings</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                                        <p className="text-sm text-gray-500">Send email notifications for new registrations</p>
                                    </div>
                                    <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Auto-approve Registrations</h4>
                                        <p className="text-sm text-gray-500">Automatically approve new department head registrations</p>
                                    </div>
                                    <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                                        <p className="text-sm text-gray-500">Require 2FA for all department heads</p>
                                    </div>
                                    <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modals */}
                <CreateUserModal
                    showCreateModal={showCreateModal}
                    setShowCreateModal={setShowCreateModal}
                    newUser={newUser}
                    setNewUser={setNewUser}
                    departments={departments}
                    handleCreateUser={handleCreateUser}
                />
                <EditUserModal
                    showEditModal={showEditModal}
                    setShowEditModal={setShowEditModal}
                    selectedUser={selectedUser}
                    setSelectedUser={setSelectedUser}
                    departments={departments}
                    handleUpdateUser={handleUpdateUser}
                />
            </div>
        </>
    );
}