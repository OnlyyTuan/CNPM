import React from 'react';
import DataTable from '../components/DataTable';
import Form from '../components/Form';

const Users: React.FC = () => {
    return (
        <div>
            <h1>Users Management</h1>
            <Form />
            <DataTable />
        </div>
    );
};

export default Users;