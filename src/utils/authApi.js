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
