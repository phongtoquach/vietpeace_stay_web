const API_URL = (import.meta.env?.VITE_API_URL || 'http://localhost:3002/api/web').replace(/\/$/, '');

export const DUPLICATE_EMAIL_MESSAGE = 'Địa chỉ Email này đã được sử dụng! Vui lòng nhập email khác!';

export function validateRegistration(values) {
  const errors = {};
  if (!values.fullName.trim()) errors.fullName = 'Vui lòng nhập họ và tên của bạn.';
  if (!values.email.trim()) errors.email = 'Vui lòng nhập email.';
  else if (values.email.trim().length > 255 || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(values.email.trim())) errors.email = 'Email không đúng định dạng.';
  if (!values.phone.trim()) errors.phone = 'Vui lòng nhập số điện thoại.';
  else if (!/^[+0-9 ()-]{9,20}$/.test(values.phone.trim()) || !/\d/.test(values.phone)) errors.phone = 'Số điện thoại không đúng định dạng.';
  if (!values.password) errors.password = 'Vui lòng nhập mật khẩu.';
  else if (values.password.length < 8) errors.password = 'Mật khẩu phải có ít nhất 8 ký tự.';
  else if (new TextEncoder().encode(values.password).length > 72) errors.password = 'Mật khẩu không được vượt quá 72 byte UTF-8.';
  if (!values.confirmPassword) errors.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
  else if (values.password !== values.confirmPassword) errors.confirmPassword = 'Mật khẩu xác nhận chưa khớp. Bạn kiểm tra lại nhé.';
  return errors;
}

export async function registerCustomer(values) {
  let response;
  try {
    response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        full_name: values.fullName.trim(),
        display_name: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        phone_number: values.phone.trim(),
        password: values.password,
      }),
    });
  } catch {
    throw new Error('Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối và thử lại.');
  }
  if (response.status === 409) return { errors: { email: DUPLICATE_EMAIL_MESSAGE } };
  const data = await response.json().catch(() => null);
  if (response.status === 201 && data?.success === true) {
    return { success: true, message: data.message || 'Đăng ký thành công!', verification: data.verification };
  }
  if (response.status === 400 && data?.errors) {
    const fields = { full_name: 'fullName', display_name: 'fullName', email: 'email', phone_number: 'phone', password: 'password' };
    const errors = {};
    for (const [key, value] of Object.entries(data.errors)) {
      if (fields[key] && typeof value === 'string') errors[fields[key]] = value;
    }
    if (Object.keys(errors).length) return { errors };
  }
  throw new Error('Không thể đăng ký lúc này. Vui lòng thử lại sau.');
}
