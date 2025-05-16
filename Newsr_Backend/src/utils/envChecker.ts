export function checkEnvironmentVariables() {
  const requiredVars = [
    'NODE_ENV',
    'PORT',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
    'DASHBOARD_USERNAME',
    'DASHBOARD_PASSWORD'
  ];
  
  const optionalVars = [
    'LOG_LEVEL',
    'CORS_ORIGIN',
    'API_RATE_LIMIT'
  ];
  
  const results = {
    required: {} as Record<string, { set: boolean, value?: string }>,
    optional: {} as Record<string, { set: boolean, value?: string }>,
    summary: {
      requiredCount: 0,
      requiredMissing: 0,
      optionalCount: 0,
      optionalSet: 0
    }
  };
  
  // Check required vars
  requiredVars.forEach(varName => {
    const isSet = typeof process.env[varName] !== 'undefined';
    results.required[varName] = {
      set: isSet,
      value: isSet ? maskValue(varName, process.env[varName] as string) : undefined
    };
    
    results.summary.requiredCount++;
    if (!isSet) results.summary.requiredMissing++;
  });
  
  // Check optional vars
  optionalVars.forEach(varName => {
    const isSet = typeof process.env[varName] !== 'undefined';
    results.optional[varName] = {
      set: isSet,
      value: isSet ? maskValue(varName, process.env[varName] as string) : undefined
    };
    
    results.summary.optionalCount++;
    if (isSet) results.summary.optionalSet++;
  });
  
  return results;
}

// Mask sensitive values
function maskValue(name: string, value: string): string {
  // List of env vars that contain sensitive information
  const sensitiveVars = [
    'PASSWORD', 'KEY', 'SECRET', 'TOKEN', 'AUTH'
  ];
  
  // Check if this variable contains sensitive information
  const isSensitive = sensitiveVars.some(term => 
    name.toUpperCase().includes(term)
  );
  
  if (isSensitive) {
    // Show first 3 characters then mask the rest
    return value.length > 6 
      ? `${value.substring(0, 3)}${'*'.repeat(value.length - 3)}`
      : '******';
  }
  
  return value;
} 