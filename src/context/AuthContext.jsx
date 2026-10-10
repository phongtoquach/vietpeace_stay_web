import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";

import { getStorage, setStorage, removeStorage } from '../utils/bookingUtils.js';

const AuthContext = createContext();

const API_URL = "http://localhost:3002/api/web";

const STORAGE_KEY = 'vietpeacestay_current_user';

export function AuthProvider({ children }) {

    console.log("[AuthProvider] Vừa vào hàm provider : AuthProvider !");

    const { pathname, search } = useLocation();
    const currentUrl = pathname + search;
    console.log("[AuthProvider] currentUrl la : " + currentUrl);

    const [currentLoggedInUser, setCurrentLoggedInUser] = useState(null);

    // Phân biệt:
    // true  = đang gọi API kiểm tra authentication
    // false = đã kiểm tra xong
    const [isCheckingAuthen, setIsCheckingAuthen] = useState(true);

    // Lưu lỗi khi không thể kiểm tra authentication
    const [authError, setAuthError] = useState(null);

    const refRouteUrl = useRef(currentUrl);
    console.log("[AuthProvider] Value hiện tại của biến refRouteUrl : " + refRouteUrl.current);

    const isRouteUrlChanged = (currentUrl !== refRouteUrl.current) ? true : false;
    console.log("[AuthProvider] Value cua bien isRouteUrlChanged : ", isRouteUrlChanged);

    if (isRouteUrlChanged) {
        refRouteUrl.current = currentUrl;
    }

    // Hàm kiểm tra token JWT hiện tại với Backend
    const checkAuthen = useCallback(async () => {
        console.log("[AuthProvider - checkAuthen] setIsCheckingAuthen(true) !");
        setIsCheckingAuthen(true);
        console.log("[AuthProvider - checkAuthen] setAuthError(null) !");
        setAuthError(null);

        try {
            const api_response = await fetch(`${API_URL}/auth/loggedin-user`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            console.log("[AuthProvider - checkAuthen] Response cua API /auth/loggedin-user : ", api_response);

            if (!api_response.ok) {
                // status code 401 xác nhận session đăng nhập của user không tồn tại
                if (api_response.status === 401) {
                    console.log("[AuthProvider - checkAuthen] status code cua response cua API /auth/loggedin-user la 401 ! setCurrentLoggedInUser(null) va return false !");
                    setCurrentLoggedInUser(null);
                    return false;
                }

                // Các lỗi HTTP khác, ví dụ 500
                // không đồng nghĩa user đã logout
                throw new Error( `Authentication API failed: ${response.status}` );
            }
            
            const response_data = await api_response.json();
            console.log("[AuthProvider - checkAuthen] API response OK và Login Session còn tồn tại ! Data của response_data : ", response_data);
            console.log("[AuthProvider - checkAuthen] setCurrentLoggedInUser(response_data.data.customerInfo) va return true !");
            setCurrentLoggedInUser(response_data.data.customerInfo);

            return true;
        }
        catch (error) {
            console.error("[AuthProvider - checkAuthen - catch] checkAuthen() failed:", error);

            // Network error / server error:
            // không nên tự động kết luận user đã logout.
            setAuthError(error);

            throw error;
        } finally {
            console.log("[AuthProvider - checkAuthen - finally] setIsCheckingAuthen(false) !");
            setIsCheckingAuthen(false);
        }

    }, []);


    // useEffect() for test
    useEffect(() => {
        console.log("[AuthProvider] đang chạy useEffect() của AuthProvider !");
            
        // hàm cleanup
        return () => {
            console.log("[AuthProvider] đang chạy hàm cleanup của useEffect() !");
        };
    });


    // Gọi checkAuthen() trong useEffect()
    useEffect(() => {
        console.log("[AuthProvider] đang chạy useEffect() gọi hàm checkAuthen() !");

        checkAuthen();

        // hàm cleanup
        return () => {
            console.log("[AuthProvider] đang chạy hàm cleanup của useEffect() gọi hàm checkAuthen() !");
        };

    }, [currentUrl, checkAuthen]);


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


    // Hàm logout customer
    const logout = useCallback(() => {    
        setCurrentLoggedInUser(null);
    }, []);


    // CODE GOC - Hàm Logout
    // const logout = useCallback(() => {
    //     localStorage.removeItem("accessToken");
    //     setCurrentLoggedInUser(null);
    // }, []);


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


    

    return (
        <AuthContext.Provider value={{
            currentLoggedInUser,
            isCheckingAuthen,
            authError,
            currentUrl,
            isRouteUrlChanged,
            currentUser,    // biến cũ
            showToast       // biến cũ
        }}>
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