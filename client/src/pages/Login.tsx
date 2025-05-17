// File: src/pages/Login.tsx
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import '../styles/Login.css';

const Login: React.FC = () => {
  const intl = useIntl();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = intl.formatMessage({ 
        id: 'login.error.emailRequired', 
        defaultMessage: 'Email is required' 
      });
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = intl.formatMessage({ 
        id: 'login.error.emailInvalid', 
        defaultMessage: 'Email is invalid' 
      });
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = intl.formatMessage({ 
        id: 'login.error.passwordRequired', 
        defaultMessage: 'Password is required' 
      });
    } else if (formData.password.length < 6) {
      newErrors.password = intl.formatMessage({ 
        id: 'login.error.passwordTooShort', 
        defaultMessage: 'Password must be at least 6 characters' 
      });
    }

    // Registration specific validations
    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = intl.formatMessage({ 
          id: 'login.error.nameRequired', 
          defaultMessage: 'Name is required' 
        });
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = intl.formatMessage({ 
          id: 'login.error.confirmPasswordRequired', 
          defaultMessage: 'Please confirm your password' 
        });
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = intl.formatMessage({ 
          id: 'login.error.passwordMismatch', 
          defaultMessage: 'Passwords do not match' 
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Login logic
        console.log('Logging in:', formData.email);
        // Here you would typically call your authentication API
        // const response = await auth.login(formData.email, formData.password);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Store auth token or user data
        localStorage.setItem('authToken', 'dummy-token');
        localStorage.setItem('user', JSON.stringify({ 
          email: formData.email, 
          name: formData.name || 'User' 
        }));
        
        // Redirect to dashboard
        window.location.href = '/';
      } else {
        // Registration logic
        console.log('Registering:', formData.email);
        // Here you would typically call your registration API
        // const response = await auth.register(formData);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Store auth token or user data
        localStorage.setItem('authToken', 'dummy-token');
        localStorage.setItem('user', JSON.stringify({ 
          email: formData.email, 
          name: formData.name 
        }));
        
        // Redirect to dashboard
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setErrors({
        general: intl.formatMessage({ 
          id: 'login.error.general', 
          defaultMessage: 'Authentication failed. Please try again.' 
        })
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
    });
    setErrors({});
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <span className="logo-icon">📊</span>
            <span className="logo-text">
              {intl.formatMessage({ id: 'app.title', defaultMessage: 'Investment Tracker' })}
            </span>
          </div>
          <h1>
            {isLogin 
              ? intl.formatMessage({ id: 'login.title', defaultMessage: 'Login' })
              : intl.formatMessage({ id: 'login.register', defaultMessage: 'Create Account' })
            }
          </h1>
          <p className="login-subtitle">
            {isLogin
              ? intl.formatMessage({ id: 'login.subtitle', defaultMessage: 'Welcome back to your investment tracker' })
              : intl.formatMessage({ id: 'login.registerSubtitle', defaultMessage: 'Start tracking your investments today' })
            }
          </p>
        </div>

        {errors.general && (
          <div className="error-message general-error">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">
                {intl.formatMessage({ id: 'login.name', defaultMessage: 'Full Name' })}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                placeholder={intl.formatMessage({ id: 'login.namePlaceholder', defaultMessage: 'Enter your full name' })}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              {intl.formatMessage({ id: 'login.email', defaultMessage: 'Email' })}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              placeholder={intl.formatMessage({ id: 'login.emailPlaceholder', defaultMessage: 'Enter your email' })}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              {intl.formatMessage({ id: 'login.password', defaultMessage: 'Password' })}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? 'error' : ''}
              placeholder={intl.formatMessage({ id: 'login.passwordPlaceholder', defaultMessage: 'Enter your password' })}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">
                {intl.formatMessage({ id: 'login.confirmPassword', defaultMessage: 'Confirm Password' })}
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder={intl.formatMessage({ id: 'login.confirmPasswordPlaceholder', defaultMessage: 'Confirm your password' })}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          )}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <span className="loading-spinner">
                <span className="spinner"></span>
                {intl.formatMessage({ id: 'login.loading', defaultMessage: 'Please wait...' })}
              </span>
            ) : isLogin ? (
              intl.formatMessage({ id: 'login.submit', defaultMessage: 'Login' })
            ) : (
              intl.formatMessage({ id: 'login.registerSubmit', defaultMessage: 'Create Account' })
            )}
          </button>
        </form>

        {isLogin && (
          <div className="login-footer">
            <a href="#" className="forgot-password">
              {intl.formatMessage({ id: 'login.forgotPassword', defaultMessage: 'Forgot Password?' })}
            </a>
          </div>
        )}

        <div className="login-switch">
          <p>
            {isLogin
              ? intl.formatMessage({ id: 'login.noAccount', defaultMessage: "Don't have an account?" })
              : intl.formatMessage({ id: 'login.hasAccount', defaultMessage: 'Already have an account?' })
            }
            <button
              type="button"
              className="switch-button"
              onClick={handleToggleMode}
            >
              {isLogin
                ? intl.formatMessage({ id: 'login.registerHere', defaultMessage: 'Register here' })
                : intl.formatMessage({ id: 'login.loginHere', defaultMessage: 'Login here' })
              }
            </button>
          </p>
        </div>

        <div className="login-features">
          <h3>
            {intl.formatMessage({ id: 'login.features', defaultMessage: 'Why choose our platform?' })}
          </h3>
          <ul>
            <li>
              <span className="feature-icon">🔒</span>
              {intl.formatMessage({ id: 'login.feature1', defaultMessage: 'Secure data encryption' })}
            </li>
            <li>
              <span className="feature-icon">📊</span>
              {intl.formatMessage({ id: 'login.feature2', defaultMessage: 'Multi-platform support' })}
            </li>
            <li>
              <span className="feature-icon">📱</span>
              {intl.formatMessage({ id: 'login.feature3', defaultMessage: 'Real-time tracking' })}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;