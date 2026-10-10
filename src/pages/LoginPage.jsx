import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
    console.log("[LoginPage] Vừa vào hàm component LoginPage !");

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    //const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const returnUrl = searchParams.get('returnUrl') || '/';

    useEffect(() => {
        console.log("[LoginPage] đang chạy useEffect() của component LoginPage !");
        
        // hàm cleanup
        return () => {
            console.log("[LoginPage] đang chạy hàm cleanup của useEffect() !");
        };
    });


    const handleSubmit = async (e) => {
        e.preventDefault();

        const api_response = await fetch(`http://localhost:3002/api/web/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });
        console.log("[LoginPage - handleSubmit] Response cua API /auth/login : ", api_response);

        if (!api_response.ok) {
            alert("Calling login API has been failed !");
        }

        const response_data = await api_response.json();
        console.log("[LoginPage - handleSubmit] API response OK ! Data cua response_data : ", response_data);

        navigate("/");

        // const success = login(email, password);
        // if (success) {
        //     navigate(returnUrl);
        // }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-ivory)', padding: '3.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="auth-card">
                
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <Link to="/" className="brand-text" style={{ display: 'inline-block', marginBottom: '12px' }}>
                    VietPeace <span>Stay</span>
                </Link>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-navy)' }}>Đăng Nhập Khách Hàng</h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-slate)', marginTop: '4px' }}>Đăng nhập để đặt phòng và hưởng ưu đãi trực tiếp.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '4px' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="auth-input"
                        />
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)' }}>Mật khẩu</label>
                        <a href="#" style={{ fontSize: '12px', color: 'var(--color-sunshine)', fontWeight: 600, textDecoration: 'underline' }}>Quên mật khẩu?</a>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="auth-input"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary btn-primary--full"
                        style={{ padding: '12px', borderRadius: 'var(--radius-lg)' }}
                    >
                        Đăng Nhập
                    </button>

                </form>

                <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', marginTop: '1.5rem', textAlign: 'center', fontSize: '12px', color: 'var(--color-slate)' }}>
                    Chưa có tài khoản?{' '}
                    <Link to="/register" style={{ color: 'var(--color-navy)', fontWeight: 700, textDecoration: 'underline' }}>
                        Đăng ký thành viên
                    </Link>
                </div>

            </div>
        </div>
    );
}
