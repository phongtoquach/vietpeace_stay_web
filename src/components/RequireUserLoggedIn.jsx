import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import AuthContext from "../context/AuthContext";

function RequireUserLoggedIn() {

    console.log("[RequireUserLoggedIn] Vừa vào hàm component RequireUserLoggedIn !");

    const { checkAuthen } = useContext(AuthContext);

    const { pathname } = useLocation();
    console.log("[RequireUserLoggedIn] pathname (URL web) hien tai : " + pathname);

    useEffect(() => {
        console.log("[RequireUserLoggedIn] đang chạy useEffect() của component RequireUserLoggedIn !");
        
        // hàm cleanup
        return () => {
            console.log("[RequireUserLoggedIn] đang chạy hàm cleanup của useEffect() !");
        };
    });

    const [authenStatus, setAuthenStatus] = useState("checking");

    useEffect(() => {
        console.log("[RequireUserLoggedIn] đang chạy useEffect() gọi hàm AuthProvider.checkAuthen() !");

        let isActive = true;
        setAuthenStatus("checking");

        checkAuthen().then((isValid) => {
                if (!isActive) {
                    return;
                }

                if (isValid) {
                    setAuthenStatus("authenticated");
                } else {
                    console.log("[RequireUserLoggedIn - checkAuthen] isValid = false ! Dat lich set value cua bien useState authenStatus thanh : unauthenticated");
                    setAuthenStatus("unauthenticated");
                }
            })
            .catch((error) => {
                console.error("Authentication check failed:",error);

                if (isActive) {
                    setAuthenStatus("error");
                }
            });

        // hàm cleanup
        return () => {
            console.log("[RequireUserLoggedIn] đang chạy hàm cleanup của useEffect() gọi hàm AuthProvider.checkAuthen() !");
            isActive = false;
        };

    }, [pathname, checkAuthen]);
    // [pathname, checkAuthen]


    // Đang kiểm tra JWT
    if (authenStatus === "checking") {
        console.log("[RequireUserLoggedIn] Value hien tai cua bien useState authenStatus la checking ! Return 1 JSX Element tạm !");
        return (
            <div>
                <p>Đang kiểm tra đăng nhập...</p>
            </div>
        );
    }

    // JWT không hợp lệ / hết hạn / không tồn tại
    if (authenStatus === "unauthenticated") {
        console.log("[RequireUserLoggedIn] Value hien tai cua bien useState authenStatus la unauthenticated ! Chuyen qua trang login !");
        return (
            <Navigate to="/login" replace state={{ from: pathname }}/>
        );
        // return (
        //     <div>
        //         <p>Bạn chưa đăng nhập ! Vui lòng đăng nhập nhé !</p>
        //     </div>
        // )
    }

    // Không thể kết nối server
    if (authenStatus === "error") {
        console.log("[RequireUserLoggedIn] Value hien tai cua bien useState authenStatus la error ! Return 1 JSX Element thông báo vui lòng check lại kết nối !");
        return (
            <div>
                <h2>Không thể xác minh đăng nhập</h2>
                <p>
                    Vui lòng kiểm tra kết nối và thử lại.
                </p>
            </div>
        );
    }

    // JWT hợp lệ
    console.log("[RequireUserLoggedIn] Value hien tai cua bien useState authenStatus la : " + authenStatus + " ! Token còn hiệu lực ! Tiếp tục đi đến route con bên trong RequireUserLoggedIn !");
    return <Outlet />;
}

export default RequireUserLoggedIn;
