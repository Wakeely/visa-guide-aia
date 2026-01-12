/**
 * Visa Guide AIA - Storage Manager
 * Handles all localStorage operations for user data and applications
 */

const Storage = {
    // Storage keys
    USERS_KEY: 'visa_users',
    CURRENT_USER_KEY: 'visa_current_user',
    APPLICATIONS_KEY: 'visa_applications',
    
    /**
     * Get data from localStorage
     * @param {string} key - The storage key
     * @returns {any|null} - Parsed data or null if not found
     */
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },
    
    /**
     * Save data to localStorage
     * @param {string} key - The storage key
     * @param {any} value - The data to save
     * @returns {boolean} - Success status
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },
    
    /**
     * Remove data from localStorage
     * @param {string} key - The storage key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    },
    
    /**
     * Clear all application data
     */
    clearAll() {
        try {
            localStorage.removeItem(this.USERS_KEY);
            localStorage.removeItem(this.CURRENT_USER_KEY);
            localStorage.removeItem(this.APPLICATIONS_KEY);
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    },
    
    // ===== User Management =====
    
    /**
     * Get the currently logged in user
     * @returns {object|null} - Current user object or null
     */
    getCurrentUser() {
        return this.get(this.CURRENT_USER_KEY);
    },
    
    /**
     * Set the current logged in user
     * @param {object} user - User object to set
     */
    setCurrentUser(user) {
        this.set(this.CURRENT_USER_KEY, user);
    },
    
    /**
     * Clear the current user session
     */
    clearCurrentUser() {
        this.remove(this.CURRENT_USER_KEY);
    },
    
    /**
     * Get all registered users
     * @returns {Array} - Array of user objects
     */
    getUsers() {
        return this.get(this.USERS_KEY) || [];
    },
    
    /**
     * Save users array to storage
     * @param {Array} users - Array of user objects
     */
    saveUsers(users) {
        this.set(this.USERS_KEY, users);
    },
    
    /**
     * Find a user by email
     * @param {string} email - User email
     * @returns {object|null} - User object or null
     */
    findUserByEmail(email) {
        const users = this.getUsers();
        return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
    },
    
    /**
     * Find a user by ID
     * @param {string} userId - User ID
     * @returns {object|null} - User object or null
     */
    findUserById(userId) {
        const users = this.getUsers();
        return users.find(user => user.id === userId) || null;
    },
    
    /**
     * Register a new user
     * @param {object} userData - User registration data
     * @returns {object} - Result object with success status and message/user
     */
    registerUser(userData) {
        // Validate required fields
        if (!userData.email || !userData.password || !userData.name) {
            return { success: false, message: 'Please fill in all required fields' };
        }
        
        // Check if email already exists
        const existingUser = this.findUserByEmail(userData.email);
        if (existingUser) {
            return { success: false, message: 'This email is already registered' };
        }
        
        // Create new user object
        const newUser = {
            id: this.generateId('usr_'),
            name: userData.name.trim(),
            email: userData.email.trim().toLowerCase(),
            password: userData.password, // Note: In production, use proper password hashing
            createdAt: new Date().toISOString(),
            profile: {
                fullName: userData.name.trim(),
                email: userData.email.trim().toLowerCase(),
                phone: userData.phone || '',
                nationality: userData.nationality || '',
                currentLocation: userData.currentLocation || ''
            },
            applications: []
        };
        
        // Save user
        const users = this.getUsers();
        users.push(newUser);
        this.saveUsers(users);
        
        // Set as current user
        this.setCurrentUser(newUser);
        
        return { success: true, user: newUser };
    },
    
    /**
     * Authenticate user login
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {object} - Result object with success status and message/user
     */
    loginUser(email, password) {
        if (!email || !password) {
            return { success: false, message: 'Please enter both email and password' };
        }
        
        const user = this.findUserByEmail(email);
        
        if (!user) {
            return { success: false, message: 'No account found with this email address' };
        }
        
        if (user.password !== password) {
            return { success: false, message: 'Incorrect password. Please try again.' };
        }
        
        // Set current user (exclude password from session)
        const sessionUser = { ...user };
        delete sessionUser.password;
        this.setCurrentUser(sessionUser);
        
        return { success: true, user: sessionUser };
    },
    
    /**
     * Logout current user
     * @returns {object} - Success result
     */
    logoutUser() {
        this.clearCurrentUser();
        return { success: true, message: 'Logged out successfully' };
    },
    
    /**
     * Update user profile
     * @param {string} userId - User ID
     * @param {object} profileData - Profile data to update
     * @returns {object} - Result object
     */
    updateUserProfile(userId, profileData) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return { success: false, message: 'User not found' };
        }
        
        // Update user profile
        users[userIndex].profile = {
            ...users[userIndex].profile,
            ...profileData,
            email: users[userIndex].email // Prevent email changes
        };
        
        // Update name if provided
        if (profileData.fullName) {
            users[userIndex].name = profileData.fullName;
        }
        
        this.saveUsers(users);
        
        // Update current user session
        const sessionUser = { ...users[userIndex] };
        delete sessionUser.password;
        this.setCurrentUser(sessionUser);
        
        return { success: true, user: sessionUser };
    },
    
    /**
     * Update user password
     * @param {string} userId - User ID
     * @param {string} newPassword - New password
     * @returns {object} - Result object
     */
    updateUserPassword(userId, newPassword) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return { success: false, message: 'User not found' };
        }
        
        users[userIndex].password = newPassword;
        this.saveUsers(users);
        
        return { success: true, message: 'Password updated successfully' };
    },
    
    // ===== Application Management =====
    
    /**
     * Get all applications
     * @returns {Array} - Array of application objects
     */
    getApplications() {
        return this.get(this.APPLICATIONS_KEY) || [];
    },
    
    /**
     * Get applications for a specific user
     * @param {string} userId - User ID
     * @returns {Array} - Array of application objects
     */
    getUserApplications(userId) {
        const applications = this.getApplications();
        return applications.filter(app => app.userId === userId);
    },
    
    /**
     * Get a specific application by ID
     * @param {string} applicationId - Application ID
     * @returns {object|null} - Application object or null
     */
    getApplicationById(applicationId) {
        const applications = this.getApplications();
        return applications.find(app => app.id === applicationId) || null;
    },
    
    /**
     * Add a new application
     * @param {string} userId - User ID
     * @param {object} applicationData - Application form data
     * @returns {object} - Result object with success status and application
     */
    addApplication(userId, applicationData) {
        // Validate user exists
        const user = this.findUserById(userId);
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        
        // Create new application
        const newApplication = {
            id: this.generateId('app_'),
            userId: userId,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...applicationData
        };
        
        // Save to applications
        const applications = this.getApplications();
        applications.push(newApplication);
        this.set(this.APPLICATIONS_KEY, applications);
        
        // Add to user's applications list
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            users[userIndex].applications = users[userIndex].applications || [];
            users[userIndex].applications.push({
                id: newApplication.id,
                destination: newApplication.destination,
                visaType: newApplication.visaType,
                status: newApplication.status,
                createdAt: newApplication.createdAt
            });
            this.saveUsers(users);
            
            // Update current user session
            const sessionUser = { ...users[userIndex] };
            delete sessionUser.password;
            this.setCurrentUser(sessionUser);
        }
        
        return { success: true, application: newApplication };
    },
    
    /**
     * Update an existing application
     * @param {string} userId - User ID
     * @param {string} applicationId - Application ID
     * @param {object} applicationData - Updated application data
     * @returns {object} - Result object
     */
    updateApplication(userId, applicationId, applicationData) {
        const applications = this.getApplications();
        const appIndex = applications.findIndex(app => app.id === applicationId && app.userId === userId);
        
        if (appIndex === -1) {
            return { success: false, message: 'Application not found' };
        }
        
        // Update application
        applications[appIndex] = {
            ...applications[appIndex],
            ...applicationData,
            updatedAt: new Date().toISOString()
        };
        
        this.set(this.APPLICATIONS_KEY, applications);
        
        return { success: true, application: applications[appIndex] };
    },
    
    /**
     * Delete an application
     * @param {string} userId - User ID
     * @param {string} applicationId - Application ID
     * @returns {object} - Result object
     */
    deleteApplication(userId, applicationId) {
        let applications = this.getApplications();
        const originalLength = applications.length;
        
        // Filter out the application
        applications = applications.filter(app => !(app.id === applicationId && app.userId === userId));
        
        if (applications.length === originalLength) {
            return { success: false, message: 'Application not found' };
        }
        
        this.set(this.APPLICATIONS_KEY, applications);
        
        // Update user's applications list
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            users[userIndex].applications = users[userIndex].applications.filter(
                app => app.id !== applicationId
            );
            this.saveUsers(users);
            
            // Update current user session
            const sessionUser = { ...users[userIndex] };
            delete sessionUser.password;
            this.setCurrentUser(sessionUser);
        }
        
        return { success: true, message: 'Application deleted successfully' };
    },
    
    /**
     * Update application status (admin function)
     * @param {string} applicationId - Application ID
     * @param {string} status - New status
     * @param {string} adminNotes - Optional admin notes
     * @returns {object} - Result object
     */
    updateApplicationStatus(applicationId, status, adminNotes = '') {
        const applications = this.getApplications();
        const appIndex = applications.findIndex(app => app.id === applicationId);
        
        if (appIndex === -1) {
            return { success: false, message: 'Application not found' };
        }
        
        applications[appIndex].status = status;
        applications[appIndex].adminNotes = adminNotes;
        applications[appIndex].updatedAt = new Date().toISOString();
        
        if (status === 'approved') {
            applications[appIndex].approvedAt = new Date().toISOString();
        }
        
        this.set(this.APPLICATIONS_KEY, applications);
        
        return { success: true, application: applications[appIndex] };
    },
    
    // ===== Statistics =====
    
    /**
     * Get application statistics for a user
     * @param {string} userId - User ID
     * @returns {object} - Statistics object
     */
    getUserApplicationStats(userId) {
        const applications = this.getUserApplications(userId);
        
        return {
            total: applications.length,
            pending: applications.filter(a => a.status === 'pending').length,
            approved: applications.filter(a => a.status === 'approved').length,
            rejected: applications.filter(a => a.status === 'rejected').length,
            draft: applications.filter(a => a.status === 'draft').length
        };
    },
    
    // ===== Utility Functions =====
    
    /**
     * Generate a unique ID
     * @param {string} prefix - ID prefix
     * @returns {string} - Unique ID
     */
    generateId(prefix = 'id_') {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 8);
        return `${prefix}${timestamp}${randomStr}`;
    },
    
    /**
     * Export user data (for backup/portability)
     * @param {string} userId - User ID
     * @returns {object|null} - Export data object
     */
    exportUserData(userId) {
        const user = this.findUserById(userId);
        const applications = this.getUserApplications(userId);
        
        if (!user) {
            return null;
        }
        
        return {
            exportDate: new Date().toISOString(),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                profile: user.profile
            },
            applications: applications
        };
    },
    
    /**
     * Import user data (for restoration)
     * @param {object} data - Import data object
     * @returns {object} - Result object
     */
    importUserData(data) {
        if (!data.user || !data.user.email) {
            return { success: false, message: 'Invalid data format' };
        }
        
        // Check if user already exists
        const existingUser = this.findUserByEmail(data.user.email);
        if (existingUser) {
            return { success: false, message: 'User already exists. Please login to import data.' };
        }
        
        // Save user
        const users = this.getUsers();
        users.push(data.user);
        this.saveUsers(users);
        
        // Save applications
        if (data.applications && Array.isArray(data.applications)) {
            const applications = this.getApplications();
            applications.push(...data.applications);
            this.set(this.APPLICATIONS_KEY, applications);
        }
        
        return { success: true, message: 'Data imported successfully' };
    }
};

// Make Storage available globally
window.Storage = Storage;
