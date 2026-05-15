import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../../api/auth.api';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import { validateLoginForm } from '../../utils/validate.util';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { refreshCart } = useCart();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const validationErrors = validateLoginForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const res = await authApi.login(form);
      const { token, user } = res.data.data;

      // Save token and update auth context
      login(token, user);

      // Refresh cart count for user role
      if (user.role === 'user') {
        await refreshCart();
      }

      // Redirect based on role (fallback to home)
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate('/home');
      }

    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please try again.';
      console.error('Login error', err);
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-header">
        <Link to="/" className="auth-brand">shopKart</Link>
        <span style={{
          color: 'rgba(255,255,255,0.7)',
          marginLeft: 16,
          fontSize: 14,
        }}>
          Login
        </span>
      </div>

      <div className="auth-body">
        <div className="auth-card">
          <h2>Login</h2>
          <p className="subtitle">
            Welcome back! Sign in to your account.
          </p>

          {/* API Error */}
          {apiError && (
            <div className="alert alert-danger py-2 mb-3"
              style={{ fontSize: 13 }}>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="mb-3">
              <label className="form-label"
                style={{ fontSize: 13, fontWeight: 600 }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className={`form-control auth-input
                  ${errors.email ? 'is-invalid' : ''}`}
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={loading}
              />
              {errors.email && (
                <div className="error-text">{errors.email}</div>
              )}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="form-label"
                style={{ fontSize: 13, fontWeight: 600 }}>
                Password
              </label>
              <div className="position-relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-control auth-input
                    ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={loading}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#878787',
                    padding: 0,
                    fontSize: 13,
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && (
                <div className="error-text">{errors.password}</div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="d-flex align-items-center
                  justify-content-center gap-2">
                  <span className="spinner-border spinner-border-sm" />
                  Signing in...
                </span>
              ) : 'Login'}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <p style={{ textAlign: 'center', fontSize: 14, margin: 0 }}>
            New to shopKart?{' '}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
