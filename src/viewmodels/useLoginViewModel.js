import { useState } from 'react';
import apiClient from '../services/apiClient';
import authModel from '../models/authModel';

export default function useLoginViewModel(onSuccess) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation and API states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Basic regex for email validation
  const validateEmailFormat = (val) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val);
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (emailError) {
      if (val.trim() === '') {
        setEmailError('Email is required');
      } else if (!validateEmailFormat(val)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (passwordError) {
      if (val.trim() === '') {
        setPasswordError('Password is required');
      } else {
        setPasswordError('');
      }
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const validateInputs = () => {
    let isValid = true;

    if (!email || email.trim() === '') {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmailFormat(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password || password.trim() === '') {
      setPasswordError('Password is required');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    
    setApiError('');

    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);

    try {
      // Calling API endpoint: POST /auth/admin/login
      const response = await apiClient.post('/auth/admin/login', {
        email: email.trim(),
        password: password
      });

      if (response && response.success && response.result && response.result.data) {
        // Save auth data to storage model
        authModel.saveAuth(response.result.data);
        
        // Trigger success callback
        if (onSuccess) {
          onSuccess(response.result.data.user);
        }
      } else {
        setApiError(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login VM Error:', err);
      setApiError(err.message || 'An unexpected error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    password,
    showPassword,
    emailError,
    passwordError,
    isLoading,
    apiError,
    setApiError,
    handleEmailChange,
    handlePasswordChange,
    toggleShowPassword,
    handleSubmit,
  };
}
