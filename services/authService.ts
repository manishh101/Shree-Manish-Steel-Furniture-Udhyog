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
  private isApiConnected = false;
  private offlineModeActive = false;
  private ADMIN_CREDENTIALS = {
    email: '9814379071',
    password: 'M@nishsteel'
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeTokenValidation();
    }
  }

  /**
   * Check API health with timeout
   */
  async checkApiHealth(timeout = 2000): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${API_BASE_URL}/health`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      this.isApiConnected = response.ok;
    } catch {
      this.isApiConnected = false;
      
      // Always set offline mode active for admin
      const user = this.getUser();
      if (user && user.id === 'admin-local' && user.email === this.ADMIN_CREDENTIALS.email) {
        this.offlineModeActive = true;
      }
    }
  }

  /**
   * Create admin user object for offline mode
   */
  private createAdminUser(): User {
    return {
      id: "admin-local",
      name: "Admin User",
      email: this.ADMIN_CREDENTIALS.email,
      role: "admin",
      isAdmin: true
    };
  }

  /**
   * Create a valid JWT-like token for offline mode
   */
  private createOfflineToken(): string {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiYWRtaW4tbG9jYWwifSwiaXNzIjoibWFuaXNoLXN0ZWVsLWFwaSIsImF1ZCI6Im1hbmlzaC1zdGVlbC1mcm9udGVuZCIsImlhdCI6MTYyMDMxMjM0NSwiZXhwIjoxNjIwMzk4NzQ1fQ.mocked-signature-for-local-development-only';
  }

  /**
   * Handle admin offline login
   */
  private handleOfflineAdminLogin(): AuthResponse {
    try {
      const mockAdminUser = this.createAdminUser();
      const mockToken = this.createOfflineToken();

      this.setToken(mockToken);
      this.setUser(mockAdminUser);
      this.offlineModeActive = true;

      return {
        success: true,
        user: mockAdminUser,
        message: "Login successful (offline mode)"
      };
    } catch {
      return {
        success: false,
        message: "Failed to log in offline mode"
      };
    }
  }

  /**
   * Check if credentials are admin credentials
   */
  isAdminCredentials(email: string, password: string): boolean {
    return email === this.ADMIN_CREDENTIALS.email && password === this.ADMIN_CREDENTIALS.password;
  }

  /**
   * Check if API is connected
   */
  isApiAvailable(): boolean {
    return this.isApiConnected;
  }

  /**
   * Check if offline mode is active
   */
  isOfflineMode(): boolean {
    return this.offlineModeActive;
  }

  /**
   * Check if the user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;

    const token = this.getToken();
    const user = this.getUser();

    if (!token || !user) {
      return false;
    }

    // For local admin token with admin user, always return true
    if (user.id === 'admin-local' && user.email === this.ADMIN_CREDENTIALS.email) {
      return true;
    }

    return true;
  }

  /**
   * Login user with email/phone and password
   */
  async login(emailOrPhone: string, password: string): Promise<AuthResponse> {
    if (!emailOrPhone || !password) {
      throw new Error("Email/phone and password are required");
    }

    const sanitizedEmail = emailOrPhone.toString().trim();

    // Check for admin credentials first
    if (this.isAdminCredentials(sanitizedEmail, password)) {
      return this.handleOfflineAdminLogin();
    }

    // Check API health first
    await this.checkApiHealth();

    // Try API login if connected
    if (this.isApiConnected) {
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

        throw new Error(data.message || 'Login failed');
      } catch (error) {
        // If API login fails but it's admin credentials, fall back to offline mode
        if (this.isAdminCredentials(sanitizedEmail, password)) {
          return this.handleOfflineAdminLogin();
        }
        throw error;
      }
    }

    // If not connected and not admin, throw error
    if (!this.isAdminCredentials(sanitizedEmail, password)) {
      throw new Error('Server is not available. Please try again later.');
    }

    // Fallback to offline admin login
    return this.handleOfflineAdminLogin();
  }

  /**
   * Get current user from API
   */
  async getCurrentUser(): Promise<{ data: User } | null> {
    const token = this.getToken();
    if (!token) return null;

    // If in offline mode, return stored user
    if (this.offlineModeActive) {
      const user = this.getUser();
      return user ? { data: user } : null;
    }

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

    const token = localStorage.getItem(this.TOKEN_KEY);

    // If not found and we're in admin mode, return offline admin token
    if (!token && this.isAdmin()) {
      const offlineToken = this.createOfflineToken();
      localStorage.setItem(this.TOKEN_KEY, offlineToken);
      return offlineToken;
    }

    return token;
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
    this.offlineModeActive = false;
  }

  // Token validation methods
  private initializeTokenValidation(): void {
    const token = this.getToken();
    if (token) {
      this.startTokenValidation();
    }

    // Check if we're in offline mode with an admin user
    const user = this.getUser();
    if (user && user.id === 'admin-local') {
      this.offlineModeActive = true;
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

    // Skip validation when in offline mode
    if (this.offlineModeActive) {
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
