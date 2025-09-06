// Authentication System
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Admin approval button (if exists)
        const approveAdminBtn = document.getElementById('approveAdminBtn');
        if (approveAdminBtn) {
            approveAdminBtn.addEventListener('click', (e) => this.handleAdminApproval(e));
        }
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Hash password (simple implementation - in production use bcrypt)
    hashPassword(password) {
        return btoa(password); // Base64 encoding for demo
    }

    // Verify password
    verifyPassword(password, hashedPassword) {
        return btoa(password) === hashedPassword;
    }

    // Generate JWT-like token
    generateToken(userId) {
        const payload = {
            userId: userId,
            timestamp: Date.now(),
            exp: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
        };
        return btoa(JSON.stringify(payload));
    }

    // Validate token
    validateToken(token) {
        try {
            const payload = JSON.parse(atob(token));
            return payload.exp > Date.now();
        } catch (error) {
            return false;
        }
    }

    // Handle user registration
    handleRegister(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            userType: formData.get('userType'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword')
        };

        // Validation
        if (!this.validateRegistration(userData)) {
            return;
        }

        // Check if user already exists
        if (this.users.find(user => user.email === userData.email)) {
            this.showNotification('البريد الإلكتروني مسجل مسبقاً', 'error');
            return;
        }

        // Create new user
        const newUser = {
            id: this.generateId(),
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            userType: userData.userType,
            password: this.hashPassword(userData.password),
            createdAt: new Date().toISOString(),
            lastLogin: null,
            profile: {
                avatar: null,
                phone: '',
                address: '',
                bio: ''
            }
        };

        // Add user to storage
        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));

        this.showNotification('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول', 'success');
        
        // Switch to login tab
        if (typeof switchTab === 'function') {
            switchTab('login');
        }
        
        // Clear form
        e.target.reset();
    }

    // Handle user login
    handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const rememberMe = formData.get('rememberMe');

        // Find user
        const user = this.users.find(u => u.email === email);
        
        if (!user || !this.verifyPassword(password, user.password)) {
            this.showNotification('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
            return;
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        localStorage.setItem('users', JSON.stringify(this.users));

        // Create session
        const token = this.generateToken(user.id);
        const sessionData = {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                userType: user.userType,
                profile: user.profile
            },
            token: token,
            rememberMe: rememberMe
        };

        // Store session
        if (rememberMe) {
            localStorage.setItem('userToken', token);
            localStorage.setItem('currentUser', JSON.stringify(sessionData.user));
        } else {
            sessionStorage.setItem('userToken', token);
            sessionStorage.setItem('currentUser', JSON.stringify(sessionData.user));
        }

        this.currentUser = sessionData.user;
        this.showNotification('تم تسجيل الدخول بنجاح!', 'success');

        // Redirect to main page
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
    }

    // Validate registration data
    validateRegistration(userData) {
        if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
            this.showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            return false;
        }

        if (userData.password !== userData.confirmPassword) {
            this.showNotification('كلمات المرور غير متطابقة', 'error');
            return false;
        }

        if (userData.password.length < 6) {
            this.showNotification('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            this.showNotification('يرجى إدخال بريد إلكتروني صحيح', 'error');
            return false;
        }

        return true;
    }

    // Check authentication status
    checkAuthStatus() {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        const user = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');

        if (token && user && this.validateToken(token)) {
            this.currentUser = user;
            this.updateUIForLoggedInUser();
        } else {
            this.clearSession();
            this.updateUIForLoggedOutUser();
        }
    }

    // Update UI for logged in user
    updateUIForLoggedInUser() {
        // Update login button to user menu
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn && this.currentUser) {
            loginBtn.innerHTML = `
                <div class="relative">
                    <button class="flex items-center space-x-2 space-x-reverse text-emerald-800 hover:text-emerald-600 transition">
                        <div class="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span class="text-sm font-bold text-emerald-800">
                                ${this.currentUser.firstName.charAt(0)}${this.currentUser.lastName.charAt(0)}
                            </span>
                        </div>
                        <span class="text-sm font-medium">${this.currentUser.firstName}</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                    <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden user-dropdown">
                        <a href="login system/profile.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">الملف الشخصي</a>
                        <a href="login system/settings.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">الإعدادات</a>
                        ${this.currentUser.userType === 'admin' ? '<a href="login system/admin-dashboard.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">لوحة الإدارة</a>' : ''}
                        <hr class="my-1">
                        <button id="logoutBtn" class="block w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-gray-100">تسجيل الخروج</button>
                    </div>
                </div>
            `;

            // Add dropdown functionality
            const userButton = loginBtn.querySelector('button');
            const dropdown = loginBtn.querySelector('.user-dropdown');
            
            userButton.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('hidden');
            });

            document.addEventListener('click', () => {
                dropdown.classList.add('hidden');
            });
        }
    }

    // Update UI for logged out user
    updateUIForLoggedOutUser() {
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            loginBtn.innerHTML = `
                <a href="pages/login.html" class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition">
                    تسجيل الدخول
                </a>
            `;
        }
    }

    // Logout user
    logout() {
        this.clearSession();
        this.showNotification('تم تسجيل الخروج بنجاح', 'success');
        
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
    }

    // Clear session data
    clearSession() {
        localStorage.removeItem('userToken');
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('userToken');
        sessionStorage.removeItem('currentUser');
        this.currentUser = null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Check user type
    hasRole(role) {
        return this.currentUser && this.currentUser.userType === role;
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg transition-all duration-300 transform translate-x-full`;
        
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-white',
            info: 'bg-blue-500 text-white'
        };

        notification.className += ` ${colors[type] || colors.info}`;
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="mr-2 text-white hover:text-gray-200">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }

    // Update user profile
    updateProfile(profileData) {
        if (!this.currentUser) return false;

        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex === -1) return false;

        this.users[userIndex].profile = { ...this.users[userIndex].profile, ...profileData };
        this.currentUser.profile = { ...this.currentUser.profile, ...profileData };

        localStorage.setItem('users', JSON.stringify(this.users));
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        return true;
    }

    // Change password
    changePassword(currentPassword, newPassword) {
        if (!this.currentUser) return false;

        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex === -1) return false;

        if (!this.verifyPassword(currentPassword, this.users[userIndex].password)) {
            return false;
        }

        this.users[userIndex].password = this.hashPassword(newPassword);
        localStorage.setItem('users', JSON.stringify(this.users));

        return true;
    }

    // Handle admin approval
    handleAdminApproval(requestId, approved) {
        const adminRequests = JSON.parse(localStorage.getItem('adminRequests')) || [];
        const requestIndex = adminRequests.findIndex(req => req.id === requestId);
        
        if (requestIndex === -1) return false;

        const request = adminRequests[requestIndex];
        request.status = approved ? 'approved' : 'rejected';
        request.processedDate = new Date().toISOString();
        request.processedBy = this.currentUser?.id || 'system';

        if (approved) {
            // Create admin user account
            const adminUser = {
                id: this.generateId(),
                firstName: request.firstName,
                lastName: request.lastName,
                email: request.email,
                userType: 'admin',
                password: this.hashPassword('admin123'), // Default password
                createdAt: new Date().toISOString(),
                lastLogin: null,
                profile: {
                    avatar: null,
                    phone: request.phone,
                    address: '',
                    bio: '',
                    position: request.position
                },
                adminRequestId: requestId
            };

            this.users.push(adminUser);
            localStorage.setItem('users', JSON.stringify(this.users));
        }

        adminRequests[requestIndex] = request;
        localStorage.setItem('adminRequests', JSON.stringify(adminRequests));

        return true;
    }

    // Get pending admin requests
    getPendingAdminRequests() {
        const adminRequests = JSON.parse(localStorage.getItem('adminRequests')) || [];
        return adminRequests.filter(req => req.status === 'pending');
    }

    // Get all admin requests
    getAllAdminRequests() {
        return JSON.parse(localStorage.getItem('adminRequests')) || [];
    }

    // Check if user has admin privileges
    isAdmin() {
        return this.currentUser && this.currentUser.userType === 'admin';
    }

    // Check if user can approve admin requests
    canApproveAdminRequests() {
        return this.isAdmin();
    }
}

// Initialize authentication system
const auth = new AuthSystem();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthSystem;
} 