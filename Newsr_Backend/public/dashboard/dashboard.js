// Global variables
let requestHistory = [];
let authToken = localStorage.getItem('authToken') || null;

// DOM Elements
const apiStatusIndicator = document.getElementById('api-status-indicator');
const apiStatusText = document.getElementById('api-status-text');
const apiResponseTime = document.getElementById('api-response-time');
const apiLastChecked = document.getElementById('api-last-checked');
const checkApiStatusBtn = document.getElementById('check-api-status');

const serverTimeEl = document.getElementById('server-time');
const serverVersionEl = document.getElementById('server-version');
const serverEnvironmentEl = document.getElementById('server-environment');
const fetchServerInfoBtn = document.getElementById('fetch-server-info');

const authStatusIndicator = document.getElementById('auth-status-indicator');
const authStatusText = document.getElementById('auth-status-text');
const loginForm = document.getElementById('login-form');
const userInfoSection = document.getElementById('user-info');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const loggedInUserEl = document.getElementById('logged-in-user');
const userRoleEl = document.getElementById('user-role');

const requestMethodSelect = document.getElementById('request-method');
const requestUrlInput = document.getElementById('request-url');
const requestBodyTextarea = document.getElementById('request-body');
const sendRequestBtn = document.getElementById('send-request');
const responseStatus = document.getElementById('response-status');
const responseTime = document.getElementById('response-time');
const responseHeaders = document.getElementById('response-headers');
const responseBody = document.getElementById('response-body');
const headersContainer = document.getElementById('headers-container');
const addHeaderBtn = document.getElementById('add-header');

const recentRequestsTable = document.getElementById('recent-requests-table');
const searchEndpointsInput = document.getElementById('search-endpoints');
const endpointsList = document.getElementById('endpoints-list');

// Initialize the dashboard
function initDashboard() {
    // Check if we have a stored auth token
    updateAuthStatus();
    
    // Check API status on load
    checkApiStatus();
    
    // Fetch server info
    fetchServerInfo();
    
    // Load stored request history
    loadRequestHistory();
    
    // Add event listeners
    setupEventListeners();
    
    // Load endpoint suggestions
    setupEndpointSuggestions();
}

