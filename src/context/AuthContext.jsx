import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getStorage, setStorage, removeStorage } from '../utils/bookingUtils.js';

const AuthContext = createContext();

const API_URL = "http://localhost:5000/api";

const STORAGE_KEY = 'vietpeacestay_current_user';

export function AuthProvider({ children }) {

    console.log("[AuthProvider] Vừa vào hàm provider : AuthProvider !");

    const [currentLoggedInUser, setCurrentLoggedInUser] = useState(null);

    // Hàm kiểm tra token JWT hiện tại với Backend
    const checkAuthen = useCallback(async () => {
        const token = localStorage.getItem("accessToken");

        console.log("[AuthProvider - checkAuthen] localStorage item accessToken : " + token);

        // Nếu Không có token trong localStorage : return false
        if (!token) {
            console.log("[AuthProvider - checkAuthen] localStorage item accessToken khong ton tai ! Dat lich set value cua bien useState currentLoggedInUser thanh null va return false !");
            setCurrentLoggedInUser(null);
            return false;
        }

        try {
            // Nếu có token trong localStorage : gọi API truyền kèm token để check trên server xem token còn hiệu lực hay ko
            const response = await fetch(`${API_URL}/auth/getLoggedInUser`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Token JWT không hợp lệ hoặc hết thời hạn hiệu lực -> return false
            if (response.status === 401) {
                localStorage.removeItem("accessToken");
                setCurrentLoggedInUser(null);

                return false;
            }

            // Các lỗi khác của server
            if (!response.ok) {
                throw new Error("Unable to verify authentication");
            }

            const data = await response.json();

            // Backend (Server) xác nhận Token JWT này hợp lệ và còn hiệu lực
            setCurrentLoggedInUser(data.user);

            return true;

        } catch (error) {
            console.error("checkAuthen error:", error);

            // Không nên tự logout ở đây.
            // Vì lỗi network/server không có nghĩa JWT hết hạn.
            throw error;
        }
    }, []);


    // Hàm Login
    const login = useCallback(async (email, password) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Login failed"
            );
        }

        // Lưu JWT
        localStorage.setItem(
            "accessToken",
            data.accessToken
        );

        // Lưu user vào React state
        setCurrentLoggedInUser(data.user);

        return data.user;
    }, []);

    // Hàm Logout
    const logout = useCallback(() => {
        localStorage.removeItem("accessToken");
        setCurrentLoggedInUser(null);
    }, []);


    /* CODE GOC */
    const [currentUser, setCurrentUser] = useState(() => {
        return getStorage(STORAGE_KEY, {
            id: 101,
            fullName: 'Nguyễn Văn An',
            email: 'nguyenvana@gmail.com',
            phone: '0912345678',
            role: 'CUSTOMER',
            createdAt: '2026-01-15'
        });
    });

    /* CODE GOC */
    const [toast, setToast] = useState(null);
    const showToast = (message, type = 'info') => {
        setToast({ id: Date.now(), message, type });
        setTimeout(() => {
            setToast(null);
        }, 3500);
    };


    // useEffect() for test
    useEffect(() => {
        console.log("[AuthProvider] đang chạy useEffect() của AuthProvider !");
            
        // hàm cleanup
        return () => {
            console.log("[AuthProvider] đang chạy hàm cleanup của useEffect() !");
        };
    });

    const isAuthenticated = currentLoggedInUser ? true : false;

    return (
        <AuthContext.Provider value={{ currentLoggedInUser, isAuthenticated, checkAuthen, currentUser, showToast }}>
            {children}
            {toast && (
                <div className="toast-container">
                <div className={`toast-box ${
                    toast.type === 'success' ? 'toast-box--success' :
                    toast.type === 'error' ? 'toast-box--error' :
                    'toast-box--info'
                }`}>
                    <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}</span>
                    <span>{toast.message}</span>
                </div>
                </div>
            )}
        </AuthContext.Provider>
    )
}

export default AuthContext;

export function useAuth() {
  return useContext(AuthContext);
}