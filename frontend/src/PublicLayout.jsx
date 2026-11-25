import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';

const PublicLayout = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return (
        <>
            <Navbar />
            <main style={{ minHeight: '80vh' }}>
                <Outlet />
            </main>
            {isHomePage && <Footer />}
        </>
    );
};

export default PublicLayout;