// Setup event listeners
function setupEventListeners() {
    // API Status check
    checkApiStatusBtn.addEventListener('click', checkApiStatus);
    
    // Server info fetch
    fetchServerInfoBtn.addEventListener('click', fetchServerInfo);
    
    // Authentication
    loginButton.addEventListener('click', handleLogin);
    logoutButton.addEventListener('click', handleLogout);
    
    // Request sending
    sendRequestBtn.addEventListener('click', sendRequest);
    
    // Add header
    addHeaderBtn.addEventListener('click', addHeaderRow);
    
    // Endpoint search
    searchEndpointsInput.addEventListener('input', filterEndpoints);
    
    // Click on endpoint suggestions
    document.querySelectorAll('.endpoint-card').forEach(card => {
        card.addEventListener('click', function() {
            const method = this.querySelector('h3').textContent.split(' ')[0];
            const endpoint = this.querySelector('h3').textContent.split(' ')[1];
            
            requestMethodSelect.value = method;
            requestUrlInput.value = endpoint;
            
            // Scroll to the request section
            document.getElementById('send-request').scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// Check API Status
async function checkApiStatus() {
    apiStatusText.textContent = "Checking...";
    apiStatusIndicator.className = "w-4 h-4 rounded-full bg-gray-300 mr-2";
    
    const startTime = Date.now();
    
    try {
        const response = await fetch('/api/status');
        const endTime = Date.now();
        const responseTimeMs = endTime - startTime;
        
        if (response.ok) {
            apiStatusIndicator.className = "w-4 h-4 rounded-full status-success mr-2";
            apiStatusText.textContent = "Online";
            apiResponseTime.textContent = responseTimeMs;
        } else {
            apiStatusIndicator.className = "w-4 h-4 rounded-full status-warning mr-2";
            apiStatusText.textContent = `Error (${response.status})`;
            apiResponseTime.textContent = responseTimeMs;
        }
    } catch (error) {
        apiStatusIndicator.className = "w-4 h-4 rounded-full status-error mr-2";
        apiStatusText.textContent = "Offline";
        apiResponseTime.textContent = "N/A";
    }
    
    apiLastChecked.textContent = new Date().toLocaleTimeString();
}

// Fetch Server Info
async function fetchServerInfo() {
    try {
        const response = await fetch('/api/info');
        
        if (response.ok) {
            const data = await response.json();
            serverTimeEl.textContent = new Date(data.serverTime).toLocaleString();
            serverVersionEl.textContent = data.version || 'Unknown';
            serverEnvironmentEl.textContent = data.environment || 'Development';
        } else {
            serverTimeEl.textContent = 'Error fetching';
            serverVersionEl.textContent = 'Unknown';
            serverEnvironmentEl.textContent = 'Unknown';
        }
    } catch (error) {
        serverTimeEl.textContent = 'Error fetching';
        serverVersionEl.textContent = 'Unknown';
        serverEnvironmentEl.textContent = 'Unknown';
    }
}

// Update Auth Status
function updateAuthStatus() {
    if (authToken) {
        // We have a token, but need to verify it
        verifyToken();
    } else {
        // No token
        authStatusIndicator.className = "w-4 h-4 rounded-full bg-gray-300 mr-2";
        authStatusText.textContent = "Not authenticated";
        loginForm.classList.remove('hidden');
        userInfoSection.classList.add('hidden');
    }
}

// Verify Token
async function verifyToken() {
    try {
        const response = await fetch('/api/auth/verify', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const userData = await response.json();
            authStatusIndicator.className = "w-4 h-4 rounded-full status-success mr-2";
            authStatusText.textContent = "Authenticated";
            loginForm.classList.add('hidden');
            userInfoSection.classList.remove('hidden');
            loggedInUserEl.textContent = userData.username || userData.email || 'User';
            userRoleEl.textContent = userData.role || 'User';
        } else {
            // Token invalid
            localStorage.removeItem('authToken');
            authToken = null;
            authStatusIndicator.className = "w-4 h-4 rounded-full status-error mr-2";
            authStatusText.textContent = "Invalid token";
            loginForm.classList.remove('hidden');
            userInfoSection.classList.add('hidden');
        }
    } catch (error) {
        authStatusIndicator.className = "w-4 h-4 rounded-full status-error mr-2";
        authStatusText.textContent = "Verification error";
        console.error("Token verification error:", error);
    }
}

// Handle Login
async function handleLogin() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!username || !password) {
        alert("Please enter both username and password");
        return;
    }
    
    loginButton.textContent = "Logging in...";
    loginButton.disabled = true;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            
            // Update UI
            authStatusIndicator.className = "w-4 h-4 rounded-full status-success mr-2";
            authStatusText.textContent = "Authenticated";
            loginForm.classList.add('hidden');
            userInfoSection.classList.remove('hidden');
            loggedInUserEl.textContent = data.user?.username || data.user?.email || username;
            userRoleEl.textContent = data.user?.role || 'User';
            
            // Clear form
            usernameInput.value = '';
            passwordInput.value = '';
        } else {
            authStatusIndicator.className = "w-4 h-4 rounded-full status-error mr-2";
            authStatusText.textContent = "Authentication failed";
            
            const data = await response.json();
            alert(data.message || "Login failed. Please check your credentials.");
        }
    } catch (error) {
        authStatusIndicator.className = "w-4 h-4 rounded-full status-error mr-2";
        authStatusText.textContent = "Connection error";
        alert("Connection error. Please try again later.");
        console.error("Login error:", error);
    } finally {
        loginButton.textContent = "Login";
        loginButton.disabled = false;
    }
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem('authToken');
    authToken = null;
    
    // Update UI
    authStatusIndicator.className = "w-4 h-4 rounded-full bg-gray-300 mr-2";
    authStatusText.textContent = "Not authenticated";
    loginForm.classList.remove('hidden');
    userInfoSection.classList.add('hidden');
}

// Send API Request
async function sendRequest() {
    const method = requestMethodSelect.value;
    const url = requestUrlInput.value;
    
    if (!url) {
        alert("Please enter a URL");
        return;
    }
    
    // Prepare headers
    const headers = new Headers();
    document.querySelectorAll('.header-row').forEach(row => {
        const nameInput = row.querySelector('.header-name');
        const valueInput = row.querySelector('.header-value');
        
        if (nameInput && valueInput) {
            const name = nameInput.value.trim();
            const value = valueInput.value.trim();
            
            if (name && value) {
                headers.append(name, value);
            }
        }
    });
    
    // Add auth token if available
    if (authToken) {
        headers.append('Authorization', `Bearer ${authToken}`);
    }
    
    // Prepare request body
    let requestBodyJson = null;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
        try {
            const bodyText = requestBodyTextarea.value.trim();
            if (bodyText) {
                requestBodyJson = JSON.parse(bodyText);
                headers.append('Content-Type', 'application/json');
            }
        } catch (error) {
            alert("Invalid JSON in request body");
            return;
        }
    }
    
    // Update UI before sending
    sendRequestBtn.textContent = "Sending...";
    sendRequestBtn.disabled = true;
    responseStatus.textContent = "-";
    responseStatus.className = "px-2 py-1 text-xs rounded bg-gray-200 text-gray-800";
    responseTime.textContent = "-";
    responseHeaders.innerHTML = "";
    responseHeaders.classList.add('hidden');
    responseBody.textContent = "Sending request...";
    
    // Send the request
    const startTime = Date.now();
    
    try {
        const response = await fetch(url, {
            method,
            headers,
            body: requestBodyJson ? JSON.stringify(requestBodyJson) : undefined
        });
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Display response status
        responseStatus.textContent = `${response.status} ${response.statusText}`;
        if (response.ok) {
            responseStatus.className = "px-2 py-1 text-xs rounded bg-green-100 text-green-800";
        } else {
            responseStatus.className = "px-2 py-1 text-xs rounded bg-red-100 text-red-800";
        }
        
        responseTime.textContent = `${duration} ms`;
        
        // Display response headers
        let headersHtml = '';
        response.headers.forEach((value, key) => {
            headersHtml += `<div><span class="font-semibold">${key}:</span> ${value}</div>`;
        });
        
        if (headersHtml) {
            responseHeaders.innerHTML = headersHtml;
            responseHeaders.classList.remove('hidden');
        }
        
        // Display response body
        let responseData;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
            responseBody.textContent = JSON.stringify(responseData, null, 2);
            // Apply syntax highlighting
            responseBody.innerHTML = formatJson(responseBody.textContent);
        } else {
            responseData = await response.text();
            responseBody.textContent = responseData;
        }
        
        // Add to request history
        addToHistory({
            timestamp: new Date(),
            method,
            url,
            status: response.status,
            duration,
            requestHeaders: Object.fromEntries([...headers.entries()]),
            requestBody: requestBodyJson,
            responseHeaders: Object.fromEntries([...response.headers.entries()]),
            responseBody: responseData
        });
        
    } catch (error) {
        responseStatus.textContent = "Error";
        responseStatus.className = "px-2 py-1 text-xs rounded bg-red-100 text-red-800";
        responseTime.textContent = "-";
        responseBody.textContent = `Error: ${error.message}`;
        
        // Add to request history
        addToHistory({
            timestamp: new Date(),
            method,
            url,
            status: "Error",
            duration: Date.now() - startTime,
            requestHeaders: Object.fromEntries([...headers.entries()]),
            requestBody: requestBodyJson,
            error: error.message
        });
    } finally {
        sendRequestBtn.textContent = "Send Request";
        sendRequestBtn.disabled = false;
    }
}

