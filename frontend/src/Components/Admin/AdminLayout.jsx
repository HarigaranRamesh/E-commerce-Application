import React, { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../Context/AuthContext';
import { LayoutDashboard, Users, ShoppingBag, Package, LogOut } from 'lucide-react';
import './Admin.css';

const AdminLayout = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="admin-container">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="admin-sidebar-overlay" onClick={closeSidebar}></div>
            )}

            {/* Sidebar */}
            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header">
                    <h2>Admin Panel</h2>
                    <button className="close-sidebar-btn" onClick={closeSidebar}>
                        <LayoutDashboard size={20} /> {/* Using icon as close or just X */}
                    </button>
                </div>
                <nav className="admin-nav">
                    <Link to="/admin/dashboard" className={`admin-nav-item ${isActive('/admin/dashboard') ? 'active' : ''}`} onClick={closeSidebar}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/admin/users" className={`admin-nav-item ${isActive('/admin/users') ? 'active' : ''}`} onClick={closeSidebar}>
                        <Users size={20} />
                        <span>Users</span>
                    </Link>
                    <Link to="/admin/orders" className={`admin-nav-item ${isActive('/admin/orders') ? 'active' : ''}`} onClick={closeSidebar}>
                        <ShoppingBag size={20} />
                        <span>Orders</span>
                    </Link>
                    <Link to="/admin/products" className={`admin-nav-item ${isActive('/admin/products') ? 'active' : ''}`} onClick={closeSidebar}>
                        <Package size={20} />
                        <span>Products</span>
                    </Link>
                </nav>
                <div className="admin-sidebar-footer">
                    <button onClick={handleLogout} className="admin-logout-btn">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-mobile-header">
                    <button className="menu-toggle-btn" onClick={toggleSidebar}>
                        <LayoutDashboard size={24} />
                    </button>
                    <h2>Admin Panel</h2>
                </header>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
