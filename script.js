// Configuration
const LOGIN_URL = import.meta.env.VITE_LOGIN_ENDPOINT;
const DELETE_URL = import.meta.env.VITE_DELETE_ENDPOINT;

// Storage keys
const STORAGE_KEY = 'authData';

// Page: Login
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
        
        try {
            // Call login API
            const response = await fetch(LOGIN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Login failed: ${response.status} ${text}`);
            }
            
            const data = await response.json();
            
            // Debug: Log the response to see the structure
            console.log('=== LOGIN RESPONSE ===');
            console.log('Full response:', data);
            console.log('Keys in response:', Object.keys(data));
            console.log('Data object:', data.data);
            console.log('Keys in data.data:', data.data ? Object.keys(data.data) : 'N/A');
            console.log('Auth object:', data.data?.auth);
            console.log('Keys in auth:', data.data?.auth ? Object.keys(data.data.auth) : 'N/A');
            console.log('=====================');
            
            // Extract from data.data object
            const responseData = data.data || data;
            const token = responseData.token || responseData.accessToken || responseData.jwtToken || data.token;
            
            // AuthId is inside the auth object
            const authObject = responseData.auth || {};
            const authId = authObject._id || authObject.id || authObject.authId || 
                          responseData.authId || responseData.userId || responseData._id || responseData.id;
            
            console.log('Extracted token:', token);
            console.log('Extracted authId:', authId);
            
            if (!token || !authId) {
                alert('ERROR: Could not extract token or authId from login response. Check console for details.');
                return; // Don't redirect, stay on page
            }
            
            // Store auth data (token and authId)
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
                token: token,
                authId: authId,
                email: email
            }));
            
            console.log('Stored in sessionStorage:', sessionStorage.getItem(STORAGE_KEY));
            
            // Redirect to delete page
            window.location.href = 'delete.html';
            
        } catch (error) {
            console.error(error);
            alert(`Error: ${error.message}`);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Continue';
        }
    });
}

// Page: Delete Account
if (document.getElementById('deleteBtn')) {
    const deleteBtn = document.getElementById('deleteBtn');
    const messageDiv = document.getElementById('message');
    
    deleteBtn.addEventListener('click', async () => {
        // Get stored auth data
        const authData = sessionStorage.getItem(STORAGE_KEY);
        
        console.log('Raw authData from sessionStorage:', authData);
        
        if (!authData) {
            showMessage('No login credentials found. Please login first.', 'error');
            console.error('No authData in sessionStorage');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
        
        const { token, authId, email } = JSON.parse(authData);
        
        console.log('Parsed authData:', { token, authId, email });
        console.log('Token exists:', !!token, 'AuthId exists:', !!authId);
        
        if (!token || !authId) {
            showMessage('Invalid authentication data. Please login again.', 'error');
            console.error('Missing token or authId:', { token: !!token, authId });
            // Don't redirect immediately - keep it on page so we can see console
            return;
        }
        
        // Confirm deletion
        if (!confirm(`Are you absolutely sure? This will permanently delete the account for ${email}.`)) {
            return;
        }
        
        // Show loading state
        deleteBtn.disabled = true;
        deleteBtn.textContent = 'Deleting...';
        showMessage('Processing your request...', 'loading');
        
        try {
            // Log the authId to verify it's correct
            console.log('AuthId being used:', authId);
            console.log('AuthId type:', typeof authId);
            
            // Make sure we're using the correct endpoint with authId in the URL
            const deleteUrl = `${DELETE_URL}/${authId}`;
            console.log('Making DELETE request to:', deleteUrl);
            console.log('Using token:', token ? 'Token exists (first 10 chars): ' + token.substring(0, 10) + '...' : 'No token');
            
            const response = await fetch(deleteUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Response status:', response.status);
            const responseText = await response.text();
            console.log('Response text:', responseText);
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}\n${responseText}`);
            }
            
            const data = await response.json();
            
            if (data.success || data.status === 'success') {
                showMessage('Account deleted successfully!', 'success');
                sessionStorage.removeItem(STORAGE_KEY);
                
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);
            } else {
                throw new Error(data.message || 'Failed to delete account');
            }
        } catch (error) {
            console.error(error);
            showMessage(`Error: ${error.message}`, 'error');
            deleteBtn.disabled = false;
            deleteBtn.textContent = 'Delete Account';
        }
    });
    
    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
    }
}