// Add Header Row
function addHeaderRow() {
    const headerRow = document.createElement('div');
    headerRow.className = 'header-row flex mb-2';
    headerRow.innerHTML = `
        <input type="text" placeholder="Header name" class="header-name w-1/3 p-2 border rounded-l">
        <input type="text" placeholder="Header value" class="header-value w-2/3 p-2 border rounded-r">
        <button class="remove-header ml-2 text-red-500 hover:text-red-700">✕</button>
    `;
    
    // Add event listener to remove button
    headerRow.querySelector('.remove-header').addEventListener('click', function() {
        headerRow.remove();
    });
    
    headersContainer.appendChild(headerRow);
}

// Add to Request History
function addToHistory(requestData) {
    // Add to the beginning of the array
    requestHistory.unshift(requestData);
    
    // Keep max 50 requests
    if (requestHistory.length > 50) {
        requestHistory.pop();
    }
    
    // Save to localStorage
    localStorage.setItem('requestHistory', JSON.stringify(requestHistory));
    
    // Update the UI
    updateHistoryTable();
}

// Load Request History
function loadRequestHistory() {
    const storedHistory = localStorage.getItem('requestHistory');
    if (storedHistory) {
        try {
            requestHistory = JSON.parse(storedHistory);
            updateHistoryTable();
        } catch (error) {
            console.error("Error loading request history:", error);
            localStorage.removeItem('requestHistory');
            requestHistory = [];
        }
    }
}

