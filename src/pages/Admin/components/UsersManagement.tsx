import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, Calendar, Edit, Trash2, User, Shield, RefreshCw } from 'lucide-react';
import { usersService } from '../../../utils/databaseService';

interface User {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  mobile_number: string | null;
  role: string;
  created_at: string;
  last_login: string | null;
}

export const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersService.getUsers();
      // Filter out the current admin user if needed, or show all users
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setUpdatingUser(userId);
      await usersService.updateUserRole(userId, newRole);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await usersService.deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (lastLogin: string | null) => {
    if (!lastLogin) return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    
    const lastLoginDate = new Date(lastLogin);
    const now = new Date();
    const diffHours = (now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (diffHours < 24) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 sm:py-12">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-gray-900 dark:text-white">
            Users Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Manage your users and permissions ({users.length} users)
          </p>
        </div>
        <button
          onClick={loadUsers}
          className="flex items-center space-x-2 bg-primary text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-light transition-colors text-sm sm:text-base w-full xs:w-auto justify-center"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  User
                </th>
                <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  Contact
                </th>
                <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  Status
                </th>
                <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  Role
                </th>
                <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  Joined
                </th>
                <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="text-primary w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                          {user.name || 'No Name'}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm truncate">
                          ID: {user.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-3 sm:py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail size={12} className="text-gray-400 flex-shrink-0" />
                        <span className="text-gray-900 dark:text-white text-xs sm:text-sm truncate max-w-24 sm:max-w-32">
                          {user.email}
                        </span>
                      </div>
                      {(user.phone || user.mobile_number) && (
                        <div className="flex items-center space-x-2">
                          <Phone size={12} className="text-gray-400 flex-shrink-0" />
                          <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm truncate">
                            {user.phone || user.mobile_number}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-3 sm:py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.last_login)}`}>
                      {user.last_login ? 'Active' : 'Inactive'}
                    </span>
                    {user.last_login && (
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                        Last: {new Date(user.last_login).toLocaleDateString()}
                      </p>
                    )}
                  </td>
                  <td className="px-3 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center space-x-2">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={updatingUser === user.id}
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-primary ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : user.role === 'moderator'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}
                      >
                        <option value="customer">Customer</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                      {updatingUser === user.id && (
                        <RefreshCw size={12} className="animate-spin text-primary flex-shrink-0" />
                      )}
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                      <Calendar size={12} className="flex-shrink-0" />
                      <span className="text-xs sm:text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <button 
                        className="p-1 sm:p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1 sm:p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      <button 
                        className="p-1 sm:p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="View Permissions"
                      >
                        <Shield size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-400 mb-3 sm:mb-4">
              <User size={32} className="sm:w-12 sm:h-12 mx-auto" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
              No users found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              {searchTerm ? 'Try adjusting your search criteria' : 'No users registered yet'}
            </p>
          </div>
        )}
      </div>

      {/* Mobile & Tablet Card View */}
      <div className="lg:hidden space-y-3 sm:space-y-4">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="text-primary w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                    {user.name || 'No Name'}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${getStatusColor(user.last_login)}`}>
                {user.last_login ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            {/* Contact Info */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm mb-3">
              <div className="flex items-center space-x-2">
                <Phone size={12} className="text-gray-400 flex-shrink-0" />
                <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                <span className="text-gray-900 dark:text-white truncate">
                  {user.phone || user.mobile_number || 'N/A'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={12} className="text-gray-400 flex-shrink-0" />
                <span className="text-gray-500 dark:text-gray-400">Joined:</span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Last Login Info */}
            {user.last_login && (
              <div className="mb-3">
                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  Last login: {new Date(user.last_login).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Actions Section */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-2">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={updatingUser === user.id}
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-primary ${
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : user.role === 'moderator'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}
                >
                  <option value="customer">Customer</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
                {updatingUser === user.id && (
                  <RefreshCw size={12} className="animate-spin text-primary" />
                )}
              </div>

              <div className="flex items-center space-x-1 sm:space-x-2">
                <button 
                  className="p-1 sm:p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Edit User"
                >
                  <Edit size={14} className="sm:w-4 sm:h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteUser(user.id)}
                  className="p-1 sm:p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete User"
                >
                  <Trash2 size={14} className="sm:w-4 sm:h-4" />
                </button>
                <button 
                  className="p-1 sm:p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="View Permissions"
                >
                  <Shield size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-400 mb-3 sm:mb-4">
              <User size={32} className="sm:w-12 sm:h-12 mx-auto" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
              No users found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              {searchTerm ? 'Try adjusting your search criteria' : 'No users registered yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};