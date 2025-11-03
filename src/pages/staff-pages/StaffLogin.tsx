import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/stafflogin.css';

StaffLogin.route = {
  path: '/staff/login'
};

export default function StaffLogin() {

  interface LoginPayload {
    usernameOrEmail: string;
    password: string;
  }

  const navigate = useNavigate();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();


    const payload: LoginPayload = {
      usernameOrEmail: username,
      password: password,
    };

    const apiEndpoint = 'http://localhost:5001/api/auth/login';

    console.log('Attempting to log in with payload:', payload);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful!', data);
        navigate('/staff');
      } else {
        console.error('Login failed with status:', response.status);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        alert(`Login Failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Network or other error during login:', error);
      alert('An unexpected error occurred. Please check your network.');
    }
  };

  return (
    <div className="staff-login-container">
      <form className="staff-login-form" onSubmit={handleSubmit}>
        <div className="brand-logo">
          Brand<br />Logo
        </div>

        <h1 className="welcome-title">Welcome Back!</h1>
        <p className="welcome-subtitle">Log in to manage your orders</p>

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            className="form-input"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="form-input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="login-button">
          Login
        </button>
      </form>
    </div>
  );
};