// Update History Table
function updateHistoryTable() {
    recentRequestsTable.innerHTML = '';
    
    requestHistory.forEach((request, index) => {
        const row = document.createElement('tr');
        
        // Format timestamp
        const timestamp = new Date(request.timestamp);
        const formattedTime = timestamp.toLocaleTimeString();
        
        // Determine status class
        let statusClass = 'bg-gray-100 text-gray-800';
        if (typeof request.status === 'number') {
            if (request.status < 300) {
                statusClass = 'bg-green-100 text-green-800';
            } else if (request.status < 400) {
                statusClass = 'bg-yellow-100 text-yellow-800';
            } else {
                statusClass = 'bg-red-100 text-red-800';
            }
        } else {
            statusClass = 'bg-red-100 text-red-800';
        }
        
        // Create row HTML
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formattedTime}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    request.method === 'GET' ? 'bg-green-100 text-green-800' : 
                    request.method === 'POST' ? 'bg-blue-100 text-blue-800' : 
                    request.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' : 
                    request.method === 'DELETE' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'
                }">${request.method}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${request.url}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                    ${request.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${request.duration} ms</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button data-index="${index}" class="repeat-request text-blue-500 hover:text-blue-700 mr-2">Repeat</button>
                <button data-index="${index}" class="view-details text-green-500 hover:text-green-700">Details</button>
            </td>
        `;
        
        // Add event listeners
        row.querySelector('.repeat-request').addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            repeatRequest(index);
        });
        
        row.querySelector('.view-details').addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            viewRequestDetails(index);
        });
        
        recentRequestsTable.appendChild(row);
    });
}

// Repeat a request from history
function repeatRequest(index) {
    const request = requestHistory[index];
    if (!request) return;
    
    // Set the form values
    requestMethodSelect.value = request.method;
    requestUrlInput.value = request.url;
    
    // Set request body if exists
    if (request.requestBody) {
        requestBodyTextarea.value = JSON.stringify(request.requestBody, null, 2);
    } else {
        requestBodyTextarea.value = '';
    }
    
    // Clear existing headers
    headersContainer.innerHTML = '';
    
    // Add headers from the request
    if (request.requestHeaders) {
        Object.entries(request.requestHeaders).forEach(([name, value]) => {
            // Skip authorization header as it will be added automatically
            if (name.toLowerCase() !== 'authorization') {
                const headerRow = document.createElement('div');
                headerRow.className = 'header-row flex mb-2';
                headerRow.innerHTML = `
                    <input type="text" value="${name}" placeholder="Header name" class="header-name w-1/3 p-2 border rounded-l">
                    <input type="text" value="${value}" placeholder="Header value" class="header-value w-2/3 p-2 border rounded-r">
                    <button class="remove-header ml-2 text-red-500 hover:text-red-700">✕</button>
                `;
                
                // Add event listener to remove button
                headerRow.querySelector('.remove-header').addEventListener('click', function() {
                    headerRow.remove();
                });
                
                headersContainer.appendChild(headerRow);
            }
        });
    }
    
    // Scroll to the request form
    sendRequestBtn.scrollIntoView({ behavior: 'smooth' });
}

// View details of a request
function viewRequestDetails(index) {
    const request = requestHistory[index];
    if (!request) return;
    
    // Create a modal to show details
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50';
    
    // Format response for display
    let responseBodyText = '';
    if (request.responseBody) {
        if (typeof request.responseBody === 'object') {
            responseBodyText = JSON.stringify(request.responseBody, null, 2);
        } else {
            responseBodyText = request.responseBody;
        }
    } else if (request.error) {
        responseBodyText = `Error: ${request.error}`;
    } else {
        responseBodyText = 'No response body';
    }
    
    // Format request headers
    let requestHeadersHtml = '<div class="mb-2 font-semibold">Request Headers:</div>';
    if (request.requestHeaders) {
        for (const [name, value] of Object.entries(request.requestHeaders)) {
            requestHeadersHtml += `<div><span class="font-semibold">${name}:</span> ${value}</div>`;
        }
    } else {
        requestHeadersHtml += '<div>No request headers</div>';
    }
    
    // Format response headers
    let responseHeadersHtml = '<div class="mt-4 mb-2 font-semibold">Response Headers:</div>';
    if (request.responseHeaders) {
        for (const [name, value] of Object.entries(request.responseHeaders)) {
            responseHeadersHtml += `<div><span class="font-semibold">${name}:</span> ${value}</div>`;
        }
    } else {
        responseHeadersHtml += '<div>No response headers</div>';
    }
    
    // Modal content
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl p-6 w-11/12 md:w-3/4 lg:w-2/3 max-h-5/6 overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold text-gray-800">Request Details</h3>
                <button class="close-modal text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <p><span class="font-semibold">Time:</span> ${new Date(request.timestamp).toLocaleString()}</p>
                    <p><span class="font-semibold">Method:</span> ${request.method}</p>
                    <p><span class="font-semibold">URL:</span> ${request.url}</p>
                </div>
                <div>
                    <p><span class="font-semibold">Status:</span> ${request.status}</p>
                    <p><span class="font-semibold">Duration:</span> ${request.duration} ms</p>
                </div>
            </div>
            
            <div class="mb-4">
                <div class="bg-gray-100 p-3 rounded">
                    ${requestHeadersHtml}
                </div>
            </div>
            
            <div class="mb-4">
                <div class="mb-2 font-semibold">Request Body:</div>
                <pre class="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">${
                    request.requestBody ? JSON.stringify(request.requestBody, null, 2) : 'No request body'
                }</pre>
            </div>
            
            <div class="mb-4">
                <div class="bg-gray-100 p-3 rounded">
                    ${responseHeadersHtml}
                </div>
            </div>
            
            <div>
                <div class="mb-2 font-semibold">Response Body:</div>
                <pre class="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">${responseBodyText}</pre>
            </div>
            
            <div class="mt-6 flex justify-end">
                <button class="close-modal-btn bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                    Close
                </button>
            </div>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.close-modal-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Close when clicking outside the modal content
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Filter endpoints
function filterEndpoints() {
    const searchTerm = searchEndpointsInput.value.toLowerCase();
    const endpointCards = document.querySelectorAll('.endpoint-card');
    
    endpointCards.forEach(card => {
        const method = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        
        if (method.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Setup endpoint suggestions
function setupEndpointSuggestions() {
    // You can dynamically load endpoints from your API documentation or add them manually
    const commonEndpoints = [
        { method: 'GET', path: '/api/users', description: 'Get all users' },
        { method: 'GET', path: '/api/users/:id', description: 'Get user by ID' },
        { method: 'POST', path: '/api/users', description: 'Create new user' },
        { method: 'PUT', path: '/api/users/:id', description: 'Update user' },
        { method: 'DELETE', path: '/api/users/:id', description: 'Delete user' },
        { method: 'POST', path: '/api/auth/login', description: 'User login' },
        { method: 'POST', path: '/api/auth/register', description: 'User registration' },
        { method: 'GET', path: '/api/auth/verify', description: 'Verify token' },
        { method: 'POST', path: '/api/auth/refresh', description: 'Refresh token' },
        { method: 'GET', path: '/api/settings', description: 'Get application settings' },
        { method: 'GET', path: '/api/news', description: 'Get news articles' },
        { method: 'GET', path: '/api/stats', description: 'Get application stats' }
    ];
    
    // Clear existing endpoints
    endpointsList.innerHTML = '';
    
    // Add endpoints to the list
    commonEndpoints.forEach(endpoint => {
        const card = document.createElement('div');
        card.className = 'endpoint-card p-4 border rounded hover:bg-gray-50 cursor-pointer';
        card.innerHTML = `
            <h3 class="font-medium">${endpoint.method} ${endpoint.path}</h3>
            <p class="text-sm text-gray-500">${endpoint.description}</p>
        `;
        
        // Add click event to populate the request form
        card.addEventListener('click', function() {
            requestMethodSelect.value = endpoint.method;
            requestUrlInput.value = endpoint.path;
            
            // If it's a path with a parameter, add a sample request body
            if (endpoint.method === 'POST' || endpoint.method === 'PUT') {
                if (endpoint.path.includes('/api/users')) {
                    requestBodyTextarea.value = JSON.stringify({
                        username: "johndoe",
                        email: "john.doe@example.com",
                        firstName: "John",
                        lastName: "Doe"
                    }, null, 2);
                } else if (endpoint.path.includes('/api/auth/login')) {
                    requestBodyTextarea.value = JSON.stringify({
                        username: "johndoe",
                        password: "password123"
                    }, null, 2);
                } else if (endpoint.path.includes('/api/auth/register')) {
                    requestBodyTextarea.value = JSON.stringify({
                        username: "johndoe",
                        email: "john.doe@example.com",
                        password: "password123"
                    }, null, 2);
                }
            } else {
                requestBodyTextarea.value = '';
            }
            
            // Scroll to the request form
            sendRequestBtn.scrollIntoView({ behavior: 'smooth' });
        });
        
        endpointsList.appendChild(card);
    });
}

// Format JSON with syntax highlighting
function formatJson(jsonString) {
    if (!jsonString) return '';
    
    // Replace special characters for HTML safety
    jsonString = jsonString.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Add color classes based on token type
    return jsonString
        .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            let cls = 'json-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'json-key';
                } else {
                    cls = 'json-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
}

// Start the dashboard when the page loads
document.addEventListener('DOMContentLoaded', initDashboard); 