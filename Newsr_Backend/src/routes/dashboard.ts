import express, { Request, Response } from 'express';
import os from 'os';
import { supabase } from '../config/supabaseClient';

const router = express.Router();

// Track request statistics
interface RequestStat {
  path: string;
  method: string;
  status: number;
  timestamp: Date;
}

interface RequestStats {
  total: number;
  endpoints: { [key: string]: number };
  lastRequests: RequestStat[];
}

const requestStats: RequestStats = {
  total: 0,
  endpoints: {},
  lastRequests: []
};

// Middleware to track requests
router.use((req: Request, res: Response, next) => {
  const originalSend = res.send;
  
  res.send = function(body) {
    const stat: RequestStat = {
      path: req.path,
      method: req.method,
      status: res.statusCode,
      timestamp: new Date()
    };
    
    requestStats.total++;
    
    // Track endpoint usage
    const endpoint = `${req.method} ${req.path}`;
    requestStats.endpoints[endpoint] = (requestStats.endpoints[endpoint] || 0) + 1;
    
    // Add to recent requests (keep last 100)
    requestStats.lastRequests.unshift(stat);
    if (requestStats.lastRequests.length > 100) {
      requestStats.lastRequests.pop();
    }
    
    return originalSend.call(this, body);
  };
  
  next();
});

