import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Leaderboard from "./components/Leaderboard";
import Profile from "./components/Profile";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";

const App: React.FC = () => {
    return (
        <div>
            <Navbar />
            <div style={{ minHeight: "calc(100vh - 64px - 100px)" }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Routes>
            </div>
            <Footer />
        </div>
    );
};

export default App;
