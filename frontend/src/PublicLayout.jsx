import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';

const PublicLayout = () => {
    return (
        <>
            <Navbar />
            <main style={{ minHeight: '80vh' }}>
                <Outlet />
            </main>
            <Footer />
        </>
    );
};

export default PublicLayout;