// Dashboard home route
router.get('/', async (req: Request, res: Response) => {
  // System information
  const totalMemory = Math.round(os.totalmem() / (1024 * 1024 * 1024) * 100) / 100; // GB
  const freeMemory = Math.round(os.freemem() / (1024 * 1024 * 1024) * 100) / 100; // GB
  const usedMemoryPercent = ((totalMemory - freeMemory) / totalMemory) * 100;
  
  // Get user stats from Supabase if available
  let userStats = {
    total: 0,
    active: 0,
    newToday: 0
  };
  
  try {
    const { count } = await supabase.from('users').select('*', { count: 'exact', head: true });
    userStats.total = count || 0;
    
    // Active users in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: activeUsers } = await supabase
      .from('user_activity')
      .select('user_id')
      .gte('created_at', sevenDaysAgo.toISOString());
      
    if (activeUsers) {
      // Count unique user IDs
      const uniqueUserIds = new Set(activeUsers.map(u => u.user_id));
      userStats.active = uniqueUserIds.size;
    }
    
    // New users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: newToday } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());
      
    userStats.newToday = newToday || 0;
  } catch (error) {
    console.error('Error fetching user stats:', error);
  }
  
  // Recent authentication events
  let recentAuthEvents: Array<{
    id: string;
    user_id: string;
    event_type: string;
    ip_address: string;
    created_at: string;
    user_email?: string;
  }> = [];
  
  try {
    // Get recent auth events
    const { data: authEvents } = await supabase
      .from('auth_events')
      .select('*, users(email)')
      .order('created_at', { ascending: false })
      .limit(10);
      
    recentAuthEvents = authEvents || [];
  } catch (error) {
    console.error('Error fetching auth events:', error);
    recentAuthEvents = [];
  }
  
  // Render dashboard HTML
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admin Dashboard</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    </head>
    <body class="bg-gray-100 min-h-screen">
      <nav class="bg-indigo-600 text-white px-6 py-3">
        <div class="flex justify-between items-center">
          <h1 class="text-xl font-bold">Admin Dashboard</h1>
          <div class="flex space-x-4">
            <a href="/dashboard" class="hover:underline">Overview</a>
            <a href="/dashboard/users" class="hover:underline">Users</a>
            <a href="/dashboard/auth" class="hover:underline">Authentication</a>
            <a href="/dashboard/api" class="hover:underline">API Monitor</a>
          </div>
        </div>
      </nav>
      
      <div class="container mx-auto px-4 py-8">
        <!-- Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-sm font-medium text-gray-500">Total Users</h2>
            <p class="text-3xl font-bold">${userStats.total.toLocaleString()}</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-sm font-medium text-gray-500">Active Users (7d)</h2>
            <p class="text-3xl font-bold">${userStats.active.toLocaleString()}</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-sm font-medium text-gray-500">New Users Today</h2>
            <p class="text-3xl font-bold">${userStats.newToday.toLocaleString()}</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-sm font-medium text-gray-500">API Requests</h2>
            <p class="text-3xl font-bold">${requestStats.total.toLocaleString()}</p>
          </div>
        </div>
        
        <!-- System Information -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">System Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div class="mb-4">
                <p class="text-sm font-medium text-gray-500">Server Uptime</p>
                <p class="text-xl font-semibold uptime-value">${formatUptime(process.uptime())}</p>
              </div>
              
              <div class="mb-4">
                <p class="text-sm font-medium text-gray-500">Memory Usage</p>
                <p class="text-xl font-semibold memory-usage">${Math.round((totalMemory - freeMemory) * 100) / 100} GB / ${totalMemory} GB</p>
                <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div class="bg-blue-600 h-2.5 rounded-full memory-bar" style="width: ${usedMemoryPercent}%"></div>
                </div>
              </div>
              
              <div>
                <p class="text-sm font-medium text-gray-500">CPU Load</p>
                <p class="text-xl font-semibold">${os.loadavg()[0].toFixed(2)}</p>
              </div>
            </div>
            
            <div>
              <div class="mb-4">
                <p class="text-sm font-medium text-gray-500">Node.js Version</p>
                <p class="text-xl font-semibold">${process.version}</p>
              </div>
              
              <div class="mb-4">
                <p class="text-sm font-medium text-gray-500">Platform</p>
                <p class="text-xl font-semibold">${os.platform()} (${os.arch()})</p>
              </div>
              
              <div>
                <p class="text-sm font-medium text-gray-500">Environment</p>
                <p class="text-xl font-semibold">${process.env.NODE_ENV || 'development'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Recent Authentication Activity -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Recent Authentication Activity</h2>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${recentAuthEvents.map(event => `
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${new Date(event.created_at).toLocaleString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        event.event_type === 'login' ? 'bg-green-100 text-green-800' : 
                        event.event_type === 'register' ? 'bg-blue-100 text-blue-800' : 
                        event.event_type === 'password_reset' ? 'bg-yellow-100 text-yellow-800' : 
                        event.event_type === 'logout' ? 'bg-gray-100 text-gray-800' : 
                        'bg-gray-100 text-gray-800'
                      }">
                        ${event.event_type.toUpperCase().replace('_', ' ')}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${event.user_id.substring(0, 8)}...
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${event.ip_address}
                    </td>
                  </tr>
                `).join('')}
                ${recentAuthEvents.length === 0 ? `
                  <tr>
                    <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
                      No recent authentication events
                    </td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- API Request Activity -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">API Request Activity</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Recent Requests Table -->
            <div>
              <h3 class="text-lg font-medium text-gray-700 mb-2">Recent Requests</h3>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Path</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200" id="recent-requests-table">
                    ${requestStats.lastRequests.slice(0, 5).map(req => `
                      <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${new Date(req.timestamp).toLocaleTimeString()}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            req.method === 'GET' ? 'bg-green-100 text-green-800' : 
                            req.method === 'POST' ? 'bg-blue-100 text-blue-800' : 
                            req.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' : 
                            req.method === 'DELETE' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }">
                            ${req.method}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${req.path}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            req.status < 300 ? 'bg-green-100 text-green-800' : 
                            req.status < 400 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }">
                            ${req.status}
                          </span>
                        </td>
                      </tr>
                    `).join('')}
                    ${requestStats.lastRequests.length === 0 ? `
                      <tr>
                        <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
                          No recent requests
                        </td>
                      </tr>
                    ` : ''}
                  </tbody>
                </table>
              </div>
            </div>
            
            <!-- Top Endpoints Chart -->
            <div>
              <h3 class="text-lg font-medium text-gray-700 mb-2">Top Endpoints</h3>
              <canvas id="endpointsChart" height="280"></canvas>
            </div>
          </div>
        </div>
      </div>
      
      <script>
        // Initialize charts
        document.addEventListener('DOMContentLoaded', function() {
          // Top endpoints chart
          const endpointLabels = [];
          const endpointData = [];
          
          // Get top 5 endpoints
          const endpoints = ${JSON.stringify(Object.entries(requestStats.endpoints)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5))};
            
          endpoints.forEach(([endpoint, count]) => {
            endpointLabels.push(endpoint);
            endpointData.push(count);
          });
          
          const endpointsCtx = document.getElementById('endpointsChart').getContext('2d');
          new Chart(endpointsCtx, {
            type: 'bar',
            data: {
              labels: endpointLabels,
              datasets: [{
                label: 'Request Count',
                data: endpointData,
                backgroundColor: 'rgba(79, 70, 229, 0.8)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 1
              }]
            },
            options: {
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
          });
          
          // Update system info every 10 seconds
          setInterval(updateSystemInfo, 10000);
        });
        
        // Function to update system info
        function updateSystemInfo() {
          fetch('/dashboard/system-info')
            .then(response => response.json())
            .then(data => {
              document.querySelector('.uptime-value').textContent = formatUptime(data.uptime);
              document.querySelector('.memory-usage').textContent = 
                \`\${data.memory.used} GB / \${data.memory.total} GB\`;
              
              const usedPercent = (data.memory.used / data.memory.total) * 100;
              document.querySelector('.memory-bar').style.width = \`\${usedPercent}%\`;
            })
            .catch(error => console.error('Error updating system info:', error));
        }
        
        // Format uptime
        function formatUptime(seconds: number): string {
          const days = Math.floor(seconds / 86400);
          const hours = Math.floor((seconds % 86400) / 3600);
          const minutes = Math.floor((seconds % 3600) / 60);
          const secs = Math.floor(seconds % 60);
          
          return \`\${days}d \${hours}h \${minutes}m \${secs}s\`;
        }
      </script>
    </body>
    </html>
  `;
  
  res.send(html);
});

