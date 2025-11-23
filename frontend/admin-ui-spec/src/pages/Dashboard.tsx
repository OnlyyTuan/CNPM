import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const Dashboard: React.FC = () => {
    return (
        <div className="dashboard">
            <Header />
            <div className="dashboard-content">
                <Sidebar />
                <main>
                    <h1>Dashboard</h1>
                    {/* Add components for displaying key metrics and visualizations here */}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;