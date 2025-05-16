import { Application } from 'express';
import path from 'path';

interface RouteInfo {
  path: string;
  methods: string[];
  middleware: string[];
}

// Add explicit type for layer parameter
interface Layer {
  route?: {
    path?: string;
    methods?: Record<string, boolean>;
    stack?: Array<{name?: string}>;
  };
  name?: string;
  handle?: {
    stack: any[];
  };
  regexp?: {
    source: string;
    fast_slash: boolean;
  };
}

export function getRegisteredRoutes(app: Application): RouteInfo[] {
  const routes: RouteInfo[] = [];
  
  // Get the registered routes
  const stack = (app._router && app._router.stack) || [];

  function processLayer(layer: Layer, basePath = '') {
    if (layer.route) {
      const route = layer.route;
      
      // Routes registered directly
      const routePath = basePath + (route.path || '');
      const methods = Object.keys(route.methods || {})
        .filter(method => route.methods?.[method])
        .map(method => method.toUpperCase());
      
      routes.push({
        path: routePath,
        methods,
        middleware: (route.stack || [])
          .filter((handler: {name?: string}) => handler.name !== '<anonymous>')
          .map((handler: {name?: string}) => handler.name || 'anonymous')
      });
    } else if (layer.name === 'router' && layer.handle?.stack) {
      // Router middleware
      const routerPath = layer.regexp?.source
        ? layer.regexp.source
            .replace('^\\/','/')
            .replace('(?=\\/|$)', '')
            .replace(/\\\//g, '/')
        : '';
      
      layer.handle.stack.forEach((stackItem: Layer) => {
        processLayer(stackItem, routerPath);
      });
    } else if (layer.name !== 'expressInit' && layer.name !== 'query') {
      // Global middleware that's not Express internal
      if (layer.regexp && layer.regexp.fast_slash === false) {
        const middlewarePath = layer.regexp.source
          .replace('^\\/','/')
          .replace('(?=\\/|$)', '')
          .replace(/\\\//g, '/');
        
        if (middlewarePath !== '(?:/|$)') {
          routes.push({
            path: middlewarePath,
            methods: ['ALL'],
            middleware: [layer.name || 'anonymous']
          });
        }
      }
    }
  }

  stack.forEach((layer: Layer) => processLayer(layer));
  
  // Sort routes by path
  return routes.sort((a, b) => a.path.localeCompare(b.path));
} 