import os from 'os';

export function getSystemInfo() {
  return {
    os: {
      platform: os.platform(),
      release: os.release(),
      type: os.type(),
      arch: os.arch(),
      uptime: os.uptime(),
      loadAvg: os.loadavg(),
      totalMem: os.totalmem(),
      freeMem: os.freemem(),
      cpus: os.cpus().length
    },
    process: {
      version: process.version,
      versions: process.versions,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      pid: process.pid,
      title: process.title,
      execPath: process.execPath,
      cwd: process.cwd(),
      env: {
        NODE_ENV: process.env.NODE_ENV
      }
    }
  };
} 