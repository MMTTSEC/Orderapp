import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotFoundPage from '../general-pages/NotFoundPage';
import { checkLoginStatus, logout, type UserData } from '../../auth/authUtils';

// /Orders/new,inprogress & finished from our mockup
StaffIndex.route = {
  path: '/staff/'
};

export default function StaffIndex() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(true);

  const verifyLogin = async () => {
    const { isAuthorized: authorized, userData: data } = await checkLoginStatus();
    setIsAuthorized(authorized);
    setUserData(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      setIsAuthorized(false);
      navigate('/staff/login');
    }
  };

  useEffect(() => {
    verifyLogin();
  }, []);

  if (!loading) {
    if (!isAuthorized) {
      return <NotFoundPage />;
    }
    else if (isAuthorized) {
      return <>
        <h1>Welcome, {userData?.username}!</h1>
        <button type="button" onClick={handleLogout} style={{ marginTop: '1rem', width: '50%' }}>Logout</button>
      </>
    }
  }
}