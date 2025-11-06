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
            const response = await fetch(LOGIN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            
            if (!response.ok) {
                throw new Error(`Login failed: ${response.status}`);
            }
            
            const data = await response.json();
            const responseData = data.data || data;
            const token = responseData.token || data.token;
            const authObject = responseData.auth || {};
            const authId = authObject._id || authObject.id || authObject.authId || responseData.authId || responseData._id;
            
            if (!token || !authId) {
                alert('ERROR: Could not extract credentials from login response.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Continue';
                return;
            }
            
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
                token: token,
                authId: authId,
                email: email
            }));
            
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
        const authData = sessionStorage.getItem(STORAGE_KEY);
        
        if (!authData) {
            messageDiv.textContent = 'No login credentials found. Please login first.';
            messageDiv.className = 'message error';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
        
        const { email } = JSON.parse(authData);
        
        if (!confirm(`Are you absolutely sure? This will permanently delete the account for ${email}.`)) {
            return;
        }
        
        // Ask for password
        const password = prompt('Enter your password to confirm deletion:');
        
        console.log('Password prompt result:', password);
        console.log('Email:', email);
        
        if (!password) {
            messageDiv.textContent = 'Password is required to delete account';
            messageDiv.className = 'message error';
            return;
        }
        
        deleteBtn.disabled = true;
        deleteBtn.textContent = 'Deleting...';
        messageDiv.textContent = 'Processing your request...';
        messageDiv.className = 'message loading';
        
        try {
            const requestBody = {
                email: email,
                password: password
            };
            
            console.log('Sending DELETE request with body:', requestBody);
            
            const response = await fetch(DELETE_URL, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            console.log('Response status:', response.status);
            const responseText = await response.text();
            console.log('Response text:', responseText);
            
            if (!response.ok) {
                throw new Error(`${response.status}: ${responseText}`);
            }
            
            const data = JSON.parse(responseText);
            
            if (data.status === 'success') {
                messageDiv.textContent = 'Account deleted successfully!';
                messageDiv.className = 'message success';
                sessionStorage.removeItem(STORAGE_KEY);
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);
            } else {
                throw new Error(data.message || 'Failed to delete account');
            }
        } catch (error) {
            console.error('Delete error:', error);
            messageDiv.textContent = `Error: ${error.message}`;
            messageDiv.className = 'message error';
            deleteBtn.disabled = false;
            deleteBtn.textContent = 'Delete Account';
        }
    });
}