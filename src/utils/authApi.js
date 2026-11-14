export function getWebApiBaseUrl() {
    return (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api/web').replace(/\/$/, '');
}

async function postAuthJson(endpoint, payload) {
    const response = await fetch(`${getWebApiBaseUrl()}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
    });

    const data = await response.json().catch(() => ({}));
    return {
        ok: response.ok,
        status: response.status,
        data,
    };
}

export function registerCustomerAccount(payload) {
    return postAuthJson('/auth/register', payload);
}

export function verifyCustomerEmailToken(token) {
    return postAuthJson('/auth/verify-email', { token });
}

export function resendCustomerVerification(email) {
    return postAuthJson('/auth/resend-verification', { email });
}
