import React from 'react';
import { Navigate } from 'react-router-dom';

const BeneficiaryProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    console.log("BeneficiaryProtectedRoute: Checking token...", token);

    if (!token || token === "undefined" || token === "null") {
        console.log("BeneficiaryProtectedRoute: No token found, redirecting to login.");
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default BeneficiaryProtectedRoute;
