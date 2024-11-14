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
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        setUser(storedUser); 
        setLoading(false);
      } else {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          const user = {
            _id: currentUser._id,
            username: currentUser.username,
            email: currentUser.email,
            role: currentUser.role
          };
          setUser(user);
          localStorage.setItem("user", JSON.stringify(user));
        } else {
          await authService.refreshToken();
          const refreshedUser = authService.getCurrentUser();
          setUser(refreshedUser);
          localStorage.setItem("user", JSON.stringify(refreshedUser));
        }
        setLoading(false);
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
    const user = {
      _id: data.user._id,
      username: data.user.username,
      email: data.user.email,
      role: data.user.role
    };
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user)); 
    navigate('/dashboard/home');
  };
  

  const register = async (username, email, password) => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.register(username, email, password);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      console.error('Registration failed:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem("user"); 
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
        error,
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