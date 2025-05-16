import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../services/supabase';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';
import { GetArticlesParams } from '../../types';

export const getAllArticles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, limit = 10, offset = 0, search, location_id } = req.query;
    
    let query = supabase.from('articles').select('*', { count: 'exact' });
    
    // Apply filters if provided
    if (category) {
      query = query.eq('category', category);
    }
    
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }
    
    if (location_id) {
      query = query.eq('location_id', location_id);
    }
    
    const { data, error, count } = await query
      .order('published_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);
    
    if (error) {
      throw new AppError(error.message, 400);
    }
    
    res.status(200).json({
      status: 'success',
      results: data.length,
      totalCount: count,
      data: {
        articles: data
      },
      pagination: {
        offset: Number(offset),
        limit: Number(limit),
        total: count || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('articles')
      .select('*, users(name, avatar_url)')
      .eq('id', id)
      .single();
    
    if (error) {
      throw new AppError(error.message, 400);
    }
    
    if (!data) {
      throw new AppError('Article not found', 404);
    }
    
    // Update view count
    await supabase
      .rpc('increment_article_views', { article_id: id });
    
    res.status(200).json({
      status: 'success',
      data: {
        article: data
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createArticle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const author_id = req.user.id;
    const { title, content, description, category, keywords, image_url, location_id } = req.body;
    
    if (!title || !content || !category) {
      throw new AppError('Title, content and category are required', 400);
    }
    
    const { data, error } = await supabase
      .from('articles')
      .insert({
        title,
        content,
        description,
        category,
        author_id,
        keywords,
        image_url,
        location_id
      })
      .select()
      .single();
    
    if (error) {
      throw new AppError(error.message, 400);
    }
    
    res.status(201).json({
      status: 'success',
      data: {
        article: data
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateArticle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const author_id = req.user.id;
    const { id } = req.params;
    const { title, content, description, category, keywords, image_url, location_id } = req.body;
    
    // Check if article exists and belongs to user
    const { data: existingArticle, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      throw new AppError(fetchError.message, 400);
    }
    
    if (!existingArticle) {
      throw new AppError('Article not found', 404);
    }
    
    if (existingArticle.author_id !== author_id) {
      throw new AppError('You can only update your own articles', 403);
    }
    
    const { data, error } = await supabase
      .from('articles')
      .update({
        title,
        content,
        description,
        category,
        keywords,
        image_url,
        location_id
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new AppError(error.message, 400);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        article: data
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteArticle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const author_id = req.user.id;
    const { id } = req.params;
    
    // Check if article exists and belongs to user
    const { data: existingArticle, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      throw new AppError(fetchError.message, 400);
    }
    
    if (!existingArticle) {
      throw new AppError('Article not found', 404);
    }
    
    if (existingArticle.author_id !== author_id) {
      throw new AppError('You can only delete your own articles', 403);
    }
    
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new AppError(error.message, 400);
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
}; 