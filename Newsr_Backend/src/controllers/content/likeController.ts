import { Request, Response, NextFunction } from 'express';
import { supabase } from '../services/supabase';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

/**
 * Toggle like status for an article
 * If the user has already liked the article, it will unlike it
 * If the user hasn't liked the article, it will like it
 */
export const toggleArticleLike = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    
    const { articleId } = req.params;
    const userId = req.user.id;
    
    // Call the Supabase function to toggle like
    const { data, error } = await supabase.rpc('toggle_article_like', {
      p_user_id: userId,
      p_article_id: articleId
    });
    
    if (error) {
      throw new AppError(error.message, 400);
    }
    
    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if a user has liked an article
 */
export const checkArticleLike = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    
    const { articleId } = req.params;
    const userId = req.user.id;
    
    // Check if like exists
    const { data, error } = await supabase
      .from('article_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('article_id', articleId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      throw new AppError(error.message, 400);
    }
    
    // Get article like count
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('likes')
      .eq('id', articleId)
      .single();
    
    if (articleError) {
      throw new AppError(articleError.message, 400);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        liked: !!data,
        likes: article?.likes || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get articles liked by the current user
 */
export const getLikedArticles = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    
    // Calculate pagination
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;
    
    // Get liked articles
    const { data, error, count } = await supabase
      .from('article_likes')
      .select('article_id, articles(*)', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      throw new AppError(error.message, 400);
    }
    
    // Format response
    const articles = data?.map(item => item.articles) || [];
    
    res.status(200).json({
      status: 'success',
      results: count || 0,
      data: {
        articles
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        pages: count ? Math.ceil(count / Number(limit)) : 0
      }
    });
  } catch (error) {
    next(error);
  }
}; 