document.addEventListener('DOMContentLoaded', function() {
    console.log('TechHive script initialized');
    // Check for URL parameters - this demonstrates another vulnerability
    // An attacker could craft URLs with specific parameters to potentially bypass authentication
    const urlParams = new URLSearchParams(window.location.search);
    const directAccess = urlParams.get('directAccess');
    
    if (directAccess === 'true' && window.location.pathname.includes('dashboard.html')) {
        // This is a demonstration of a vulnerability - allowing direct access through URL parameters
        console.log('Direct access enabled via URL parameter');
        // We don't redirect to login page even if not logged in
    }
    // Handle tab switching in login/register page
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginTab && registerTab) {
        loginTab.addEventListener('click', function() {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        });

        registerTab.addEventListener('click', function() {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
        });
    }

    // Handle login form submission
    const loginFormElement = document.getElementById('loginForm');
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember').checked;
            
            // Simple client-side authentication
            authenticateUser(username, password, rememberMe);
        });
    }

    // Handle register form submission
    const registerFormElement = document.getElementById('registerForm');
    if (registerFormElement) {
        registerFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('reg-username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-confirm-password').value;
            
            if (password !== confirmPassword) {
                showMessage('register-message', 'Passwords do not match!', 'error');
                return;
            }
            
            // Register user
            registerUser(username, email, password);
        });
    }

    // Handle user menu dropdown in dashboard
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', function() {
            userDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }

    // Handle logout
    const logoutBtn = document.getElementById('logout-btn');
    const dropdownLogout = document.getElementById('dropdown-logout');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logoutUser();
        });
    }
    
    if (dropdownLogout) {
        dropdownLogout.addEventListener('click', function(e) {
            e.preventDefault();
            logoutUser();
        });
    }

    // Check if user is logged in when on protected pages
    if (window.location.pathname.includes('dashboard.html') || 
        window.location.pathname.includes('settings.html') ||
        window.location.pathname.includes('users.html')) {
        console.log('Protected page detected. Checking login status...');
        const isLoggedIn = checkLoginStatus();
        if (!isLoggedIn) {
            window.location.href = 'login.html';
        } else {
            displayUserInfo();
            
            // Initialize specific page functionality
            if (window.location.pathname.includes('settings.html')) {
                initializeSettingsPage();
            } else if (window.location.pathname.includes('users.html')) {
                initializeUsersPage();
            }
        }
    }
});

// Simple client-side authentication function
function authenticateUser(username, password, rememberMe) {
    // Hard-coded user credentials for demonstration
    const users = [
        { username: 'admin', password: 'admin123', role: 'Admin', id: 1 },
        { username: 'john', password: 'john2023', role: 'Member', id: 2 },
        { username: 'sarah', password: 'sarah123', role: 'Member', id: 3 }
    ];
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Store user info in sessionStorage or localStorage
        if (rememberMe) {
            localStorage.setItem('currentUser', JSON.stringify({
                username: user.username,
                role: user.role,
                id: user.id,
                // Predictable, easily manipulable session identifier
                sessionId: btoa(user.username + ':' + user.id + ':' + new Date().getTime())
            }));
        } else {
            sessionStorage.setItem('currentUser', JSON.stringify({
                username: user.username,
                role: user.role,
                id: user.id,
                // Predictable, easily manipulable session identifier
                sessionId: btoa(user.username + ':' + user.id + ':' + new Date().getTime())
            }));
        }
        
        // Set a simple cookie with the username, role, and id for demonstration
        // No HttpOnly flag, no Secure flag, user data in plain text
        document.cookie = `user=${user.username}; path=/`;
        document.cookie = `role=${user.role}; path=/`;
        document.cookie = `user_id=${user.id}; path=/`;

        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } else {
        showMessage('login-message', 'Invalid username or password', 'error');
    }
}

// Register a new user (client-side only, for demonstration)
function registerUser(username, email, password) {
    // Store in localStorage for demonstration
    const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    
    // Check if username already exists
    if (users.some(u => u.username === username)) {
        showMessage('register-message', 'Username already exists!', 'error');
        return;
    }
    
    // Generate a new ID (highest existing + 1)
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 100;
    
    // Add new user with plain text password
    users.push({
        username: username,
        email: email,
        password: password, // Storing password in plain text
        role: 'Member',
        id: newId
    });
    
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    showMessage('register-message', 'Registration successful! Please login.', 'success');
    
    // Clear form fields
    document.getElementById('reg-username').value = '';
    document.getElementById('reg-email').value = '';
    document.getElementById('reg-password').value = '';
    document.getElementById('reg-confirm-password').value = '';
    
    // Switch to login tab after successful registration
    document.getElementById('login-tab').click();
}

