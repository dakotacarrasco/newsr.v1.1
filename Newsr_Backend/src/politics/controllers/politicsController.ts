import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { spawn } from 'child_process';
import path from 'path';
import { PoliticalArticle, PoliticalPoll, PoliticalPollOption } from '../models/schema';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Political Articles Controllers
export const getAllPoliticalArticles = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('political_articles')
      .select('*')
      .order('publishedAt', { ascending: false });
      
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching political articles:', error);
    res.status(500).json({ error: 'Failed to fetch political articles' });
  }
};

export const getPoliticalArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('political_articles')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Article not found' });
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching political article:', error);
    res.status(500).json({ error: 'Failed to fetch political article' });
  }
};

export const createPoliticalArticle = async (req: Request, res: Response) => {
  try {
    const articleData: Partial<PoliticalArticle> = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      isAiGenerated: false
    };
    
    const { data, error } = await supabase
      .from('political_articles')
      .insert(articleData)
      .select();
      
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating political article:', error);
    res.status(500).json({ error: 'Failed to create political article' });
  }
};

export const updatePoliticalArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const { data, error } = await supabase
      .from('political_articles')
      .update(updateData)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    if (data.length === 0) return res.status(404).json({ error: 'Article not found' });
    
    res.status(200).json(data[0]);
  } catch (error) {
    console.error('Error updating political article:', error);
    res.status(500).json({ error: 'Failed to update political article' });
  }
};

export const deletePoliticalArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('political_articles')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    res.status(200).json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting political article:', error);
    res.status(500).json({ error: 'Failed to delete political article' });
  }
};

export const scrapeAndProcessPoliticalNews = async (req: Request, res: Response) => {
  try {
    // Use path.resolve for cross-platform compatibility
    const scriptPath = path.resolve(__dirname, '../scripts/scrape_political_news.py');
    
    console.log(`Executing Python script at: ${scriptPath}`);
    
    // On Windows, we need to explicitly use 'python' instead of 'python3'
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    
    const pythonProcess = spawn(pythonCommand, [scriptPath]);
    
    let outputData = '';
    let errorData = '';
    
    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
      console.log(`Python stdout: ${data}`);
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
      console.error(`Python stderr: ${data}`);
    });
    
    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
      
      if (code !== 0) {
        return res.status(500).json({ 
          error: 'Failed to scrape political news',
          details: errorData
        });
      }
      
      res.status(200).json({ 
        message: 'Political news scraped and processed successfully',
        details: outputData
      });
    });
  } catch (error) {
    console.error('Error running political news scraper:', error);
    res.status(500).json({ 
      error: 'Failed to run political news scraper',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

// Political Polls Controllers
export const getAllPolls = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('political_polls')
      .select('*')
      .order('createdAt', { ascending: false });
      
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching political polls:', error);
    res.status(500).json({ error: 'Failed to fetch political polls' });
  }
};

export const getPoll = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('political_polls')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Poll not found' });
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching political poll:', error);
    res.status(500).json({ error: 'Failed to fetch political poll' });
  }
};

export const createPoll = async (req: Request, res: Response) => {
  try {
    const pollData: Partial<PoliticalPoll> = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalVotes: 0
    };
    
    const { data, error } = await supabase
      .from('political_polls')
      .insert(pollData)
      .select();
      
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating political poll:', error);
    res.status(500).json({ error: 'Failed to create political poll' });
  }
};

export const updatePoll = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const { data, error } = await supabase
      .from('political_polls')
      .update(updateData)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    if (data.length === 0) return res.status(404).json({ error: 'Poll not found' });
    
    res.status(200).json(data[0]);
  } catch (error) {
    console.error('Error updating political poll:', error);
    res.status(500).json({ error: 'Failed to update political poll' });
  }
};

export const deletePoll = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('political_polls')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    res.status(200).json({ message: 'Poll deleted successfully' });
  } catch (error) {
    console.error('Error deleting political poll:', error);
    res.status(500).json({ error: 'Failed to delete political poll' });
  }
}; 