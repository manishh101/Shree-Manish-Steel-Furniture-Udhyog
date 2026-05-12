/**
 * Secure Authentication Service
 * Handles all authentication operations with enhanced security
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isAdmin?: boolean;
}

interface AuthResponse {
  success: boolean;
  user?: User;
  message: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
}

class AuthService {
  private TOKEN_KEY = 'manish_steel_auth_token';
  private USER_KEY = 'manish_steel_user_data';
  private tokenCheckInterval: NodeJS.Timeout | null = null;


  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeTokenValidation();
    }
  }

  /**
   * Check if the user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;

    const token = this.getToken();
    const user = this.getUser();

    return !!(token && user);
  }

  /**
   * Login user with email/phone and password
   */
  async login(emailOrPhone: string, password: string): Promise<AuthResponse> {
    if (!emailOrPhone || !password) {
      throw new Error("Email/phone and password are required");
    }

    const sanitizedEmail = emailOrPhone.toString().trim();

    // Always require API login - no offline mode fallback
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: sanitizedEmail,
          password: password
        })
      });

      const data = await response.json() as ApiResponse<{ token: string; user: User }>;

      if (response.ok && data.success && data.data.token) {
        this.setToken(data.data.token);
        this.setUser(data.data.user);
        this.startTokenValidation();

        return {
          success: true,
          user: data.data.user,
          message: data.message || 'Login successful'
        };
      }

      return {
        success: false,
        message: data.message || 'Login failed'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      return {
        success: false,
        message: `Login failed: ${errorMessage}`
      };
    }
  }

  /**
   * Get current user from API
   */
  async getCurrentUser(): Promise<{ data: User } | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json() as ApiResponse<User>;
        return { data: data.data };
      }

      return null;
    } catch {
      return null;
    }
  }

  // Token management methods
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) as User : null;
  }

  setUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.stopTokenValidation();
  }

  // Token validation methods
  private initializeTokenValidation(): void {
    const token = this.getToken();
    if (token) {
      this.startTokenValidation();
    }
  }

  /**
   * Check if the current user is an admin
   */
  isAdmin(): boolean {
    const user = this.getUser();
    return user !== null && (user.role === 'admin' || user.isAdmin === true);
  }

  /**
   * Check if the user is authenticated as an admin
   */
  isAuthenticatedAdmin(): boolean {
    return this.isAuthenticated() && this.isAdmin();
  }

  private startTokenValidation(): void {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }
    this.tokenCheckInterval = setInterval(() => this.validateToken(), 60000);
  }

  private stopTokenValidation(): void {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
      this.tokenCheckInterval = null;
    }
  }

  private async validateToken(): Promise<void> {
    const token = this.getToken();
    if (!token) {
      this.stopTokenValidation();
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.code === 'TOKEN_EXPIRED') {
          this.handleTokenExpiration();
        }
      }
    } catch (error) {
      console.error('Token validation failed:', error);
    }
  }

  private handleTokenExpiration(): void {
    this.logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}

// Export API for use in api.ts
export const authAPI = {
  login: async (email: string, password: string) => {
    return authService.login(email, password);
  },
  getCurrentUser: async () => {
    return authService.getCurrentUser();
  },
  logout: () => {
    authService.logout();
  }
};

const authService = new AuthService();
export default authService;
