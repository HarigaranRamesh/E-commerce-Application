import React, { useEffect, useState, useCallback, useRef } from 'react';
import { adminAPI } from '../../services/api';
import { Trash2, Edit, Check, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        role: ''
    });

    const [error, setError] = useState(null);
    const searchTimerRef = useRef(null);

    const fetchUsers = useCallback(async (targetPage = page, search = searchTerm, role = roleFilter, sort = sortBy) => {
        setLoading(true);
        try {
            setError(null);
            const params = {
                page: targetPage,
                limit,
                search: search.trim() || undefined,
                role: role !== 'all' ? role : undefined,
                sort,
            };
            const response = await adminAPI.getUsers(params);
            if (response.data && response.data.users) {
                setUsers(response.data.users);
                setPage(response.data.page || 1);
                setPages(response.data.pages || 1);
                setTotal(response.data.total || 0);
            } else if (Array.isArray(response.data)) {
                setUsers(response.data);
                setTotal(response.data.length);
                setPages(1);
            } else {
                setUsers([]);
                setTotal(0);
                setPages(1);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setError(error.response?.data?.message || "Failed to load users.");
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, roleFilter, sortBy]);

    useEffect(() => {
        fetchUsers(page, searchTerm, roleFilter, sortBy);
    }, [page, roleFilter, sortBy]);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setPage(1);
            fetchUsers(1, val, roleFilter, sortBy);
        }, 300);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await adminAPI.deleteUser(id);
                toast.success('User deleted successfully');
                fetchUsers(page, searchTerm, roleFilter, sortBy);
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Failed to delete user');
            }
        }
    };

    const handleEditClick = (user) => {
        setEditingId(user._id || user.id);
        setEditFormData({
            name: user.name,
            email: user.email,
            role: user.role
        });
    };

    const handleCancelClick = () => {
        setEditingId(null);
    };

    const handleSaveClick = async (id) => {
        try {
            await adminAPI.updateUser(id, editFormData);
            setUsers(users.map((user) => ((user._id || user.id) === id ? { ...user, ...editFormData } : user)));
            setEditingId(null);
            toast.success('User updated successfully');
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Failed to update user');
        }
    };

    const handleInputChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    return (
        <div>
            <div className="admin-page-header">
                <h2>Users Management {total > 0 ? `(${total})` : ''}</h2>
            </div>

            {/* Filter, Search & Sort Toolbar */}
            <div className="admin-filter-bar">
                <div className="admin-search-input-wrap">
                    <Search size={16} />
                    <input
                        type="text"
                        className="admin-search-input"
                        placeholder="Search user by name or email..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>

                <div className="admin-filter-group">
                    {/* Role Filter */}
                    <select
                        className="admin-select"
                        value={roleFilter}
                        onChange={(e) => {
                            setRoleFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="all">All Roles</option>
                        <option value="user">Customer (User)</option>
                        <option value="admin">Administrator</option>
                    </select>

                    {/* Sort Dropdown */}
                    <select
                        className="admin-select"
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="newest">Joined: Newest First</option>
                        <option value="oldest">Joined: Oldest First</option>
                        <option value="name_asc">Name: A to Z</option>
                        <option value="name_desc">Name: Z to A</option>
                    </select>
                </div>
            </div>

            <div className="admin-table-container">
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <div className="loader"></div>
                    </div>
                ) : error ? (
                    <div className="error-container" style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
                        <h3>Error Loading Users</h3>
                        <p>{error}</p>
                        <button onClick={() => fetchUsers(page, searchTerm, roleFilter, sortBy)} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                            Retry
                        </button>
                    </div>
                ) : users.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        <p style={{ fontSize: '1rem', margin: 0 }}>No users found matching your filters.</p>
                    </div>
                ) : (
                    <>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Joined Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => {
                                    const userId = user._id || user.id;
                                    const isEditing = editingId === userId;
                                    return (
                                        <tr key={userId}>
                                            <td>{(page - 1) * limit + index + 1}</td>
                                            <td>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={editFormData.name}
                                                        onChange={handleInputChange}
                                                        className="edit-input"
                                                    />
                                                ) : (
                                                    <span style={{ fontWeight: 600 }}>{user.name}</span>
                                                )}
                                            </td>
                                            <td>
                                                {isEditing ? (
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={editFormData.email}
                                                        onChange={handleInputChange}
                                                        className="edit-input"
                                                    />
                                                ) : (
                                                    <a href={`mailto:${user.email}`} style={{ color: '#4f46e5', textDecoration: 'none' }}>
                                                        {user.email}
                                                    </a>
                                                )}
                                            </td>
                                            <td>
                                                {isEditing ? (
                                                    <select
                                                        name="role"
                                                        value={editFormData.role}
                                                        onChange={handleInputChange}
                                                        className="edit-input"
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                ) : (
                                                    <span className={`status-badge ${user.role === 'admin' ? 'status-processing' : 'status-shipped'}`}>
                                                        {user.role === 'admin' ? 'Administrator' : 'Customer'}
                                                    </span>
                                                )}
                                            </td>
                                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                {isEditing ? (
                                                    <div className="action-buttons">
                                                        <button onClick={() => handleSaveClick(userId)} className="icon-btn save-btn" title="Save">
                                                            <Check size={18} />
                                                        </button>
                                                        <button onClick={handleCancelClick} className="icon-btn cancel-btn" title="Cancel">
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="action-buttons">
                                                        <button onClick={() => handleEditClick(user)} className="icon-btn edit-btn" title="Edit Role">
                                                            <Edit size={18} />
                                                        </button>
                                                        <button onClick={() => handleDelete(userId)} className="icon-btn delete-btn" title="Delete User">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Pagination Bar */}
                        {pages > 1 && (
                            <div className="admin-pagination">
                                <span>
                                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} users
                                </span>
                                <div className="admin-pagination-pages">
                                    <button
                                        type="button"
                                        className="admin-page-btn"
                                        disabled={page <= 1}
                                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                        title="Previous Page"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>

                                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            className={`admin-page-btn ${page === p ? 'active' : ''}`}
                                            onClick={() => setPage(p)}
                                        >
                                            {p}
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        className="admin-page-btn"
                                        disabled={page >= pages}
                                        onClick={() => setPage((p) => Math.min(p + 1, pages))}
                                        title="Next Page"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default UserList;