// Check login status
function checkLoginStatus() {
    const user = JSON.parse(sessionStorage.getItem('currentUser')) || JSON.parse(localStorage.getItem('currentUser'));
    return !!user;
}

// Display user info in dashboard
function displayUserInfo() {
    console.log('Displaying user info');
    
    // CRITICAL VULNERABILITY: Check cookies first, which can be manipulated by users
    const roleCookie = getCookie('role');
    const userIdCookie = getCookie('user_id');
    
    console.log('Cookie values found:', { role: roleCookie, user_id: userIdCookie });
    
    // Get user from session/localStorage
    let user = JSON.parse(sessionStorage.getItem('currentUser')) || JSON.parse(localStorage.getItem('currentUser'));
    console.log('Original user data from storage:', user);
    
    // VULNERABILITY: We override user data with cookie values if present (without verification)
    // This allows privilege escalation through cookie manipulation
    if (roleCookie) {
        console.log('VULNERABILITY EXPLOIT: Overriding role from cookie:', roleCookie);
        user.role = roleCookie;
    }
    
    if (userIdCookie) {
        console.log('VULNERABILITY EXPLOIT: Overriding user ID from cookie:', userIdCookie);
        user.id = userIdCookie;
    }
    
    console.log('Final user data after cookie override:', user);
    
    if (user) {
        const userDisplayname = document.getElementById('user-displayname');
        const userRole = document.getElementById('user-role');
        const adminPanel = document.getElementById('admin-panel');
        const memberOnlyContent = document.getElementById('member-only-content');
        
        if (userDisplayname && userRole) {
            userDisplayname.textContent = user.username;
            userRole.textContent = user.role;
            
            // VULNERABILITY: Highlight when admin role is active
            if (user.role === 'Admin') {
                userRole.style.color = '#b71c1c';
                userRole.style.fontWeight = 'bold';
            }
            
            // Show user ID in user profile
            const userIdElement = document.getElementById('user-id');
            if (userIdElement) {
                userIdElement.textContent = user.id;
            }
            
            // Toggle visibility of role-specific content
            if (adminPanel) {
                adminPanel.style.display = user.role === 'Admin' ? 'block' : 'none';
            }
            
            // Member-only content
            if (memberOnlyContent) {
                memberOnlyContent.style.display = (user.role === 'Member' || user.role === 'Admin') ? 'block' : 'none';
            }
            
            // Add premium features if user ID is 1 (admin)
            setupRoleBasedContent(user);
            
            // Show/hide user management nav links
            const usersNavLink = document.getElementById('users-nav-link');
            const usersSidebarLink = document.getElementById('users-sidebar-link');
            
            if (usersNavLink && usersSidebarLink) {
                if (user.role === 'Admin') {
                    usersNavLink.style.display = 'block';
                    usersSidebarLink.style.display = 'block';
                } else {
                    usersNavLink.style.display = 'none';
                    usersSidebarLink.style.display = 'none';
                }
            }
        }
    }
}

