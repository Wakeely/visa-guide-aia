/**
 * Visa Guide AIA - Authentication Handler
 * Manages all authentication UI interactions and events
 */

// ===== DOM Elements =====
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const logoutBtn = document.getElementById('logout-btn');
const userNameElement = document.getElementById('user-name');

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    initializeEventListeners();
});

/**
 * Initialize authentication state
 */
function initializeAuth() {
    const currentUser = Storage.getCurrentUser();
    
    if (currentUser) {
        // User is logged in, show app section
        showApp(currentUser);
    } else {
        // User is not logged in, show auth section
        showAuth();
    }
}

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Tab switching
    if (loginTab && registerTab) {
        loginTab.addEventListener('click', () => switchAuthTab('login'));
        registerTab.addEventListener('click', () => switchAuthTab('register'));
    }
    
    // Switch form links
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            switchAuthTab('register');
        });
    }
    
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            switchAuthTab('login');
        });
    }
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// ===== Authentication Functions =====

/**
 * Switch between login and register tabs
 * @param {string} tab - Tab name ('login' or 'register')
 */
function switchAuthTab(tab) {
    const loginFormEl = document.getElementById('login-form');
    const registerFormEl = document.getElementById('register-form');
    const loginTabEl = document.getElementById('login-tab');
    const registerTabEl = document.getElementById('register-tab');
    
    if (tab === 'login') {
        loginFormEl.classList.add('active');
        registerFormEl.classList.remove('active');
        loginTabEl.classList.add('active');
        registerTabEl.classList.remove('active');
    } else {
        loginFormEl.classList.remove('active');
        registerFormEl.classList.add('active');
        loginTabEl.classList.remove('active');
        registerTabEl.classList.add('active');
    }
}

/**
 * Show authentication section (login/register forms)
 */
function showAuth() {
    if (authSection) {
        authSection.style.display = 'block';
    }
    if (appSection) {
        appSection.style.display = 'none';
    }
}

/**
 * Show main application section
 * @param {object} user - Current user object
 */
function showApp(user) {
    if (authSection) {
        authSection.style.display = 'none';
    }
    if (appSection) {
        appSection.style.display = 'block';
    }
    
    // Update user name display
    if (userNameElement) {
        const displayName = user.name || user.profile?.fullName || user.email;
        userNameElement.textContent = 'Welcome, ' + displayName;
    }
}

// ===== Form Handlers =====

/**
 * Handle login form submission
 * @param {Event} event - Form submit event
 */
function handleLogin(event) {
    event.preventDefault();
    
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    
    if (!emailInput || !passwordInput) {
        showNotification('Form elements not found', 'error');
        return;
    }
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Basic validation
    if (!email || !password) {
        showNotification('Please enter both email and password', 'error');
        return;
    }
    
    // Attempt login
    const result = Storage.loginUser(email, password);
    
    if (result.success) {
        showNotification('Login successful! Welcome back.', 'success');
        
        // Clear form
        emailInput.value = '';
        passwordInput.value = '';
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } else {
        showNotification(result.message, 'error');
        
        // Shake animation for error feedback
        if (passwordInput) {
            passwordInput.classList.add('error-shake');
            setTimeout(() => {
                passwordInput.classList.remove('error-shake');
            }, 500);
        }
    }
}

/**
 * Handle register form submission
 * @param {Event} event - Form submit event
 */
