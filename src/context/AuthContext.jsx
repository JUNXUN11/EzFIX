import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { ClipLoader } from "react-spinners";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const initAuth = async () => {
    try {
      const storedUser = JSON.parse(sessionStorage.getItem("user"));
      const accessToken = sessionStorage.getItem("accessToken");
  
      if (storedUser && accessToken) {
        setUser({
          ...storedUser,
          id: storedUser.id || storedUser._id, 
        });
      } else {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          const user = {
            id: currentUser.id || currentUser._id,
            username: currentUser.username,
            email: currentUser.email,
            role: currentUser.role,
          };
          setUser(user);
          sessionStorage.setItem("user", JSON.stringify(user));
        } else {
          await authService.refreshToken();
          const refreshedUser = await authService.getCurrentUser();
          const user = {
            id: refreshedUser.user.id || refreshedUser.user._id,
            username: refreshedUser.user.username,
            email: refreshedUser.user.email,
            role: refreshedUser.user.role,
          };
          setUser(user);
          sessionStorage.setItem("user", JSON.stringify(user));
        }
      }
    } catch (error) {
      navigate("/auth/sign-in");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    initAuth();
  }, []);
  

  const login = async (username, password) => {
    try {
      setLoading(true);
      const data = await authService.login(username, password);
      const user = {
        id: data.user.id || data.user._id,
        username: data.user.username,
        email: data.user.email,
        role: data.user.role,
      };
      setUser(user);
      sessionStorage.setItem("user", JSON.stringify(user));
      if (user.role === 'admin') {
        navigate("/dashboard/home");  
      } else if (user.role === 'user') {
        navigate("/dashboard/User-home");  
      }
    } catch (error) {
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.register(username, email, password);
      return { success: true, data };
    } catch (err) {
      setError(err.message || "Registration failed");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    navigate("/auth/sign-in");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        setUser,
        isAuthenticated: !!user,
        loading,
        error,
      }}
    >
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
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
