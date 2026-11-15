import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';

export default function RequireUserLoggedIn() {
    const { currentLoggedInUser, isCheckingAuthen, authError, currentUrl, refreshAuth } = useAuth();
    if (isCheckingAuthen) return <p>Đang kiểm tra đăng nhập...</p>;
    if (!currentLoggedInUser && authError) return <div>
        <h2>Không thể xác minh đăng nhập</h2>
        <p>Vui lòng kiểm tra kết nối và thử lại.</p>
        <button type="button" onClick={refreshAuth}>Thử lại</button>
    </div>;
    if (!currentLoggedInUser) return <Navigate to="/login" replace state={{ from: currentUrl }} />;
    return <Outlet />;
}