function handleRegister(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('register-name');
    const emailInput = document.getElementById('register-email');
    const passwordInput = document.getElementById('register-password');
    const confirmPasswordInput = document.getElementById('register-confirm-password');
    
    if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
        showNotification('Form elements not found', 'error');
        return;
    }
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (name.length < 2) {
        showNotification('Please enter a valid name', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        
        // Shake both password fields
        passwordInput.classList.add('error-shake');
        confirmPasswordInput.classList.add('error-shake');
        setTimeout(() => {
            passwordInput.classList.remove('error-shake');
            confirmPasswordInput.classList.remove('error-shake');
        }, 500);
        
        // Clear both fields
        passwordInput.value = '';
        confirmPasswordInput.value = '';
        return;
    }
    
    // Attempt registration
    const result = Storage.registerUser({ name, email, password });
    
    if (result.success) {
        showNotification('Account created successfully! Welcome to Visa Guide AIA.', 'success');
        
        // Clear form
        nameInput.value = '';
        emailInput.value = '';
        passwordInput.value = '';
        confirmPasswordInput.value = '';
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } else {
        showNotification(result.message, 'error');
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    const result = Storage.logoutUser();
    
    if (result.success) {
        showNotification('You have been logged out successfully', 'success');
        
        // Redirect to login page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// ===== Utility Functions =====

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show notification to user
 * @param {string} message - Notification message
 * @param {string} type - Notification type ('success', 'error', 'info', 'warning')
 * @param {number} duration - Display duration in milliseconds
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Add icon based on type
    const icon = getNotificationIcon(type);
    notification.innerHTML = `
        ${icon}
        <span>${escapeHtml(message)}</span>
    `;
    
    // Add to container
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.body;
    }
    container.appendChild(notification);
    
    // Remove after duration
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}

/**
 * Get notification icon SVG
 * @param {string} type - Notification type
 * @returns {string} - SVG icon HTML
 */
function getNotificationIcon(type) {
    const icons = {
        success: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
        warning: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
    };
    
    return icons[type] || icons.info;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== Dashboard Functions =====

/**
 * Load user applications on dashboard
 */
function loadUserApplications() {
    const currentUser = Storage.getCurrentUser();
    if (!currentUser) return;
    
    const applicationsList = document.getElementById('applications-list');
    if (!applicationsList) return;
    
    const applications = currentUser.applications || [];
    
    // Update stats
    const stats = Storage.getUserApplicationStats(currentUser.id);
    updateDashboardStats(stats);
    
    if (applications.length === 0) {
        applicationsList.innerHTML = getEmptyStateHtml();
        return;
    }
    
    // Sort by date (newest first)
    applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Render applications
    applicationsList.innerHTML = getApplicationsTableHtml(applications);
}

/**
 * Update dashboard statistics
 * @param {object} stats - Statistics object
 */
function updateDashboardStats(stats) {
    const totalEl = document.getElementById('total-applications');
    const pendingEl = document.getElementById('pending-applications');
    const approvedEl = document.getElementById('approved-applications');
    const rejectedEl = document.getElementById('rejected-applications');
    
    if (totalEl) totalEl.textContent = stats.total;
    if (pendingEl) pendingEl.textContent = stats.pending;
    if (approvedEl) approvedEl.textContent = stats.approved;
    if (rejectedEl) rejectedEl.textContent = stats.rejected;
}

/**
 * Get empty state HTML
 * @returns {string} - HTML string
 */
function getEmptyStateHtml() {
    return `
        <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <h4>No Applications Yet</h4>
            <p>Start your first visa application today!</p>
            <a href="forms.html" class="btn btn-primary">Create Application</a>
        </div>
    `;
}

/**
 * Get applications table HTML
 * @param {Array} applications - Array of applications
 * @returns {string} - HTML string
 */
function getApplicationsTableHtml(applications) {
    return `
        <div class="applications-table-container">
            <table class="applications-table">
                <thead>
                    <tr>
                        <th>Application ID</th>
                        <th>Destination</th>
                        <th>Visa Type</th>
                        <th>Submission Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${applications.map(app => `
                        <tr>
                            <td><code>${app.id.substring(0, 8)}...</code></td>
                            <td>${escapeHtml(app.destination || 'N/A')}</td>
                            <td>${escapeHtml(app.visaType || 'N/A')}</td>
                            <td>${new Date(app.createdAt).toLocaleDateString()}</td>
                            <td><span class="status-badge ${app.status}">${capitalizeFirst(app.status)}</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-sm btn-outline" onclick="viewApplication('${app.id}')">View</button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteApplication('${app.id}')">Delete</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * View application details
 * @param {string} applicationId - Application ID
 */
function viewApplication(applicationId) {
    const currentUser = Storage.getCurrentUser();
    if (!currentUser) return;
    
    const application = currentUser.applications.find(a => a.id === applicationId);
    
    if (application) {
        const details = `
Visa Application Details
========================

Application ID: ${application.id}
Status: ${capitalizeFirst(application.status)}

Destination: ${application.destination || 'N/A'}
Visa Type: ${application.visaType || 'N/A'}
Purpose of Visit: ${application.purpose || 'N/A'}

Submission Date: ${new Date(application.createdAt).toLocaleString()}

Personal Information:
- Full Name: ${application.fullName || 'N/A'}
- Email: ${application.email || 'N/A'}
- Phone: ${application.phone || 'N/A'}
- Nationality: ${application.nationality || 'N/A'}

Passport Details:
- Passport Number: ${application.passportNumber || 'N/A'}
- Passport Expiry: ${application.passportExpiry || 'N/A'}
- Current Location: ${application.currentLocation || 'N/A'}

Travel Details:
- Departure Date: ${application.departureDate || 'N/A'}
- Return Date: ${application.returnDate || 'N/A'}
        `;
        alert(details);
    }
}

/**
 * Delete application
 * @param {string} applicationId - Application ID
 */
function deleteApplication(applicationId) {
    if (confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
        const currentUser = Storage.getCurrentUser();
        if (currentUser) {
            const result = Storage.deleteApplication(currentUser.id, applicationId);
            if (result.success) {
                showNotification('Application deleted successfully', 'success');
                loadUserApplications();
            } else {
                showNotification(result.message, 'error');
            }
        }
    }
}

/**
 * Capitalize first letter
 * @param {string} string - String to capitalize
 * @returns {string} - Capitalized string
 */
function capitalizeFirst(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// ===== Export Functions =====

// Make functions globally available
window.switchAuthTab = switchAuthTab;
window.showAuth = showAuth;
window.showApp = showApp;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.loadUserApplications = loadUserApplications;
window.viewApplication = viewApplication;
window.deleteApplication = deleteApplication;
window.showNotification = showNotification;
