import { useState, type FormEvent } from 'react';

StaffLogin.route = {
  path: '/staff/login'
};

export default function StaffLogin() {

  interface LoginPayload {
    usernameOrEmail: string;
    password: string;
  }

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
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username or Email:</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit">
        Log In
      </button>
    </form>
  );
};