import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../Context/AuthContext';

const AdminRoute = () => {
    const { user } = useContext(AuthContext);

    // Ensure user exists and has admin role
    if (user && user.role === 'admin') {
        return <Outlet />;
    }

    // Redirect to home or login if not admin
    return <Navigate to="/" replace />;
};

export default AdminRoute;
