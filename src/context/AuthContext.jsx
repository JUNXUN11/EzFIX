import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { ClipLoader } from 'react-spinners';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const initAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser); 
      } else {
        await authService.refreshToken();
        setUser(authService.getCurrentUser());
      }
    } catch (error) {
      navigate('/auth/sign-in');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    setUser(data.user);
    navigate('/dashboard/home');
  };

  const register = async (username, email, password) => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.register(username, email, password);
      setUser({ token: data.accessToken, user: data.user });
      navigate('/dashboard/home');
    } catch (err) {
      setError(err.message);
      console.error('Registration failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    navigate('/auth/sign-in');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {loading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <ClipLoader size={50} color="#123abc" loading={loading} />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