// Set up different content based on user role
function setupRoleBasedContent(user) {
    console.log('Setting up role-based content for user:', user);
    
    // Get all UI elements that need to change based on user role
    const adminPanel = document.getElementById('admin-panel');
    const adminBanner = document.getElementById('admin-banner');
    const premiumFeatures = document.getElementById('premium-features');
    const usersSidebarLink = document.getElementById('users-sidebar-link');
    const usersNavLink = document.getElementById('users-nav-link');
    const memberOnlyContent = document.getElementById('member-only-content');
    
    // Check if user is admin from the role in cookie or session storage
    const isAdmin = user.role === 'Admin';
    const isPremium = user.id === 1 || user.id === '1';
    
    console.log('User role:', user.role, 'isAdmin:', isAdmin, 'isPremium:', isPremium);
    
    // Show/hide admin panel based on role
    if (adminPanel) {
        // This enables the vulnerability - admin panel visibility is based solely on the role claim
        adminPanel.style.display = isAdmin ? 'block' : 'none';
        console.log('Admin panel display:', adminPanel.style.display);
    }
    
    // Show/hide admin banner
    if (adminBanner) {
        adminBanner.style.display = isAdmin ? 'block' : 'none';
        console.log('Admin banner display:', adminBanner.style.display);
    }
    
    // Show/hide premium features based on user ID
    if (premiumFeatures) {
        // This enables the vulnerability - premium features are shown based solely on the ID claim
        premiumFeatures.style.display = isPremium ? 'block' : 'none';
        console.log('Premium features display:', premiumFeatures.style.display);
    }
    
    // Show/hide users link in sidebar and navbar
    if (usersSidebarLink) {
        usersSidebarLink.style.display = isAdmin ? 'block' : 'none';
    }
    
    if (usersNavLink) {
        usersNavLink.style.display = isAdmin ? 'inline-block' : 'none';
    }
    
    // Hide member-only content for admins to emphasize the difference
    if (memberOnlyContent && isAdmin) {
        memberOnlyContent.style.display = 'none';
    }
    
    // Update dashboard title based on role
    const dashboardTitle = document.querySelector('.dashboard-header h2');
    if (dashboardTitle) {
        dashboardTitle.textContent = isAdmin ? 'Admin Dashboard' : 'My Dashboard';
        // Change color for admin dashboard
        dashboardTitle.style.color = isAdmin ? '#b71c1c' : ''; // Red color for admin
    }
    
    // Change the page background color slightly for admin users
    if (isAdmin) {
        document.body.classList.add('admin-mode');
    } else {
        document.body.classList.remove('admin-mode');
    }
}

// Logout user
function logoutUser() {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('currentUser');
    
    // Clear cookies
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    window.location.href = 'login.html';
}

// Show message in form
function showMessage(elementId, message, type) {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = 'message-box ' + type;
    }
}

// Function to get cookie value by name
function getCookie(name) {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='))
        ?.split('=')[1];
    return cookieValue ? decodeURIComponent(cookieValue) : null;
}

// Initialize settings page functionality
function initializeSettingsPage() {
    console.log('Initializing settings page');
    const user = JSON.parse(sessionStorage.getItem('currentUser')) || JSON.parse(localStorage.getItem('currentUser'));
    
    if (!user) return;
    
    // Fill form fields with current user data
    const usernameField = document.getElementById('settings-username');
    const emailField = document.getElementById('settings-email');
    const roleField = document.getElementById('settings-role');
    const idField = document.getElementById('settings-user-id');
    
    if (usernameField) usernameField.value = user.username;
    if (emailField) {
        // In a real app, we'd have the email, for our demo we'll just use username
        emailField.value = user.username + '@example.com';
    }
    if (roleField) roleField.value = user.role;
    if (idField) idField.value = user.id;
    
    // Handle settings form submission
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get updated values
            const updatedUsername = usernameField ? usernameField.value : user.username;
            const updatedEmail = emailField ? emailField.value : user.username + '@example.com';
            const updatedRole = roleField ? roleField.value : user.role;
            const updatedId = idField ? parseInt(idField.value) : user.id;
            
            // Update user in storage - demonstrating the vulnerability
            const updatedUser = {
                username: updatedUsername,
                role: updatedRole,
                id: updatedId,
                sessionId: user.sessionId
            };
            
            // Update in the same storage the user was loaded from
            if (sessionStorage.getItem('currentUser')) {
                sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
            } else {
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            }
            
            // Update cookies as well
            document.cookie = `user=${updatedUsername}; path=/`;
            document.cookie = `role=${updatedRole}; path=/`;
            document.cookie = `user_id=${updatedId}; path=/`;
            
            // Show success message
            showMessage('settings-message', 'Settings updated successfully!', 'success');
            
            // Refresh user info displayed
            displayUserInfo();
        });
    }
}

