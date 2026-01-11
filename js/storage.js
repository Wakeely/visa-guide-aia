/**
 * Visa Guide AI - Local Storage Module
 * Handles all data persistence using browser localStorage
 */

const Storage = {
    // Keys
    KEY_USERS: 'visa_guide_users',
    KEY_CURRENT_USER: 'visa_guide_current_user',
    KEY_USER_DATA: 'visa_guide_user_data_',
    KEY_DOCUMENTS: 'visa_guide_documents_',
    KEY_FORMS: 'visa_guide_forms_',
    KEY_CHAT_HISTORY: 'visa_guide_chat_history_',
    KEY_CIVICS_PROGRESS: 'visa_guide_civics_progress_',
    KEY_SETTINGS: 'visa_guide_settings',

    // ============ User Management ============
    
    /**
     * Get all registered users
     */
    getUsers() {
        const users = localStorage.getItem(this.KEY_USERS);
        return users ? JSON.parse(users) : [];
    },

    /**
     * Save users array
     */
    saveUsers(users) {
        localStorage.setItem(this.KEY_USERS, JSON.stringify(users));
    },

    /**
     * Find user by email
     */
    findUserByEmail(email) {
        const users = this.getUsers();
        return users.find(u => u.email.toLowerCase() === email.toLowerCase());
    },

    /**
     * Register new user
     */
    registerUser(email, password, fullName) {
        // Check if user exists
        if (this.findUserByEmail(email)) {
            return { success: false, message: 'An account with this email already exists' };
        }

        // Create new user
        const newUser = {
            id: this.generateId(),
            email: email.toLowerCase().trim(),
            password: this.hashPassword(password), // Store hashed password
            fullName: fullName.trim(),
            createdAt: new Date().toISOString()
        };

        // Save user
        const users = this.getUsers();
        users.push(newUser);
        this.saveUsers(users);

        // Initialize user data
        this.initializeUserData(newUser.id);

        return { success: true, user: { id: newUser.id, email: newUser.email, fullName: newUser.fullName } };
    },

    /**
     * Login user
     */
    loginUser(email, password) {
        const user = this.findUserByEmail(email);
        
        if (!user) {
            return { success: false, message: 'No account found with this email' };
        }

        // Verify password
        if (!this.verifyPassword(password, user.password)) {
            return { success: false, message: 'Incorrect password' };
        }

        // Set current user
        this.setCurrentUser({ id: user.id, email: user.email, fullName: user.fullName });

        return { success: true, user: { id: user.id, email: user.email, fullName: user.fullName } };
    },

    /**
     * Logout user
     */
    logoutUser() {
        localStorage.removeItem(this.KEY_CURRENT_USER);
    },

    /**
     * Get current logged in user
     */
    getCurrentUser() {
        const user = localStorage.getItem(this.KEY_CURRENT_USER);
        return user ? JSON.parse(user) : null;
    },

    /**
     * Set current user
     */
    setCurrentUser(user) {
        localStorage.setItem(this.KEY_CURRENT_USER, JSON.stringify(user));
    },

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    },

    // ============ User Data ============

    /**
     * Initialize empty data for new user
     */
    initializeUserData(userId) {
        localStorage.setItem(this.KEY_USER_DATA + userId, JSON.stringify({
            profile: {},
            settings: {
                theme: 'light',
                language: 'en',
                notifications: true,
                speechEnabled: true
            },
            progress: {
                overallPercentage: 0,
                currentStep: 0,
                completedSteps: []
            },
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        }));

        localStorage.setItem(this.KEY_DOCUMENTS + userId, JSON.stringify([]));
        localStorage.setItem(this.KEY_FORMS + userId, JSON.stringify({}));
        localStorage.setItem(this.KEY_CHAT_HISTORY + userId, JSON.stringify([]));
        localStorage.setItem(this.KEY_CIVICS_PROGRESS + userId, JSON.stringify({
            questionsAnswered: 0,
            correctAnswers: 0,
            missedQuestions: [],
            completedFlashcards: [],
            practiceSessions: 0
        }));
    },

    /**
     * Get user data
     */
    getUserData(userId) {
        const data = localStorage.getItem(this.KEY_USER_DATA + userId);
        return data ? JSON.parse(data) : null;
    },

    /**
     * Update user data
     */
    updateUserData(userId, updates) {
        const currentData = this.getUserData(userId) || {};
        const updatedData = {
            ...currentData,
            ...updates,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(this.KEY_USER_DATA + userId, JSON.stringify(updatedData));
        return updatedData;
    },

    // ============ Documents ============

    /**
     * Get user documents
     */
    getDocuments(userId) {
        const documents = localStorage.getItem(this.KEY_DOCUMENTS + userId);
        return documents ? JSON.parse(documents) : [];
    },

    /**
     * Add document
     */
    addDocument(userId, document) {
        const documents = this.getDocuments(userId);
        const newDocument = {
            id: this.generateId(),
            name: document.name,
            type: document.type,
            size: document.size,
            uploadDate: new Date().toISOString(),
            category: document.category || 'other'
        };
        documents.push(newDocument);
        localStorage.setItem(this.KEY_DOCUMENTS + userId, JSON.stringify(documents));
        return newDocument;
    },

    /**
     * Delete document
     */
    deleteDocument(userId, documentId) {
        let documents = this.getDocuments(userId);
        documents = documents.filter(d => d.id !== documentId);
        localStorage.setItem(this.KEY_DOCUMENTS + userId, JSON.stringify(documents));
    },

    // ============ Forms ============

    /**
     * Get form data
     */
    getFormData(userId, formType) {
        const forms = localStorage.getItem(this.KEY_FORMS + userId);
        const allForms = forms ? JSON.parse(forms) : {};
        return allForms[formType] || null;
    },

    /**
     * Save form data
     */
    saveFormData(userId, formType, data) {
        const forms = localStorage.getItem(this.KEY_FORMS + userId);
        const allForms = forms ? JSON.parse(forms) : {};
        
        allForms[formType] = {
            data: data,
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem(this.KEY_FORMS + userId, JSON.stringify(allForms));
    },

    /**
     * Get all form data
     */
    getAllForms(userId) {
        const forms = localStorage.getItem(this.KEY_FORMS + userId);
        return forms ? JSON.parse(forms) : {};
    },

    // ============ Chat ============

    /**
     * Get chat history
     */
    getChatHistory(userId) {
        const history = localStorage.getItem(this.KEY_CHAT_HISTORY + userId);
        return history ? JSON.parse(history) : [];
    },

    /**
     * Add chat message
     */
    addChatMessage(userId, message) {
        const history = this.getChatHistory(userId);
        history.push({
            role: message.role,
            content: message.content,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 100 messages
        if (history.length > 100) {
            history.splice(0, history.length - 100);
        }
        
        localStorage.setItem(this.KEY_CHAT_HISTORY + userId, JSON.stringify(history));
    },

    /**
     * Clear chat history
     */
    clearChatHistory(userId) {
        localStorage.setItem(this.KEY_CHAT_HISTORY + userId, JSON.stringify([]));
    },

    // ============ Civics Progress ============

    /**
     * Get civics progress
     */
    getCivicsProgress(userId) {
        const progress = localStorage.getItem(this.KEY_CIVICS_PROGRESS + userId);
        return progress ? JSON.parse(progress) : {
            questionsAnswered: 0,
            correctAnswers: 0,
            missedQuestions: [],
            completedFlashcards: [],
            practiceSessions: 0
        };
    },

    /**
     * Update civics progress
     */
    updateCivicsProgress(userId, updates) {
        const progress = this.getCivicsProgress(userId);
        const updatedProgress = { ...progress, ...updates };
        localStorage.setItem(this.KEY_CIVICS_PROGRESS + userId, JSON.stringify(updatedProgress));
        return updatedProgress;
    },

    // ============ Settings ============

    /**
     * Get global settings
     */
    getSettings() {
        const settings = localStorage.getItem(this.KEY_SETTINGS);
        return settings ? JSON.parse(settings) : {
            theme: 'light',
            language: 'en'
        };
    },

    /**
     * Update global settings
     */
    updateSettings(updates) {
        const current = this.getSettings();
        const updated = { ...current, ...updates };
        localStorage.setItem(this.KEY_SETTINGS, JSON.stringify(updated));
    },

    // ============ Utilities ============

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Hash password (simple hash for demo - use bcrypt in production)
     */
    hashPassword(password) {
        // Simple hash for demo purposes
        // In production, use proper password hashing like bcrypt
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'hash_' + Math.abs(hash).toString(16);
    },

    /**
     * Verify password
     */
    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    },

    /**
     * Clear all data (for logout)
     */
    clearAllData() {
        const user = this.getCurrentUser();
        if (user) {
            // Keep user registered but clear current session
            localStorage.removeItem(this.KEY_CURRENT_USER);
        } else {
            // Clear everything
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('visa_guide_')) {
                    localStorage.removeItem(key);
                }
            });
        }
    },

    /**
     * Export user data
     */
    exportUserData(userId) {
        return {
            user: this.findUserById(userId),
            userData: this.getUserData(userId),
            documents: this.getDocuments(userId),
            forms: this.getAllForms(userId),
            civicsProgress: this.getCivicsProgress(userId),
            chatHistory: this.getChatHistory(userId).slice(-50)
        };
    },

    /**
     * Find user by ID
     */
    findUserById(userId) {
        const users = this.getUsers();
        return users.find(u => u.id === userId);
    }
};

// Make Storage available globally
window.Storage = Storage;

