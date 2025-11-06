# Student Account Deletion Mini-Project

A simple 2-page web application for deleting student accounts.

## Pages

### 1. Login Page (`login.html`)
- Form with Email and Password fields
- Stores credentials in sessionStorage
- Redirects to delete page on submit

### 2. Delete Account Page (`delete.html`)
- Centered "Delete Account" button
- Calls the delete API with stored credentials
- Shows success/error messages

## Setup

1. **Update API URL**: Open `script.js` and update the `API_URL` constant with your backend URL:
   ```javascript
   const API_URL = 'http://your-backend-url/api/students';
   ```

2. **Open in Browser**: Simply open `login.html` in your web browser

## How It Works

1. User enters email and password on login page
2. Credentials are stored in sessionStorage
3. User is redirected to delete page
4. When "Delete Account" is clicked:
   - API DELETE request is sent to your backend
   - Email and password are sent in request body
   - Success/error message is displayed
   - On success, user is redirected back to login after 3 seconds

## API Endpoint

The app expects a DELETE endpoint that:
- **URL**: `/api/students` (or your configured URL)
- **Method**: DELETE
- **Body**: `{ "email": "...", "password": "..." }`
- **Success Response**: `{ "status": "success", "message": "Student deleted successfully" }`
- **Error Response**: `{ "status": "failed", "message": "error message" }`

## Files

- `login.html` - Login page
- `delete.html` - Delete account page
- `script.js` - JavaScript logic
- `styles.css` - Styling
- `README.md` - This file