// Initialize users page functionality
function initializeUsersPage() {
    console.log('Initializing users page');
    // Check if user is admin
    const user = JSON.parse(sessionStorage.getItem('currentUser')) || JSON.parse(localStorage.getItem('currentUser'));
    
    if (!user || user.role !== 'Admin') {
        // Redirect non-admin users who somehow got to this page
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Demo users
    const demoUsers = [
        { id: 1, username: 'admin', email: 'admin@example.com', role: 'Admin', lastLogin: '2025-03-19' },
        { id: 2, username: 'john', email: 'john@example.com', role: 'Member', lastLogin: '2025-03-18' },
        { id: 3, username: 'sarah', email: 'sarah@example.com', role: 'Member', lastLogin: '2025-03-17' }
    ];
    
    // Get registered users from localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    
    // Combine demo and registered users
    const allUsers = [...demoUsers, ...registeredUsers.map(u => {
        return {
            id: u.id,
            username: u.username,
            email: u.email || u.username + '@example.com',
            role: u.role,
            lastLogin: '2025-03-15'
        };
    })];
    
    // Populate users table
    populateUsersTable(allUsers);
    
    // Initialize add user form
    const addUserForm = document.getElementById('add-user-form');
    if (addUserForm) {
        addUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('new-username').value;
            const email = document.getElementById('new-email').value;
            const password = document.getElementById('new-password').value;
            const role = document.getElementById('new-role').value;
            
            // Generate new ID
            const newId = Math.max(...allUsers.map(u => u.id)) + 1;
            
            // Add to registered users in localStorage
            registeredUsers.push({
                id: newId,
                username,
                email,
                password, // plaintext password storage - intentional vulnerability
                role
            });
            
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
            
            // Close modal
            document.getElementById('user-modal').style.display = 'none';
            
            // Refresh table
            const newUser = {
                id: newId,
                username,
                email,
                role,
                lastLogin: 'Never'
            };
            
            allUsers.push(newUser);
            populateUsersTable(allUsers);
            
            // Clear form
            addUserForm.reset();
        });
    }
    
    // Modal open/close handlers
    const addUserBtn = document.getElementById('add-user-btn');
    const closeModalBtn = document.querySelector('.close-modal');
    const userModal = document.getElementById('user-modal');
    
    if (addUserBtn && userModal) {
        addUserBtn.addEventListener('click', function() {
            // Reset form
            if (addUserForm) addUserForm.reset();
            // Set form mode
            document.getElementById('user-modal-title').textContent = 'Add User';
            // Show modal
            userModal.style.display = 'block';
        });
    }
    
    if (closeModalBtn && userModal) {
        closeModalBtn.addEventListener('click', function() {
            userModal.style.display = 'none';
        });
        
        // Close when clicking outside modal
        window.addEventListener('click', function(event) {
            if (event.target == userModal) {
                userModal.style.display = 'none';
            }
        });
    }
}

// Populate users table
function populateUsersTable(users) {
    const tableBody = document.querySelector('#users-table tbody');
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add user rows
    users.forEach(user => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${user.lastLogin}</td>
            <td>
                <button class="edit-btn" data-id="${user.id}"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" data-id="${user.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    attachUserActionEventListeners(users);
}

// Attach event listeners to user action buttons
function attachUserActionEventListeners(users) {
    // Edit buttons
    const editBtns = document.querySelectorAll('.edit-btn');
    editBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = parseInt(this.getAttribute('data-id'));
            const user = users.find(u => u.id === userId);
            
            if (user) {
                // Fill form fields
                document.getElementById('new-username').value = user.username;
                document.getElementById('new-email').value = user.email;
                document.getElementById('new-password').value = ''; // Don't show password
                document.getElementById('new-role').value = user.role;
                
                // Set form mode
                document.getElementById('user-modal-title').textContent = 'Edit User';
                
                // Set form data attribute for later identification
                document.getElementById('add-user-form').setAttribute('data-edit-id', userId);
                
                // Show modal
                document.getElementById('user-modal').style.display = 'block';
            }
        });
    });
    
    // Delete buttons
    const deleteBtns = document.querySelectorAll('.delete-btn');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = parseInt(this.getAttribute('data-id'));
            
            // Ask for confirmation
            if (confirm('Are you sure you want to delete this user?')) {
                // Update registeredUsers in localStorage
                const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
                const updatedUsers = registeredUsers.filter(u => u.id !== userId);
                localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
                
                // Refresh table
                const allUsers = users.filter(u => u.id !== userId);
                populateUsersTable(allUsers);
            }
        });
    });
}
