/**
 * Visa Guide AI - Authentication Module
 * Handles user registration, login, and session management
 */

const Auth = {
    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return Storage.isLoggedIn();
    },

    /**
     * Get current user
     */
    getCurrentUser() {
        return Storage.getCurrentUser();
    },

    /**
     * Register new user
     */
    async register(email, password, confirmPassword, fullName) {
        // Validate input
        if (!email || !password || !confirmPassword || !fullName) {
            return { success: false, message: 'Please fill in all required fields' };
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { success: false, message: 'Please enter a valid email address' };
        }

        // Validate password length
        if (password.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters' };
        }

        // Validate password match
        if (password !== confirmPassword) {
            return { success: false, message: 'Passwords do not match' };
        }

        // Attempt registration
        const result = Storage.registerUser(email, password, fullName);
        
        if (result.success) {
            // Auto login after registration
            return this.login(email, password);
        }
        
        return result;
    },

    /**
     * Login user
     */
    async login(email, password) {
        // Validate input
        if (!email || !password) {
            return { success: false, message: 'Please enter both email and password' };
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { success: false, message: 'Please enter a valid email address' };
        }

        // Attempt login
        const result = Storage.loginUser(email, password);
        
        if (result.success) {
            console.log('Login successful:', result.user.email);
        }
        
        return result;
    },

    /**
     * Logout user
     */
    logout() {
        Storage.logoutUser();
        window.location.href = 'index.html';
    },

    /**
     * Require authentication - redirect to login if not logged in
     */
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'auth.html';
            return false;
        }
        return true;
    },

    /**
     * Redirect to dashboard if already logged in
     */
    redirectIfLoggedIn() {
        if (this.isLoggedIn()) {
            window.location.href = 'dashboard.html';
            return true;
        }
        return false;
    },

    /**
     * Update password
     */
    async changePassword(currentPassword, newPassword, confirmPassword) {
        const user = this.getCurrentUser();
        if (!user) {
            return { success: false, message: 'Not logged in' };
        }

        if (newPassword !== confirmPassword) {
            return { success: false, message: 'New passwords do not match' };
        }

        if (newPassword.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters' };
        }

        // Verify current password
        const userData = Storage.findUserByEmail(user.email);
        if (!Storage.verifyPassword(currentPassword, userData.password)) {
            return { success: false, message: 'Current password is incorrect' };
        }

        // Update password
        const users = Storage.getUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex].password = Storage.hashPassword(newPassword);
            Storage.saveUsers(users);
            return { success: true, message: 'Password updated successfully' };
        }

        return { success: false, message: 'User not found' };
    },

    /**
     * Delete account
     */
    async deleteAccount(password) {
        const user = this.getCurrentUser();
        if (!user) {
            return { success: false, message: 'Not logged in' };
        }

        // Verify password
        const userData = Storage.findUserByEmail(user.email);
        if (!Storage.verifyPassword(password, userData.password)) {
            return { success: false, message: 'Password is incorrect' };
        }

        // Delete user
        const users = Storage.getUsers();
        const filteredUsers = users.filter(u => u.id !== user.id);
        Storage.saveUsers(filteredUsers);

        // Clear all user data
        Storage.clearAllData();

        return { success: true, message: 'Account deleted successfully' };
    }
};

// Make Auth available globally
window.Auth = Auth;

