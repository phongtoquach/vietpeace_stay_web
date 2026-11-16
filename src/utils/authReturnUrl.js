export function resolveSafeReturnUrl(rawUrl) {
    if (typeof rawUrl !== 'string' || !rawUrl.startsWith('/') || rawUrl.startsWith('//')
        || rawUrl.includes('\\') || [...rawUrl].some(char => char.charCodeAt(0) <= 31 || char.charCodeAt(0) === 127)) return '/';
    return rawUrl;
}

export function customerLoginHref({ email = '', returnUrl = '', requireCode = false } = {}) {
    const query = new URLSearchParams();
    if (email) query.set('email', email);
    if (requireCode) query.set('verify', '1');
    const safeReturnUrl = resolveSafeReturnUrl(returnUrl);
    if (safeReturnUrl !== '/') query.set('returnUrl', safeReturnUrl);
    return `/login${query.size ? `?${query}` : ''}`;
}
