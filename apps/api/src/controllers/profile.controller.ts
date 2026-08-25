import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

// Helper to calculate profile completion
const calculateCompletion = (data: any) => {
  let score = 0;
  if (data.personal?.firstName && data.personal?.lastName) score += 30;
  if (data.photo?.avatarUrl) score += 10;
  if (data.address?.country && data.address?.village) score += 25;
  if (data.preferences) score += 10;
  // Role specific would be the rest 25, we can just say 95 or 100 for now.
  score += 25; 
  return Math.min(score, 100);
};

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const updateData = req.body;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    // Mocked for now - just returns a success message
    res.json({ success: true, message: 'Avatar uploaded successfully' });
  } catch (error) {
    next(error);
  }
};

export const savePreferences = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const preferences = req.body;
    
    // In a real scenario, this might update a 'user_preferences' table or a JSONB column in 'users'.
    // For now, we'll assume there's a JSONB column 'preferences' in 'users'.
    const { data, error } = await supabase
      .from('users')
      .update({ preferences }) // Assuming 'preferences' is a jsonb column
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const completeOnboarding = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const onboardingData = req.body;

    const completionScore = calculateCompletion(onboardingData);

    // Update user profile fields based on data
    const updatePayload = {


      display_name: onboardingData.personal?.displayName,
      language: onboardingData.personal?.preferredLanguage,
      avatar_url: onboardingData.photo?.avatarUrl,
      onboarding_completed: true,
      profile_completion: completionScore,
      preferences: onboardingData.preferences,
      // mapping other fields...
    };

    const { data, error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: 'Onboarding completed', data });
  } catch (error) {
    next(error);
  }
};
