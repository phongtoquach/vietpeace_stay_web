export function getWebApiBaseUrl() {
    return (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api/web').replace(/\/$/, '');
}

async function requestAuthJson(endpoint, { method = 'POST', payload } = {}) {
    const response = await fetch(`${getWebApiBaseUrl()}${endpoint}`, {
        method,
        headers: payload !== undefined ? { 'Content-Type': 'application/json' } : {},
        body: payload !== undefined ? JSON.stringify(payload) : undefined,
        credentials: 'include',
        cache: method === 'GET' ? 'no-store' : 'default',
    });

    const data = await response.json().catch(() => ({}));
    return {
        ok: response.ok,
        status: response.status,
        data,
    };
}

export function getCustomerCaptchaChallenge() {
    return requestAuthJson('/auth/captcha', { method: 'GET' });
}

export function verifyCustomerCaptchaChallenge(payload) {
    return requestAuthJson('/auth/captcha/verify', { method: 'POST', payload });
}

export function loginCustomerAccount(payload) {
    return requestAuthJson('/auth/login', { method: 'POST', payload });
}

export function registerCustomerAccount(payload) {
    return requestAuthJson('/auth/register', { method: 'POST', payload });
}

export function verifyCustomerEmailToken(token) {
    return requestAuthJson('/auth/verify-email', { method: 'POST', payload: { token } });
}

export function verifyCustomerEmailCode({ email, code }) {
    return requestAuthJson('/auth/verify-email', { method: 'POST', payload: { email, code } });
}

export function resendCustomerVerification(email) {
    return requestAuthJson('/auth/resend-verification', { method: 'POST', payload: { email } });
}

export function requestCustomerNewPassword(email) {
    return requestAuthJson('/auth/forgot-password', { method: 'POST', payload: { email } });
}

export const REMEMBERED_CUSTOMER_AUTH_STORAGE_KEY = 'vietpeace_customer_remember_auth';

export function readRememberedCustomerAuth() {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(REMEMBERED_CUSTOMER_AUTH_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        const savedEmail = typeof parsed.email === 'string' ? parsed.email.trim() : '';
        if (!savedEmail || !parsed.rememberMe) return null;
        return { email: savedEmail, rememberMe: true };
    } catch {
        return null;
    }
}

export function saveRememberedCustomerAuth(email) {
    if (typeof window === 'undefined') return;
    try {
        const trimmedEmail = typeof email === 'string' ? email.trim() : '';
        if (!trimmedEmail) return;
        window.localStorage.setItem(
            REMEMBERED_CUSTOMER_AUTH_STORAGE_KEY,
            JSON.stringify({ email: trimmedEmail, rememberMe: true }),
        );
    } catch {
        // Bỏ qua nếu localStorage bị hạn chế
    }
}

export function clearRememberedCustomerAuth() {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.removeItem(REMEMBERED_CUSTOMER_AUTH_STORAGE_KEY);
    } catch {
        // Bỏ qua nếu localStorage bị hạn chế
    }
}

export function preventSilentCustomerCredentialAccess() {
    if (typeof navigator !== 'undefined' && typeof navigator?.credentials?.preventSilentAccess === 'function') {
        return navigator.credentials.preventSilentAccess().catch(() => {});
    }
    return Promise.resolve();
}
