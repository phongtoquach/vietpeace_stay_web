import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerCustomer, validateRegistration, DUPLICATE_EMAIL_MESSAGE } from '../src/services/registration.js';

const values = { fullName: 'Nguyễn An', email: 'an@example.com', phone: '0912345678', password: 'password123', confirmPassword: 'password123' };

test('required fields, invalid email and password mismatch are rejected', () => {
  assert.equal(Object.keys(validateRegistration(Object.fromEntries(Object.keys(values).map(key => [key, ''])))).length, 5);
  assert.ok(validateRegistration({ ...values, email: 'invalid' }).email);
  assert.ok(validateRegistration({ ...values, confirmPassword: 'different' }).confirmPassword);
  assert.deepEqual(validateRegistration(values), {});
  assert.ok(validateRegistration({ ...values, password: 'ấ'.repeat(25) }).password);
});

test('registration API response handling without database access', async t => {
  const mock = t.mock.method(globalThis, 'fetch');
  for (const email of ['customer@example.com', 'admin@example.com', '  ADMIN@EXAMPLE.COM  ']) {
    mock.mock.mockImplementation(async (url, options) => {
      assert.match(url, /\/api\/web\/auth\/register$/);
      assert.equal(options.method, 'POST');
      assert.deepEqual(JSON.parse(options.body), {
        full_name: values.fullName, display_name: values.fullName,
        email: email.trim().toLowerCase(), phone_number: values.phone, password: values.password,
      });
      return new Response('', { status: 409 });
    });
    assert.deepEqual(await registerCustomer({ ...values, email }), { errors: { email: DUPLICATE_EMAIL_MESSAGE } });
  }
  mock.mock.mockImplementation(async () => Response.json({ success: true, customer: { id: 1 } }, { status: 201 }));
  assert.deepEqual(await registerCustomer(values), { success: true, message: 'Đăng ký thành công!', verification: undefined });
  mock.mock.mockImplementation(async () => Response.json({ errors: { email: 'Email không đúng định dạng.', full_name: 'Thiếu họ tên.' } }, { status: 400 }));
  assert.deepEqual(await registerCustomer(values), { errors: { email: 'Email không đúng định dạng.', fullName: 'Thiếu họ tên.' } });
  for (const status of [200, 500, 502]) {
    mock.mock.mockImplementation(async () => new Response('invalid', { status }));
    await assert.rejects(registerCustomer(values), /Không thể đăng ký/);
  }
  mock.mock.mockImplementation(async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(registerCustomer(values), /Không thể kết nối máy chủ/);
});


test('preserves delivery failure message from backend after account creation', async t => {
  const message = 'Tài khoản đã được tạo nhưng chưa gửi được email xác minh.';
  t.mock.method(globalThis, 'fetch', async () => Response.json({ success: true, message, verification: { required: true, emailSent: false } }, { status: 201 }));
  const result = await registerCustomer(values);
  assert.equal(result.message, message);
  assert.equal(result.verification.emailSent, false);
});
