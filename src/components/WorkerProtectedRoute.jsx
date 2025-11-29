import React from 'react';
import { Navigate } from 'react-router-dom';

const WorkerProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('workerToken');

    if (!token) {
        return <Navigate to="/workerlogin" replace />;
    }

    return children;
};

export default WorkerProtectedRoute;
