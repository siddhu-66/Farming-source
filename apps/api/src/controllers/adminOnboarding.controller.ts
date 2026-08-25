import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const completeAdminOnboarding = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { 
      profile,
      security,
      preferences,
      notifications
    } = req.body;

    // 1. Check if user is actually an admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Only admin users can complete this onboarding flow.' });
    }

    // 2. Insert or update Admin Profile
    let adminId: string;
    
    const { data: existingProfile } = await supabase
      .from('admin_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      adminId = existingProfile.id;
      const { error: profileError } = await supabase
        .from('admin_profiles')
        .update({
          full_name: profile.fullName,
          employee_id: profile.employeeId || null,
          designation: profile.designation,
          department: profile.department || null,
          official_email: profile.officialEmail,
          phone: profile.phone,
          profile_photo_url: profile.profilePhotoUrl || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', adminId);

      if (profileError) throw profileError;
    } else {
      const { data: profileData, error: profileError } = await supabase
        .from('admin_profiles')
        .insert([{
          user_id: userId,
          full_name: profile.fullName,
          employee_id: profile.employeeId || null,
          designation: profile.designation,
          department: profile.department || null,
          official_email: profile.officialEmail,
          phone: profile.phone,
          profile_photo_url: profile.profilePhotoUrl || null,
        }])
        .select()
        .single();
        
      if (profileError) throw profileError;
      adminId = profileData.id;
    }

    // 3. Process Security Configuration
    if (security) {
      await supabase.from('admin_security').delete().eq('admin_id', adminId);
      
      const { error: securityError } = await supabase
        .from('admin_security')
        .insert([{
          admin_id: adminId,
          mfa_method: security.mfaMethod || 'NONE',
          recovery_email: security.recoveryEmail || null,
          recovery_mobile: security.recoveryMobile || null,
          session_timeout_minutes: security.sessionTimeoutMinutes || 30,
          remember_browser: security.rememberBrowser || false
        }]);

      if (securityError) throw securityError;
    }

    // 4. Process Workspace Preferences
    if (preferences) {
      await supabase.from('admin_preferences').delete().eq('admin_id', adminId);
      
      const { error: prefError } = await supabase
        .from('admin_preferences')
        .insert([{
          admin_id: adminId,
          theme: preferences.theme || 'System',
          dashboard_layout: preferences.dashboardLayout || 'Analytics Focus',
          default_landing_page: preferences.defaultLandingPage || 'Dashboard'
        }]);

      if (prefError) throw prefError;
    }

    // 5. Process Notifications
    if (notifications) {
      await supabase.from('admin_notification_preferences').delete().eq('admin_id', adminId);
      
      const { error: notifError } = await supabase
        .from('admin_notification_preferences')
        .insert([{
          admin_id: adminId,
          new_user_registrations: notifications.newUserRegistrations ?? true,
          reported_content: notifications.reportedContent ?? true,
          failed_verifications: notifications.failedVerifications ?? true,
          security_events: notifications.securityEvents ?? true,
          platform_errors: notifications.platformErrors ?? true,
          server_health: notifications.serverHealth ?? true,
          scheme_updates: notifications.schemeUpdates ?? false,
          system_announcements: notifications.systemAnnouncements ?? true
        }]);

      if (notifError) throw notifError;
    }

    // 6. Mark onboarding as complete in the users table
    const { error: onboardingError } = await supabase
      .from('users')
      .update({
        onboarding_status: 'COMPLETED',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (onboardingError) throw onboardingError;

    return res.status(200).json({
      success: true,
      message: 'Admin onboarding completed successfully.',
      data: { adminId }
    });

  } catch (error: any) {
    console.error('Admin Onboarding Error:', error.message || error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete admin onboarding',
      error: error.message || error
    });
  }
};
