const ACCESS_TOKEN_KEY = 's2s_access_token';
const REFRESH_TOKEN_KEY = 's2s_refresh_token';
const USER_KEY = 's2s_admin_user';

class AuthModel {
  // Save tokens and user data upon successful login
  saveAuth(data) {
    if (!data) return;
    
    const { access_token, refresh_token, user } = data;
    
    if (access_token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
    }
    if (refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
    }
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    
    // Notify application of state change
    window.dispatchEvent(new Event('s2s_auth_change'));
  }

  // Clear all session details (logout)
  clearAuth() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // Notify application of state change
    window.dispatchEvent(new Event('s2s_auth_change'));
  }

  // Check if an access token exists
  isAuthenticated() {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  // Retrieve current access token
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  // Retrieve current refresh token
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  // Retrieve details of the current admin user
  getUser() {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }

  // Parse initials from admin user name or email as fallback
  getInitials() {
    const user = this.getUser();
    if (!user) return 'AD';
    if (user.name) {
      const parts = user.name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return user.name.slice(0, 2).toUpperCase();
    }
    // Fallback using email
    if (user.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'AD';
  }

  // Format the user role into a readable text representation
  getReadableRole() {
    const user = this.getUser();
    if (!user) return 'Administrator';
    
    switch (user.role) {
      case 1:
        return 'System Administrator';
      case 2:
        return 'Manager';
      case 3:
        return 'Moderator';
      default:
        return 'Administrator';
    }
  }
}

const authModel = new AuthModel();
export default authModel;
