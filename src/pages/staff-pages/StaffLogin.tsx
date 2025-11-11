import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkLoginStatus } from '../../auth/authUtils';
import '../../styles/stafflogin.css';
import burgerLogo from '../../assets/logo.png';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyLogin = async () => {
      const { isAuthorized } = await checkLoginStatus();
      if (isAuthorized) {
        navigate('/staff');
      } else {
        setLoading(false);
      }
    };

    verifyLogin();
  }, [navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();


    const payload: LoginPayload = {
      usernameOrEmail: username,
      password: password,
    };

    const apiEndpoint = '/api/auth/login';

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        navigate('/staff');
      } else {
        const errorText = await response.text();
        console.error('Login failed:', response.status, errorText);
        alert(`Login Failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Network error during login:', error);
      alert('An unexpected error occurred. Please check your network.');
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="staff-login-container">
      <form className="staff-login-form" onSubmit={handleSubmit}>
        <div className="brand-logo">
          <img src={burgerLogo} alt="Burger Bliss Logo" />
        </div>

        <h1 className="welcome-title">Välkommen Tillbaka!</h1>
        <p className="welcome-subtitle">Logga in för att hantera beställningar</p>

        <div className="form-group">
          <label htmlFor="username">Användarnamn</label>
          <input
            id="username"
            type="text"
            className="form-input"
            placeholder="Ange ditt användarnamn"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Lösenord</label>
          <input
            id="password"
            type="password"
            className="form-input"
            placeholder="Ange ditt lösenord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="login-button">
          Logga in
        </button>
      </form>
    </div>
  );
};