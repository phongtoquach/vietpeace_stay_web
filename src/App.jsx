import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext.jsx';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import MyBookingsPage from './pages/MyBookingsPage';

import RequireUserLoggedIn from './components/RequireUserLoggedIn';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';

//import Home from "./pages/Home.jsx";

function App() {
    return (
        <>
            <AuthProvider>
                <BookingProvider>
                    <Header />

                    <div className="app-container">
                        <div className="app-main">
                            <Routes>
                                {/* PUBLIC ROUTES */}
                                <Route path="/" element={<HomePage />} />
                                <Route path="/login" element={<LoginPage />} />
                                

                                {/* ROUTES REQUIRED LOGGED-IN USER */}
                                <Route element={<RequireUserLoggedIn />}>
                                    <Route path="/profile" element={<ProfilePage />} />

                                    <Route path="/bookings" element={<MyBookingsPage />} />
                                </Route>
                            </Routes>
                        </div>
                    </div>

                    <Footer />
                </BookingProvider>
            </AuthProvider>
        </>
    )
}

export default App
