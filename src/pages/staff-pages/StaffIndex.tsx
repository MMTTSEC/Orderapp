import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotFoundPage from '../general-pages/NotFoundPage'; // Adjust path as needed

// /Orders/new,inprogress & finished from our mockup
StaffIndex.route = {
  path: '/staff/'
};

interface UserData {
  username: string;
  email: string;
  phoneNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
}

export default function StaffIndex() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(true);

  const checkLoginStatus = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else if (response.status === 401) {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:5001/api/auth/login', {
        method: 'DELETE',
        credentials: 'include',
      });
      setIsAuthorized(false);
      navigate('/staff/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  if (!loading) {
    if (!isAuthorized) {
      return <NotFoundPage />;
    }
    else if (isAuthorized) {
      return <>
        <h1>Welcome, {userData?.username}!</h1>
        <button type="button" onClick={logout} style={{ marginTop: '1rem', width: '50%' }}>Logout</button>
      </>
    }
  }
}