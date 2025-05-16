import fetch from 'node-fetch';

interface Endpoint {
  url: string;
  method: string;
  status: 'up' | 'down';
  responseTime?: number;
  lastChecked: Date;
}

class ApiHealthMonitor {
  private endpoints: Endpoint[] = [];
  
  constructor() {
    // Add some default endpoints to monitor
    this.addEndpoint('http://localhost:8000/auth/test', 'GET');
    this.addEndpoint('http://localhost:8000/auth/user', 'GET');
    this.addEndpoint('http://localhost:8000/', 'GET');
  }
  
  addEndpoint(url: string, method: string) {
    this.endpoints.push({
      url,
      method,
      status: 'down',
      lastChecked: new Date()
    });
  }
  
  async checkEndpoint(endpoint: Endpoint) {
    const startTime = Date.now();
    
    try {
      const response = await fetch(endpoint.url, { method: endpoint.method });
      const endTime = Date.now();
      
      endpoint.status = response.ok ? 'up' : 'down';
      endpoint.responseTime = endTime - startTime;
    } catch (error) {
      endpoint.status = 'down';
      endpoint.responseTime = undefined;
    }
    
    endpoint.lastChecked = new Date();
    return endpoint;
  }
  
  async checkAllEndpoints() {
    const promises = this.endpoints.map(endpoint => this.checkEndpoint(endpoint));
    await Promise.all(promises);
    return this.endpoints;
  }
  
  getStatus() {
    return this.endpoints;
  }
}

export const monitor = new ApiHealthMonitor(); 