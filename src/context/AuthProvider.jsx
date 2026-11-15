import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthContext from './AuthContext.jsx';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api/web').replace(/\/+$/, '');

export default function AuthProvider({ children }) {
    const { pathname, search } = useLocation();
    const currentUrl = pathname + search;
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isCheckingAuthen, setChecking] = useState(true);
    const [authError, setAuthError] = useState(null);
    const [refreshTick, setRefreshTick] = useState(0);
    const authRevision = useRef(0);
    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);

    const setCurrentLoggedInUser = useCallback((nextUser) => {
        // An older session check must not undo a successful login/logout.
        authRevision.current += 1;
        setUser(nextUser);
        setAuthError(null);
        setChecking(false);
    }, []);
    const refreshAuth = useCallback(() => setRefreshTick(tick => tick + 1), []);
    const showToast = useCallback((message, type = 'info') => {
        clearTimeout(toastTimer.current);
        setToast({ message, type });
        toastTimer.current = setTimeout(() => setToast(null), 3500);
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const revision = authRevision.current;
        const isCurrent = () => !controller.signal.aborted && revision === authRevision.current;
        // Only the first check blocks rendering. Navigation revalidates in the
        // background while the server continues enforcing access on every API.
        async function checkSession() {
            try {
                const response = await fetch(`${API_BASE}/auth/loggedin-user`, {
                    credentials: 'include', cache: 'no-store', signal: controller.signal,
                });
                if (response.status === 401) {
                    if (isCurrent()) { setUser(null); setAuthError(null); }
                    return;
                }
                const payload = await response.json();
                if (!response.ok || !payload?.success || !payload?.data?.customerInfo) {
                    throw new Error(payload?.message || `Authentication API failed: ${response.status}`);
                }
                if (isCurrent()) { setUser(payload.data.customerInfo); setAuthError(null); }
            } catch (error) {
                if (isCurrent()) setAuthError(error);
            } finally {
                if (isCurrent()) setChecking(false);
            }
        }
        checkSession();
        return () => controller.abort();
    }, [currentUrl, refreshTick]);

    useEffect(() => {
        window.addEventListener('focus', refreshAuth);
        window.addEventListener('pageshow', refreshAuth);
        return () => {
            window.removeEventListener('focus', refreshAuth);
            window.removeEventListener('pageshow', refreshAuth);
            clearTimeout(toastTimer.current);
        };
    }, [refreshAuth]);

    const logout = useCallback(async () => {
        authRevision.current += 1;
        try {
            const response = await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
            if (!response.ok && response.status !== 401) throw new Error(`Logout failed: ${response.status}`);
            setCurrentLoggedInUser(null);
            navigate('/', { replace: true });
            return response.ok;
        } catch {
            showToast('Không thể đăng xuất lúc này. Vui lòng kiểm tra kết nối và thử lại.', 'error');
            return false;
        }
    }, [navigate, setCurrentLoggedInUser, showToast]);

    const postAction = useCallback(async (endpoint, body, fallbackCode, fallbackMessage) => {
        const revision = authRevision.current;
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
            });
            const payload = await response.json().catch(() => ({}));
            if (response.status === 401 && revision === authRevision.current) setCurrentLoggedInUser(null);
            if (!response.ok || !payload?.success) return {
                success: false, errorCode: payload?.errorCode || fallbackCode,
                message: payload?.message || fallbackMessage, errors: payload?.errors || {},
            };
            return { success: true, message: payload.message || '', data: payload.data || null };
        } catch {
            return { success: false, errorCode: 'NETWORK_ERROR', message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.', errors: {} };
        }
    }, [setCurrentLoggedInUser]);

    const updateProfile = useCallback(async ({ fullName, displayName, phoneNumber, phone } = {}) => {
        const revision = authRevision.current;
        const result = await postAction('/customer/profile/update', { fullName, displayName, phoneNumber: phoneNumber ?? phone },
            'UPDATE_PROFILE_FAILED', 'Không thể cập nhật thông tin tài khoản.');
        if (result.success && revision === authRevision.current) {
            const updated = result.data?.customerInfo || result.data;
            if (updated) setCurrentLoggedInUser(previous => ({ ...(previous || {}), ...updated }));
        }
        return result;
    }, [postAction, setCurrentLoggedInUser]);

    const changePassword = useCallback(async ({ currentPassword, newPassword, confirmPassword } = {}) =>
        postAction('/customer/change-password', { currentPassword, newPassword, confirmPassword },
            'CHANGE_PASSWORD_FAILED', 'Không thể đổi mật khẩu.'), [postAction]);

    return (
        <AuthContext.Provider value={{
            currentLoggedInUser: user, setCurrentLoggedInUser, isCheckingAuthen, authError,
            currentUrl, currentPathName: pathname, logout, updateProfile, changePassword, showToast, refreshAuth,
        }}>
            {children}
            {toast && <div className="toast-container"><div className={`toast-box toast-box--${toast.type}`}>
                <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}</span>
                <span>{toast.message}</span>
            </div></div>}
        </AuthContext.Provider>
    );
}
