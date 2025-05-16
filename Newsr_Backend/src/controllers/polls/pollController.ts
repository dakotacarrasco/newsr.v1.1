import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../services/supabase';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';

/**
 * Get all polls with optional filtering
 */
export const getPolls = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, active_only } = req.query;
    
    let query = supabase.from('polls').select('*');
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (active_only === 'true') {
      const now = new Date().toISOString();
      query = query.or(`end_date.gt.${now},end_date.is.null`);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      throw new AppError(error.message, 400);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        polls: data
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific poll by ID
 */
export const getPoll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('polls')
      .select('*, poll_options(*)')
      .eq('id', id)
      .single();
    
    if (error) {
      throw new AppError(error.message, 400);
    }
    
    if (!data) {
      throw new AppError('Poll not found', 404);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        poll: data
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new poll
 */
export const createPoll = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    
    const { question, options, category, end_date } = req.body;
    
    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      throw new AppError('Question and at least two options are required', 400);
    }
    
    // Create poll
    const { data, error } = await supabase
      .from('polls')
      .insert({
        question,
        category,
        end_date,
        created_by: req.user.id
      })
      .select()
      .single();
    
    if (error) {
      throw new AppError(error.message, 400);
    }
    
    // Add options
    const optionObjects = options.map(option => ({
      poll_id: data.id,
      option_text: option
    }));
    
    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionObjects);
    
    if (optionsError) {
      throw new AppError(optionsError.message, 400);
    }
    
    res.status(201).json({
      status: 'success',
      data: {
        poll: data
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Vote on a poll
 */
export const votePoll = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    
    const { id } = req.params;
    const { option_id } = req.body;
    
    if (!option_id) {
      throw new AppError('Option ID is required', 400);
    }
    
    // Check if poll exists and is still active
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('end_date')
      .eq('id', id)
      .single();
    
    if (pollError || !poll) {
      throw new AppError('Poll not found', 404);
    }
    
    if (poll.end_date && new Date(poll.end_date) < new Date()) {
      throw new AppError('This poll has ended', 400);
    }
    
    // Check if user has already voted
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', id)
      .eq('user_id', req.user.id)
      .single();
    
    if (existingVote) {
      // Update existing vote
      const { data, error } = await supabase
        .from('poll_votes')
        .update({ option_id })
        .eq('id', existingVote.id)
        .select();
      
      if (error) {
        throw new AppError(error.message, 400);
      }
      
      res.status(200).json({
        status: 'success',
        message: 'Vote updated successfully',
        data: { vote: data }
      });
    } else {
      // Create new vote
      const { data, error } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: id,
          option_id,
          user_id: req.user.id
        })
        .select();
      
      if (error) {
        throw new AppError(error.message, 400);
      }
      
      res.status(201).json({
        status: 'success',
        message: 'Vote recorded successfully',
        data: { vote: data }
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a poll
 */
export const deletePoll = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    
    const { id } = req.params;
    
    // Check if poll exists and belongs to user
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('created_by')
      .eq('id', id)
      .single();
    
    if (pollError || !poll) {
      throw new AppError('Poll not found', 404);
    }
    
    if (poll.created_by !== req.user.id) {
      throw new AppError('You can only delete your own polls', 403);
    }
    
    // Delete the poll
    const { error } = await supabase
      .from('polls')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new AppError(error.message, 400);
    }
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};