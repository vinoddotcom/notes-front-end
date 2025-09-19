'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminService } from '@/services/adminService';
import { UserResponse } from '@/services/apiClient';
import Navbar from '@/components/Navbar';

export default function UsersManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>();
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Check if user is authenticated and has admin role
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, roleFilter, statusFilter, currentPage, pageSize]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await AdminService.getUsers(currentPage, pageSize, roleFilter, statusFilter);
        setUsers(response.items);
      setTotalItems(response.meta.total);
      setTotalPages(response.meta.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

    const fetchUserDetails = async (userId: number) => {
    setIsLoadingDetails(true);
    try {
      const details = await AdminService.getUserDetails(userId);
      setSelectedUser(details);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch user details';
      console.error(errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoadingDetails(false);
    }
  };  const handleRoleChange = async (userId: number, newRole: string) => {
    setIsUpdating(true);
    setError('');
    try {
      const updatedUser = await AdminService.updateUserRole(userId, newRole);
      setUsers(users.map(user => user.id === userId ? updatedUser : user));
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(updatedUser);
      }
      
      // Show success message in a more user-friendly way
      const successMessage = document.createElement('div');
      successMessage.className = 'toast toast-top toast-center';
      successMessage.innerHTML = `
        <div class="alert alert-success">
          <span>User role updated to ${newRole}</span>
        </div>
      `;
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);
      
      // Refresh the user list to ensure it's up to date
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (userId: number, isActive: boolean) => {
    setIsUpdating(true);
    setError('');
    try {
      const updatedUser = await AdminService.updateUserStatus(userId, isActive);
      setUsers(users.map(user => user.id === userId ? updatedUser : user));
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(updatedUser);
      }
      
      // Show success message in a more user-friendly way
      const successMessage = document.createElement('div');
      successMessage.className = 'toast toast-top toast-center';
      successMessage.innerHTML = `
        <div class="alert alert-success">
          <span>User ${isActive ? 'activated' : 'deactivated'}</span>
        </div>
      `;
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);
      
      // Refresh the user list to ensure it's up to date
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-base-200 p-4 rounded-lg mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Role</span>
              </label>
              <select 
                className="select select-bordered" 
                value={roleFilter || ''} 
                onChange={(e) => setRoleFilter(e.target.value || undefined)}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Status</span>
              </label>
              <select 
                className="select select-bordered"
                value={statusFilter === undefined ? '' : statusFilter ? 'active' : 'inactive'}
                onChange={(e) => {
                  if (e.target.value === '') {
                    setStatusFilter(undefined);
                  } else {
                    setStatusFilter(e.target.value === 'active');
                  }
                }}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <button 
              className="btn btn-primary" 
              onClick={() => {
                setCurrentPage(1); // Reset to first page when applying filters
                fetchUsers();
              }}
            >
              Apply Filters
            </button>
            
            <button 
              className="btn btn-outline" 
              onClick={() => {
                setRoleFilter(undefined);
                setStatusFilter(undefined);
                setCurrentPage(1); // Reset to first page when clearing filters
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* User List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-1 lg:col-span-2 overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>S.R</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id} className={selectedUser?.id === user.id ? 'bg-base-300' : ''}>
                      <td>{index + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${user.is_active ? 'badge-success' : 'badge-error'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button 
                            className="btn btn-xs btn-info" 
                            onClick={() => {
                              // Only fetch if it's not the currently selected user
                              if (!selectedUser || selectedUser.id !== user.id) {
                                fetchUserDetails(user.id);
                              }
                            }}
                            aria-label="View user details"
                          >
                            Details
                          </button>
                          <button 
                            className="btn btn-xs btn-accent" 
                            onClick={() => router.push(`/admin/users/${user.id}/notes`)}
                            aria-label="View user notes"
                          >
                            Notes
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && !isLoading && (
                <div className="text-center py-6">
                  <p>No users found</p>
                </div>
              )}
              
              {/* Pagination Controls */}
              {totalPages > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-3 bg-base-200 p-4 rounded-lg">
                  <div className="text-sm text-base-content/70">
                    Showing {users.length} of {totalItems} users
                  </div>
                  
                  <div className="join shadow-sm">
                    <button 
                      className="join-item btn btn-sm btn-ghost" 
                      onClick={() => {
                      if (currentPage !== 1) setCurrentPage(1);
                      }}
                      disabled={currentPage === 1}
                      aria-label="First page"
                    >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" style={{ transform: 'scaleX(-1)' }}>
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 5l7 7-7 7M9 5l7 7-7 7" />
                </svg>
                    </button>
                    <button 
                      className="join-item btn btn-sm btn-ghost"
                      onClick={() => {
                      if (currentPage > 1) setCurrentPage(p => Math.max(1, p - 1));
                      }}
                      disabled={currentPage === 1}
                      aria-label="Previous page"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <div className="join-item bg-base-100 px-2 flex items-center">
                      <span className="px-2">Page</span>
                      <select 
                        className="select select-sm select-ghost focus:outline-none" 
                        value={currentPage}
                        onChange={(e) => setCurrentPage(Number(e.target.value))}
                      >
                        {Array.from({ length: totalPages }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                      <span className="px-2 whitespace-nowrap">of {totalPages}</span>
                    </div>
                    
                    <button 
                      className="join-item btn btn-sm btn-ghost"
                      onClick={() => {
                      if (currentPage < totalPages) setCurrentPage(p => Math.min(totalPages, p + 1));
                      }}
                      disabled={currentPage === totalPages}
                      aria-label="Next page"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button 
                      className="join-item btn btn-sm btn-ghost"
                      onClick={() => {
                      if (currentPage !== totalPages) setCurrentPage(totalPages);
                      }}
                      disabled={currentPage === totalPages}
                      aria-label="Last page"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 5l7 7-7 7M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-base-100 rounded-lg px-3 py-1">
                    <span className="text-sm whitespace-nowrap">Items per page:</span>
                    <select 
                      className="select select-sm select-ghost focus:outline-none" 
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1); // Reset to first page when changing page size
                      }}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            {/* User Details Panel */}
            {selectedUser && (
              <div className="col-span-1 bg-base-200 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">User Details</h2>
                
                {isLoadingDetails ? (
                  <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-md"></span>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-medium">{selectedUser.name}</h3>
                        <span className={`badge ${selectedUser.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                          {selectedUser.role}
                        </span>
                      </div>
                      <p className="text-sm mb-1">{selectedUser.email}</p>
                      <p className="text-xs opacity-70">Created: {new Date(selectedUser.created_at).toLocaleString()}</p>
                      <div className="mt-2">
                        <span className={`badge ${selectedUser.is_active ? 'badge-success' : 'badge-error'}`}>
                          {selectedUser.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="divider"></div>
                    
                    {/* Role Management */}
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Role Management</h4>
                      <div className="flex gap-2">
                        <button 
                          className={`btn btn-sm ${selectedUser.role === 'admin' ? 'btn-primary' : 'btn-outline'}`}
                          disabled={selectedUser.role === 'admin' || isUpdating}
                          onClick={() => handleRoleChange(selectedUser.id, 'admin')}
                        >
                          Make Admin
                        </button>
                        <button 
                          className={`btn btn-sm ${selectedUser.role === 'user' ? 'btn-secondary' : 'btn-outline'}`}
                          disabled={selectedUser.role === 'user' || isUpdating}
                          onClick={() => handleRoleChange(selectedUser.id, 'user')}
                        >
                          Make User
                        </button>
                      </div>
                    </div>
                    
                    {/* Status Management */}
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Account Status</h4>
                      <div className="flex gap-2">
                        <button 
                          className={`btn btn-sm ${selectedUser.is_active ? 'btn-success' : 'btn-outline'}`}
                          disabled={selectedUser.is_active || isUpdating}
                          onClick={() => handleStatusChange(selectedUser.id, true)}
                        >
                          Activate
                        </button>
                        <button 
                          className={`btn btn-sm ${!selectedUser.is_active ? 'btn-error' : 'btn-outline'}`}
                          disabled={!selectedUser.is_active || isUpdating}
                          onClick={() => handleStatusChange(selectedUser.id, false)}
                        >
                          Deactivate
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button 
                        className="btn btn-sm btn-ghost"
                        onClick={() => setSelectedUser(null)}
                      >
                        Close Details
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
