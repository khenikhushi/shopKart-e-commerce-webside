import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../../api/auth.api';
import { validateRegisterForm } from '../../utils/validate.util';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    phone: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const handleRoleSelect = (selectedRole) => {
    setForm((prev) => ({ ...prev, role: selectedRole }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateRegisterForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      };

      if (form.phone.trim()) {
        payload.phone = form.phone.trim();
      }

      await authApi.register(payload);

      setSuccess(true);

      // Redirect to login after short delay
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Registration failed. Please try again.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="auth-wrapper">
        <div className="auth-header">
          <Link to="/" className="auth-brand">shopKart</Link>
        </div>
        <div className="auth-body">
          <div className="auth-card text-center">
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h2 style={{ marginBottom: 8 }}>
              Account Created!
            </h2>
            <p style={{ color: '#878787', fontSize: 14 }}>
              Your account has been created successfully.
              Redirecting to login...
            </p>
            <div className="spinner-border text-primary mt-3"
              style={{ width: 24, height: 24 }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-header">
        <Link to="/" className="auth-brand">shopKart</Link>
        <span style={{
          color: 'rgba(255,255,255,0.7)',
          marginLeft: 16,
          fontSize: 14,
        }}>
          Register
        </span>
      </div>

      <div className="auth-body">
        <div className="auth-card">
          <h2>Create Account</h2>
          <p className="subtitle">
            Join shopKart — shop or sell with ease.
          </p>

          {apiError && (
            <div className="alert alert-danger py-2 mb-3"
              style={{ fontSize: 13 }}>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* Role Selector */}
            <div className="mb-3">
              <label className="form-label"
                style={{ fontSize: 13, fontWeight: 600 }}>
                I want to
              </label>
              <div className="role-selector">
                <div
                  className={`role-option
                    ${form.role === 'user' ? 'selected' : ''}`}
                  onClick={() => handleRoleSelect('user')}
                >
                  <div className="role-icon">🛍️</div>
                  <div className="role-label">Shop</div>
                  <div style={{ fontSize: 11, color: '#878787',
                    marginTop: 2 }}>
                    Buy products
                  </div>
                </div>
                <div
                  className={`role-option
                    ${form.role === 'seller' ? 'selected' : ''}`}
                  onClick={() => handleRoleSelect('seller')}
                >
                  <div className="role-icon">🏪</div>
                  <div className="role-label">Sell</div>
                  <div style={{ fontSize: 11, color: '#878787',
                    marginTop: 2 }}>
                    List products
                  </div>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div className="mb-3">
              <label className="form-label"
                style={{ fontSize: 13, fontWeight: 600 }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                className={`form-control auth-input
                  ${errors.name ? 'is-invalid' : ''}`}
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.name && (
                <div className="error-text">{errors.name}</div>
              )}
            </div>

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

            {/* Phone (optional) */}
            <div className="mb-3">
              <label className="form-label"
                style={{ fontSize: 13, fontWeight: 600 }}>
                Phone Number{' '}
                <span style={{ color: '#878787',
                  fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="tel"
                name="phone"
                className="form-control auth-input"
                placeholder="+91 9876543210"
                value={form.phone}
                onChange={handleChange}
                disabled={loading}
              />
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
                  placeholder="Min 6 chars with 1 number"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
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
              <div style={{
                fontSize: 11,
                color: '#878787',
                marginTop: 4,
              }}>
                Minimum 6 characters, at least 1 number
              </div>
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
                  <span className="spinner-border
                    spinner-border-sm" />
                  Creating account...
                </span>
              ) : `Create ${form.role === 'seller'
                ? 'Seller' : ''} Account`}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <p style={{ textAlign: 'center', fontSize: 14, margin: 0 }}>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Login</Link>
          </p>

          <p className="auth-terms">
            By creating an account, you agree to shopKart's{' '}
            <a href="#" style={{ color: 'var(--primary)' }}>
              Terms of Use
            </a>{' '}
            and{' '}
            <a href="#" style={{ color: 'var(--primary)' }}>
              Privacy Policy
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;