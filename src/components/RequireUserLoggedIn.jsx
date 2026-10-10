import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import AuthContext from "../context/AuthContext";

function RequireUserLoggedIn() {

    console.log("[RequireUserLoggedIn] Vừa vào hàm component RequireUserLoggedIn !");

    const { currentLoggedInUser, isCheckingAuthen, authError, currentUrl, isRouteUrlChanged } = useContext(AuthContext);

    useEffect(() => {
        console.log("[RequireUserLoggedIn] đang chạy useEffect() của component RequireUserLoggedIn !");
        
        // hàm cleanup
        return () => {
            console.log("[RequireUserLoggedIn] đang chạy hàm cleanup của useEffect() !");
        };
    });

    console.log("[RequireUserLoggedIn] useState AuthProvider.isCheckingAuthen : ", isCheckingAuthen);
    console.log("[RequireUserLoggedIn] biến AuthProvider.isRouteUrlChanged : ", isRouteUrlChanged);
    
    if (isCheckingAuthen === true || isRouteUrlChanged === true) {
        console.log("[RequireUserLoggedIn] useState AuthProvider.isCheckingAuthen = true HOẶC AuthProvider.isRouteUrlChanged = true ! Return JSX Element thông báo đang check đăng nhập !");
        return (
            <div>
                <p>Đang kiểm tra đăng nhập...</p>
            </div>
        );
    }

    // Nếu authError !== null : có lỗi về network
    if (authError) {
        console.log("[RequireUserLoggedIn] useState AuthProvider.authError khac NULL ! Return JSX Element thông báo vui lòng check lại kết nối !");
        return (
            <div>
                <h2>Không thể xác minh đăng nhập</h2>
                <p>
                    Vui lòng kiểm tra kết nối và thử lại.
                </p>
            </div>
        );
    }

    // Session dang nhap cua user khong ton tai
    if (!currentLoggedInUser) {
        console.log("[RequireUserLoggedIn] useState AuthProvider.currentLoggedInUser = NULL ! Session đăng nhập của user không tồn tại ! Chuyển qua trang login !");
        return (
            <Navigate to="/login" replace state={{ from: currentUrl }}/>
        );
        // return (
        //     <div>
        //         <p>Bạn chưa đăng nhập ! Vui lòng đăng nhập nhé !</p>
        //     </div>
        // )
    }


    // Session còn tồn tại. Tức là còn đang trong phiên login
    console.log("[RequireUserLoggedIn] useState AuthProvider.currentLoggedInUser khác NULL : ", currentLoggedInUser);
    console.log("[RequireUserLoggedIn] Session còn tồn tại ! Tiếp tục đi đến route con bên trong RequireUserLoggedIn !");

    return <Outlet />;
}

export default RequireUserLoggedIn;
