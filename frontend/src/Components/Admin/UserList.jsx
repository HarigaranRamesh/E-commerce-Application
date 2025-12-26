import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

import { Trash2, Edit, Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        role: ''
    });

    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        try {
            setError(null);
            const response = await adminAPI.getUsers();
            console.log("Users fetched:", response.data);
            if (Array.isArray(response.data)) {
                setUsers(response.data);
            } else {
                setUsers([]);
                console.error("Invalid users data structure:", response.data);
                setError("Received invalid data from server");
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setError(error.response?.data?.message || "Failed to load users. Please ensure backend is running.");
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await adminAPI.deleteUser(id);
                setUsers(users.filter((user) => user._id !== id));
                toast.success('User deleted successfully');
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Failed to delete user');
            }
        }
    };

    const handleEditClick = (user) => {
        setEditingId(user._id);
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
            setUsers(users.map((user) => (user._id === id ? { ...user, ...editFormData } : user)));
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

    if (loading) return <div className="loader"></div>;

    if (error) {
        return (
            <div className="error-container" style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
                <h3>Error Loading Users</h3>
                <p>{error}</p>
                <button onClick={fetchUsers} className="btn btn-primary" style={{ marginTop: '1rem' }}>Retry</button>
            </div>
        );
    }

    return (
        <div>
            <h2>Users Management</h2>
            {users.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                    <p>No users found.</p>
                </div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
                                <tr key={user._id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        {editingId === user._id ? (
                                            <input
                                                type="text"
                                                name="name"
                                                value={editFormData.name}
                                                onChange={handleInputChange}
                                                className="edit-input"
                                            />
                                        ) : (
                                            user.name
                                        )}
                                    </td>
                                    <td>
                                        {editingId === user._id ? (
                                            <input
                                                type="email"
                                                name="email"
                                                value={editFormData.email}
                                                onChange={handleInputChange}
                                                className="edit-input"
                                            />
                                        ) : (
                                            <a href={`mailto:${user.email}`}>{user.email}</a>
                                        )}
                                    </td>
                                    <td>
                                        {editingId === user._id ? (
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
                                                {user.role}
                                            </span>
                                        )}
                                    </td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        {editingId === user._id ? (
                                            <div className="action-buttons">
                                                <button onClick={() => handleSaveClick(user._id)} className="icon-btn save-btn">
                                                    <Check size={18} />
                                                </button>
                                                <button onClick={handleCancelClick} className="icon-btn cancel-btn">
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="action-buttons">
                                                <button onClick={() => handleEditClick(user)} className="icon-btn edit-btn">
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(user._id)} className="icon-btn delete-btn">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserList;
