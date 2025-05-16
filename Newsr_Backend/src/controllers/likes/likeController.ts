import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../services/supabase';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';

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
 * Get likes for a specific article
 */
export const getArticleLikes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { articleId } = req.params;
    
    const { data, error, count } = await supabase
      .from('article_likes')
      .select('created_at, users:user_id(id, name, avatar_url)', { count: 'exact' })
      .eq('article_id', articleId);
    
    if (error) {
      throw new AppError(error.message, 400);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        likes: data || [],
        count: count || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user has liked an article
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
    
    const { data, error } = await supabase
      .from('article_likes')
      .select('id')
      .eq('article_id', articleId)
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" which is expected
      throw new AppError(error.message, 400);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        liked: !!data
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get articles liked by current user
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
    
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('article_likes')
      .select('articles:article_id(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new AppError(error.message, 400);
    }
    
    // Transform response to extract articles
    const articles = data?.map(item => item.articles) || [];
    
    res.status(200).json({
      status: 'success',
      data: {
        articles
      }
    });
  } catch (error) {
    next(error);
  }
};