// API to get system info for real-time updates
router.get('/system-info', (req: Request, res: Response) => {
  const totalMemory = Math.round(os.totalmem() / (1024 * 1024 * 1024) * 100) / 100; // GB
  const freeMemory = Math.round(os.freemem() / (1024 * 1024 * 1024) * 100) / 100; // GB
  const usedMemory = Math.round((totalMemory - freeMemory) * 100) / 100;
  
  res.json({
    uptime: process.uptime(),
    memory: {
      total: totalMemory,
      free: freeMemory,
      used: usedMemory
    },
    cpu: {
      load: os.loadavg(),
      cores: os.cpus().length
    }
  });
});

// Helper function to format uptime
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

// API Monitor Dashboard
router.get('/api', async (req: Request, res: Response) => {
  // Get API endpoint statistics
  const endpointStats = Object.entries(requestStats.endpoints)
    .map(([endpoint, count]) => ({ endpoint, count }))
    .sort((a, b) => b.count - a.count);
  
  // Calculate response time statistics
  const responseTimeStats = {
    avg: 0,
    min: 0,
    max: 0,
    p95: 0
  };
  
  // Calculate error rate
  const totalRequests = requestStats.total || 1; // Avoid division by zero
  const errorRequests = requestStats.lastRequests.filter(req => req.status >= 400).length;
  const errorRate = (errorRequests / totalRequests) * 100;
  
  // Render the API monitor dashboard
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Monitor</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    </head>
    <body class="bg-gray-100 min-h-screen">
      <nav class="bg-indigo-600 text-white px-6 py-3">
        <div class="flex justify-between items-center">
          <h1 class="text-xl font-bold">Admin Dashboard</h1>
          <div class="flex space-x-4">
            <a href="/dashboard" class="hover:underline">Overview</a>
            <a href="/dashboard/users" class="hover:underline">Users</a>
            <a href="/dashboard/auth" class="hover:underline">Authentication</a>
            <a href="/dashboard/api" class="hover:underline font-bold">API Monitor</a>
          </div>
        </div>
      </nav>
      
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">API Monitor</h1>
        
        <!-- API Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-sm font-medium text-gray-500">Total Requests</h2>
            <p class="text-3xl font-bold">${requestStats.total.toLocaleString()}</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-sm font-medium text-gray-500">Unique Endpoints</h2>
            <p class="text-3xl font-bold">${Object.keys(requestStats.endpoints).length.toLocaleString()}</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-sm font-medium text-gray-500">Avg Response Time</h2>
            <p class="text-3xl font-bold">${responseTimeStats.avg.toFixed(2)} ms</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-sm font-medium text-gray-500">Error Rate</h2>
            <p class="text-3xl font-bold ${errorRate > 5 ? 'text-red-600' : 'text-green-600'}">${errorRate.toFixed(2)}%</p>
          </div>
        </div>
        
        <!-- API Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Top Endpoints Chart -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Top Endpoints</h2>
            <canvas id="topEndpointsChart" height="300"></canvas>
          </div>
          
          <!-- Request Methods Chart -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Request Methods</h2>
            <canvas id="requestMethodsChart" height="300"></canvas>
          </div>
        </div>
        
        <!-- API Health Check -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-800">API Health Check</h2>
            <button id="refresh-health" class="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Refresh Now
            </button>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Checked</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200" id="health-check-table">
                <!-- Health check data will be populated by JavaScript -->
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">GET /api/auth/user</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">UP</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">120 ms</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Just now</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Recent Requests -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Recent Requests</h2>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${requestStats.lastRequests.slice(0, 10).map(req => `
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${new Date(req.timestamp).toLocaleTimeString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        req.method === 'GET' ? 'bg-green-100 text-green-800' : 
                        req.method === 'POST' ? 'bg-blue-100 text-blue-800' : 
                        req.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' : 
                        req.method === 'DELETE' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }">
                        ${req.method}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${req.path}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        req.status < 300 ? 'bg-green-100 text-green-800' : 
                        req.status < 400 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }">
                        ${req.status}
                      </span>
                    </td>
                  </tr>
                `).join('')}
                ${requestStats.lastRequests.length === 0 ? `
                  <tr>
                    <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
                      No recent requests
                    </td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          // Top Endpoints Chart
          const endpointLabels = [];
          const endpointData = [];
          
          ${JSON.stringify(endpointStats.slice(0, 5)).replace(/^\[|\]$/g, '')}
            .forEach(item => {
              endpointLabels.push(item.endpoint);
              endpointData.push(item.count);
            });
          
          const topEndpointsCtx = document.getElementById('topEndpointsChart').getContext('2d');
          new Chart(topEndpointsCtx, {
            type: 'bar',
            data: {
              labels: endpointLabels,
              datasets: [{
                label: 'Request Count',
                data: endpointData,
                backgroundColor: 'rgba(79, 70, 229, 0.8)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 1
              }]
            },
            options: {
              indexAxis: 'y',
              scales: {
                x: {
                  beginAtZero: true
                }
              }
            }
          });
          
          // Request Methods Chart
          const methodCounts = {
            GET: 0,
            POST: 0,
            PUT: 0,
            DELETE: 0,
            OTHER: 0
          };
          
          // Count methods from recent requests
          ${JSON.stringify(requestStats.lastRequests).replace(/^\[|\]$/g, '')}
            .forEach(req => {
              if (methodCounts[req.method]) {
                methodCounts[req.method]++;
              } else {
                methodCounts.OTHER++;
              }
            });
          
          const requestMethodsCtx = document.getElementById('requestMethodsChart').getContext('2d');
          new Chart(requestMethodsCtx, {
            type: 'doughnut',
            data: {
              labels: Object.keys(methodCounts),
              datasets: [{
                data: Object.values(methodCounts),
                backgroundColor: [
                  'rgba(34, 197, 94, 0.8)',
                  'rgba(59, 130, 246, 0.8)',
                  'rgba(250, 204, 21, 0.8)',
                  'rgba(239, 68, 68, 0.8)',
                  'rgba(156, 163, 175, 0.8)'
                ],
                borderColor: [
                  'rgb(34, 197, 94)',
                  'rgb(59, 130, 246)',
                  'rgb(250, 204, 21)',
                  'rgb(239, 68, 68)',
                  'rgb(156, 163, 175)'
                ],
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                }
              }
            }
          });
          
          // Handle refresh health check button
          document.getElementById('refresh-health').addEventListener('click', async () => {
            const button = document.getElementById('refresh-health');
            button.textContent = 'Checking...';
            button.disabled = true;
            
            try {
              const response = await fetch('/dashboard/api/health-check');
              const data = await response.json();
              
              // Update the table
              const tbody = document.getElementById('health-check-table');
              tbody.innerHTML = '';
              
              data.endpoints.forEach(endpoint => {
                const row = document.createElement('tr');
                
                const methodCell = document.createElement('td');
                methodCell.className = 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900';
                methodCell.textContent = \`\${endpoint.method} \${endpoint.path}\`;
                
                const statusCell = document.createElement('td');
                statusCell.className = 'px-6 py-4 whitespace-nowrap text-sm';
                
                const statusSpan = document.createElement('span');
                statusSpan.className = \`px-2 inline-flex text-xs leading-5 font-semibold rounded-full \${
                  endpoint.status === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }\`;
                statusSpan.textContent = endpoint.status.toUpperCase();
                
                statusCell.appendChild(statusSpan);
                
                const timeCell = document.createElement('td');
                timeCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
                timeCell.textContent = \`\${endpoint.responseTime} ms\`;
                
                const dateCell = document.createElement('td');
                dateCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
                dateCell.textContent = new Date(endpoint.lastChecked).toLocaleTimeString();
                
                row.appendChild(methodCell);
                row.appendChild(statusCell);
                row.appendChild(timeCell);
                row.appendChild(dateCell);
                
                tbody.appendChild(row);
              });
            } catch (error) {
              console.error('Error checking endpoints:', error);
              alert('Error checking endpoints. Please try again.');
            } finally {
              button.textContent = 'Refresh Now';
              button.disabled = false;
            }
          });
        });
      </script>
    </body>
    </html>
  `;
  
  res.send(html);
});

// API Health Check endpoint
router.get('/api/health-check', async (req: Request, res: Response) => {
  // In a real app, you would check the health of your API endpoints
  // For now, we'll return mock data
  const endpoints = [
    {
      method: 'GET',
      path: '/api/auth/user',
      status: 'up',
      responseTime: 120,
      lastChecked: new Date()
    },
    {
      method: 'POST',
      path: '/api/auth/login',
      status: 'up',
      responseTime: 150,
      lastChecked: new Date()
    },
    {
      method: 'GET',
      path: '/api/users',
      status: 'up',
      responseTime: 200,
      lastChecked: new Date()
    },
    {
      method: 'POST',
      path: '/api/users',
      status: 'up',
      responseTime: 180,
      lastChecked: new Date()
    },
    {
      method: 'GET',
      path: '/api/news',
      status: 'up',
      responseTime: 250,
      lastChecked: new Date()
    }
  ];
  
  res.json({
    success: true,
    endpoints
  });
});

export default router; 