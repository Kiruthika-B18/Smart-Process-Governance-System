import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Outlet />
            </div>
            <Toaster position="top-right" />
        </div>
    );
};

export default Layout;
