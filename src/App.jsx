import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext.jsx';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import AccommodationSearchPage from './pages/AccommodationSearchPage';
import AccommodationDetailPage from './pages/AccommodationDetailPage';

import SearchPage from './pages/SearchPage';
import HotelDetailPage from './pages/HotelDetailPage';

import ProfilePage from './pages/ProfilePage';
import MyBookingsPage from './pages/MyBookingsPage';
import BookingDetailPage from './pages/BookingDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import BookingSuccessPage from './pages/BookingSuccessPage';

import VnpayReturnPage from './pages/VnpayReturnPage';


import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';


import RequireUserLoggedIn from './components/RequireUserLoggedIn';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';

//import Home from "./pages/Home.jsx";

function App() {
    return (
        <>
            <AppProvider>
                <AuthProvider>
                    <BookingProvider>
                        <Header />

                        <div className="app-container">
                            <div className="app-main">
                                <Routes>
                                    {/* PUBLIC ROUTES */}
                                    <Route path="/" element={<HomePage />} />
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/register" element={<RegisterPage />} />

                                    <Route path="/search-accommodations" element={<AccommodationSearchPage />} />
                                    <Route path="/accommodation-detail" element={<AccommodationDetailPage />} />

                                    <Route path="/payment/vnpay/return" element={<VnpayReturnPage />} />
                            
                                    <Route path="/about" element={<AboutPage />} />
                                    <Route path="/contact" element={<ContactPage />} />
                                    <Route path="/terms" element={<TermsPage />} />
                                    <Route path="/privacy" element={<PrivacyPage />} />
                                    

                                    {/* ROUTES REQUIRED LOGGED-IN USER */}
                                    <Route element={<RequireUserLoggedIn />}>
                                        <Route path="/profile" element={<ProfilePage />} />
                                        <Route path="/bookings" element={<MyBookingsPage />} />
                                        <Route path="/booking-detail" element={<BookingDetailPage />} />

                                        <Route path="/checkout" element={<CheckoutPage />} />
                                    </Route>
                                </Routes>
                            </div>
                        </div>

                        <Footer />
                    </BookingProvider>
                </AuthProvider>
            </AppProvider>
        </>
    )
}

export default App
