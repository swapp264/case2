// Authentication state management for StrayCare
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userType = null; // 'ngo', 'admin', 'user', or null
        this.loadAuthState();
        // Ensure clean state for guest users
        this.ensureGuestState();
    }

    // Ensure NGO Dashboard is hidden for guest users
    ensureGuestState() {
        if (!this.isLoggedIn()) {
            // Remove any existing NGO sections immediately
            setTimeout(() => {
                const ngoSection = document.querySelector('.ngo-section');
                if (ngoSection) {
                    ngoSection.remove();
                }
            }, 0);
        }
    }

    // Load authentication state from localStorage
    loadAuthState() {
        const savedAuth = localStorage.getItem('straycare_auth');
        if (savedAuth) {
            const authData = JSON.parse(savedAuth);
            this.currentUser = authData.user;
            this.userType = authData.type;
        }
    }

    // Save authentication state to localStorage
    saveAuthState() {
        const authData = {
            user: this.currentUser,
            type: this.userType
        };
        localStorage.setItem('straycare_auth', JSON.stringify(authData));
    }

    // Login method
    login(userType, userData) {
        this.currentUser = userData;
        this.userType = userType;
        this.saveAuthState();
        this.updateUI();
    }

    // Logout method
    logout() {
        this.currentUser = null;
        this.userType = null;
        localStorage.removeItem('straycare_auth');
        this.updateUI();
        // Redirect to homepage
        window.location.href = 'index.html';
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Check if user is NGO or Admin
    isNGOOrAdmin() {
        return this.userType === 'ngo' || this.userType === 'admin';
    }

    // Get current user info
    getCurrentUser() {
        return this.currentUser;
    }

    // Get user type
    getUserType() {
        return this.userType;
    }

    // Update UI based on authentication state
    updateUI() {
        this.updateNavigation();
        this.updateUserActions();
    }

    // Update navigation visibility
    updateNavigation() {
        // Always remove existing NGO section first
        const existingNgoSection = document.querySelector('.ngo-section');
        if (existingNgoSection) {
            existingNgoSection.remove();
        }

        // Add NGO Dashboard to navigation only if user is NGO/Admin
        if (this.isNGOOrAdmin()) {
            const nav = document.querySelector('nav ul');
            if (nav) {
                // If a Dashboard link already exists, do not add another NGO section.
                const existingDashLink = nav.querySelector('a[href="dashboard.html"]');
                if (existingDashLink) {
                    return; // Avoid duplicate "NGO Dashboard" entry
                }
                // Otherwise, create an NGO section (rare on public pages without dashboard link)
                const ngoLi = document.createElement('li');
                ngoLi.className = 'ngo-section';
                ngoLi.innerHTML = `
                    <a href="dashboard.html">NGO Dashboard</a>
                    <ul class="submenu">
                        <li><a href="dashboard.html">Overview</a></li>
                        <li><a href="rescue-cases.html">Rescue Cases</a></li>
                        <li><a href="medical-records.html">Medical Records</a></li>
                        <li><a href="volunteers.html">Volunteer Management</a></li>
                        <li><a href="collaboration.html">Collaboration Hub</a></li>
                    </ul>
                `;
                nav.appendChild(ngoLi);
            }
        }
    }

    // Update user actions dropdown
    updateUserActions() {
        const userDropdown = document.querySelector('.user-dropdown');
        const dropdownMenu = document.querySelector('.dropdown-menu');
        const userIcon = document.querySelector('.user-icon');

        if (!userDropdown || !dropdownMenu || !userIcon) return;

        if (this.isLoggedIn()) {
            // Update user icon text
            const userTypeText = this.userType === 'ngo' ? 'NGO Admin' : 
                                this.userType === 'admin' ? 'Admin' : 'User';
            userIcon.textContent = `👤 ${userTypeText}`;

            // Update dropdown menu
            if (this.isNGOOrAdmin()) {
                dropdownMenu.innerHTML = `
                    <a href="profile.html">Profile</a>
                    <a href="settings.html">Settings</a>
                    <a href="#" onclick="authManager.logout()">Logout</a>
                `;
            } else {
                dropdownMenu.innerHTML = `
                    <a href="profile.html">Profile</a>
                    <a href="#" onclick="authManager.logout()">Logout</a>
                `;
            }
        } else {
            // Not logged in
            userIcon.textContent = '👤';
            dropdownMenu.innerHTML = `
                <a href="login.html">Login</a>
                <a href="register.html">Register (User)</a>
            `;
        }
    }

    // Restrict access to NGO/Admin pages
    restrictAccess() {
        const currentPage = window.location.pathname.split('/').pop();
        const ngoPages = ['dashboard.html', 'rescue-cases.html', 'medical-records.html', 
                         'volunteers.html', 'collaboration.html'];
        const adminPages = ['settings.html'];

        // if (ngoPages.includes(currentPage) && !this.isNGOOrAdmin()) {
        //     alert('Access denied. Please login as NGO or Admin.');
        //     window.location.href = 'login.html';
        //     return false;
        // }

        if (adminPages.includes(currentPage) && this.userType !== 'admin' && this.userType !== 'ngo') {
            alert('Access denied. Admin/NGO access required.');
            window.location.href = 'login.html';
            return false;
        }

        return true;
    }

    // Show profile only for logged-in users
    showProfile() {
        if (!this.isLoggedIn()) {
            alert('Please login to view your profile.');
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Ensure NGO Dashboard is hidden by default for guest users
    const ngoSection = document.querySelector('.ngo-section');
    if (ngoSection) {
        ngoSection.remove();
    }
    
    authManager.updateUI();
    
    // Check access restrictions
    authManager.restrictAccess();
    
    // Handle profile link clicks
    const profileLinks = document.querySelectorAll('a[href="profile.html"]');
    profileLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (!authManager.showProfile()) {
                e.preventDefault();
            }
        });
    });
});

// Demo login functions for testing
function demoLoginAsNGO() {
    authManager.login('ngo', {
        name: 'Mumbai Animal Rescue',
        email: 'admin@mumbairescue.org',
        id: 'ngo_001'
    });
}

function demoLoginAsUser() {
    authManager.login('user', {
        name: 'John Doe',
        email: 'john@example.com',
        id: 'user_001'
    });
}

function demoLoginAsAdmin() {
    authManager.login('admin', {
        name: 'System Admin',
        email: 'admin@straycare.org',
        id: 'admin_001'
    });
}
