import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

export async function getDirectoryStructure(
  startPath: string,
  options: {
    maxDepth?: number;
    ignore?: string[];
    extensions?: string[];
  } = {}
): Promise<FileNode> {
  const { 
    maxDepth = 4, 
    ignore = ['node_modules', '.git', 'dist'], 
    extensions = ['.ts', '.js', '.json'] 
  } = options;
  
  async function processDirectory(currentPath: string, depth: number = 0): Promise<FileNode> {
    const name = path.basename(currentPath);
    const relativePath = path.relative(startPath, currentPath);
    
    const stats = await stat(currentPath);
    
    if (!stats.isDirectory()) {
      return {
        name,
        path: relativePath || name,
        type: 'file'
      };
    }
    
    // Skip processing if max depth reached
    if (depth >= maxDepth) {
      return {
        name,
        path: relativePath || name,
        type: 'directory',
        children: []
      };
    }
    
    try {
      const files = await readdir(currentPath);
      const children = await Promise.all(
        files
          .filter(file => !ignore.includes(file))
          .filter(file => {
            const filePath = path.join(currentPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) return true;
            return extensions.some(ext => file.endsWith(ext));
          })
          .map(file => processDirectory(path.join(currentPath, file), depth + 1))
      );
      
      return {
        name,
        path: relativePath || name,
        type: 'directory',
        children
      };
    } catch (error) {
      console.error(`Error reading directory ${currentPath}:`, error);
      return {
        name,
        path: relativePath || name,
        type: 'directory',
        children: []
      };
    }
  }
  
  return processDirectory(startPath);
} 