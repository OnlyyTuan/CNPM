import React from 'react';
import Form from '../components/Form';

const Settings: React.FC = () => {
    const handleSubmit = (data: any) => {
        // Handle form submission logic here
        console.log('Settings updated:', data);
    };

    return (
        <div className="settings-page">
            <h1>Settings</h1>
            <Form onSubmit={handleSubmit} />
        </div>
    );
};

export default Settings;