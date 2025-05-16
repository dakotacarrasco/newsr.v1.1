import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../services/supabase';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';

/**
 * Vote or change vote on a poll
 */
export const voteOrChangePoll = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    
    const { id } = req.params;
    const { option } = req.body;
    
    if (!option) {
      throw new AppError('Option is required', 400);
    }
    
    // Get current poll data to check if it has ended
    const { data: poll, error: fetchError } = await supabase
      .from('polls')
      .select('end_date')
      .eq('id', id)
      .single();
    
    if (fetchError || !poll) {
      throw new AppError('Poll not found', 404);
    }
    
    // Check if poll has ended
    if (poll.end_date && new Date(poll.end_date) < new Date()) {
      throw new AppError('This poll has ended', 400);
    }
    
    // Call the function to change vote
    const { data, error } = await supabase.rpc('change_poll_vote', {
      p_poll_id: id,
      p_user_id: req.user.id,
      p_new_option: option
    });
    
    if (error) {
      throw new AppError(error.message, 400);
    }
    
    // Get the updated poll with formatted results
    const results = Object.entries(data.options).map(([option, votes]) => {
      const percentage = data.total_votes > 0 
        ? Math.round((Number(votes) / data.total_votes) * 100) 
        : 0;
      
      return {
        option,
        votes,
        percentage
      };
    });
    
    // Sort by votes (highest first)
    results.sort((a, b) => Number(b.votes) - Number(a.votes));
    
    res.status(200).json({
      status: 'success',
      data: {
        poll_id: data.poll_id,
        total_votes: data.total_votes,
        user_vote: data.user_vote,
        results
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's current vote on a poll
 */
export const getUserPollVote = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    
    const { id } = req.params;
    
    // Get user's vote
    const { data, error } = await supabase
      .from('poll_votes')
      .select('option, created_at, updated_at, previous_option')
      .eq('poll_id', id)
      .eq('user_id', req.user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      throw new AppError(error.message, 400);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        hasVoted: !!data,
        vote: data || null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed poll results with user vote
 */
export const getDetailedPollResults = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Get the poll with its options and total votes
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('*')
      .eq('id', id)
      .single();
    
    if (pollError || !poll) {
      throw new AppError('Poll not found', 404);
    }
    
    // Calculate percentages for each option
    const results = Object.entries(poll.options).map(([option, votes]) => {
      const percentage = poll.total_votes > 0 
        ? Math.round((Number(votes) / poll.total_votes) * 100) 
        : 0;
      
      return {
        option,
        votes,
        percentage
      };
    });
    
    // Sort by votes (highest first)
    results.sort((a, b) => Number(b.votes) - Number(a.votes));
    
    // Get user's vote if authenticated
    let userVote = null;
    if (req.user) {
      const { data: voteData } = await supabase
        .from('poll_votes')
        .select('option')
        .eq('poll_id', id)
        .eq('user_id', req.user.id)
        .single();
      
      if (voteData) {
        userVote = voteData.option;
      }
    }
    
    // Get vote distribution by time (for charts)
    const { data: voteHistory, error: historyError } = await supabase
      .from('poll_votes')
      .select('option, created_at')
      .eq('poll_id', id)
      .order('created_at', { ascending: true });
    
    // Process vote history for time-based analysis
    const voteTimeline = voteHistory ? processVoteTimeline(voteHistory) : null;
    
    res.status(200).json({
      status: 'success',
      data: {
        poll: {
          id: poll.id,
          question: poll.question,
          category: poll.category,
          end_date: poll.end_date,
          created_at: poll.created_at,
          total_votes: poll.total_votes,
          results,
          user_vote: userVote,
          vote_timeline: voteTimeline
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to process vote timeline data
 */
function processVoteTimeline(voteHistory: any[]) {
  // Group votes by day
  const votesByDay: Record<string, Record<string, number>> = {};
  
  voteHistory.forEach(vote => {
    const date = new Date(vote.created_at).toISOString().split('T')[0];
    if (!votesByDay[date]) {
      votesByDay[date] = {};
    }
    
    if (!votesByDay[date][vote.option]) {
      votesByDay[date][vote.option] = 0;
    }
    
    votesByDay[date][vote.option]++;
  });
  
  // Convert to array format for frontend
  return Object.entries(votesByDay).map(([date, options]) => ({
    date,
    votes: options
  }));
} 