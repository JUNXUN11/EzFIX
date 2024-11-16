const API_URL = 'https://theezfixapi.onrender.com/api/v1';

export const authService = {
  async login(username, password) {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      const data = await response.json();
      if (data.accessToken && data.refreshToken) {
        sessionStorage.setItem('accessToken', data.accessToken);
        sessionStorage.setItem('refreshToken', data.refreshToken);
        
        const user = {
          id: data.user.id || data.user._id, 
          username: data.user.username,
          email: data.user.email,
          role: data.user.role,
        };
        sessionStorage.setItem('user', JSON.stringify(user));
      }
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  async register(username, email, password) {
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }
      const data = await response.json();
      if (data.accessToken && data.refreshToken) {
        sessionStorage.setItem('accessToken', data.accessToken);
        sessionStorage.setItem('refreshToken', data.refreshToken);
        sessionStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  logout() {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
  },

  getCurrentUser() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    return user ? { ...user, id: user.id || user._id } : null;
  },  

  getAuthHeader() {
    const accessToken = sessionStorage.getItem('accessToken');
    return accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {};
  },

  async refreshToken() {
    const refreshToken = sessionStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');

    try {
      const response = await fetch(`${API_URL}/users/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to refresh access token');
      }

      const data = await response.json();
      const newAccessToken = data.accessToken;
      
      sessionStorage.setItem('accessToken', newAccessToken);
      
      return newAccessToken;
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      this.logout(); 
      throw error;
    }
  }
};
