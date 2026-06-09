import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "./index.css";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ConnectAWS from "./pages/ConnectAWS";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import AWSInfrastructure from "./pages/AWSInfrastructure";
import Security from "./pages/Security";
import Settings from "./pages/Settings";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
  path="/aws"
  element={
    <ProtectedRoute>
      <AWSInfrastructure />
    </ProtectedRoute>
  }
/>

<Route
  path="/security"
  element={
    <ProtectedRoute>
      <Security />
    </ProtectedRoute>
  }
/>

<Route
  path="/settings"
  element={
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  }
/>
          <Route
            path="/connect-aws"
            element={
              <ProtectedRoute>
                <ConnectAWS />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
