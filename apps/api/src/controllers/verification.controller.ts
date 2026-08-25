import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

// @desc    Get all verification requests (Admin only)
export const getVerificationQueue = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { status, role } = req.query;

    let query = supabase
      .from('verification_requests')
      .select(`
        *,
        users:user_id (email, phone, status)
      `)
      .order('submitted_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    
    if (role) {
      query = query.eq('role', role);
    }

    const { data, error } = await query;

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: data.length,
      data
    });

  } catch (error: any) {
    console.error('Get Verification Queue Error:', error.message || error);
    return res.status(500).json({ success: false, message: 'Server error fetching verification queue' });
  }
};

// @desc    Get details of a single verification request
export const getVerificationRequest = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { requestId } = req.params;

    const { data: request, error: requestError } = await supabase
      .from('verification_requests')
      .select(`
        *,
        users:user_id (email, phone, status),
        documents:verification_documents (*),
        history:verification_history (*)
      `)
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      return res.status(404).json({ success: false, message: 'Verification request not found.' });
    }

    // Attempt to pull the specific profile based on role to give the Admin full context
    let profileData = null;
    if (request.role === 'FARMER') {
      const { data } = await supabase.from('farmer_profiles').select('*').eq('user_id', request.user_id).single();
      profileData = data;
    } else if (request.role === 'BUYER') {
      const { data } = await supabase.from('buyer_profiles').select('*').eq('user_id', request.user_id).single();
      profileData = data;
    } else if (request.role === 'TRANSPORT') {
      const { data } = await supabase.from('transport_profiles').select('*').eq('user_id', request.user_id).single();
      profileData = data;
    } else if (request.role === 'INDUSTRY') {
      const { data } = await supabase.from('industry_profiles').select('*').eq('user_id', request.user_id).single();
      profileData = data;
    }

    return res.status(200).json({
      success: true,
      data: {
        ...request,
        profileData
      }
    });

  } catch (error: any) {
    console.error('Get Verification Request Error:', error.message || error);
    return res.status(500).json({ success: false, message: 'Server error fetching verification request' });
  }
};

// @desc    Approve a verification request
export const approveVerification = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { requestId } = req.params;
    const { notes } = req.body;
    const adminId = (req as any).user.id; // Admin performing the action

    // 1. Fetch current request to check status and get user_id
    const { data: request, error: fetchError } = await supabase
      .from('verification_requests')
      .select('status, user_id')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (request.status === 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Request is already approved.' });
    }

    // 2. Update request status to APPROVED
    const { error: updateError } = await supabase
      .from('verification_requests')
      .update({
        status: 'APPROVED',
        assigned_admin_id: adminId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) throw updateError;

    // 3. Log history
    await supabase.from('verification_history').insert([{
      request_id: requestId,
      action: 'APPROVE',
      admin_id: adminId,
      previous_status: request.status,
      new_status: 'APPROVED',
      notes: notes || 'Documents verified and approved.'
    }]);

    // 4. Update the actual user's status to VERIFIED
    await supabase
      .from('users')
      .update({ status: 'VERIFIED' })
      .eq('id', request.user_id);

    return res.status(200).json({ success: true, message: 'Request approved successfully.' });

  } catch (error: any) {
    console.error('Approve Verification Error:', error.message || error);
    return res.status(500).json({ success: false, message: 'Server error approving request' });
  }
};

// @desc    Reject a verification request
export const rejectVerification = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    const adminId = (req as any).user.id;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
    }

    const { data: request, error: fetchError } = await supabase
      .from('verification_requests')
      .select('status, user_id')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    // Update request
    const { error: updateError } = await supabase
      .from('verification_requests')
      .update({
        status: 'REJECTED',
        assigned_admin_id: adminId,
        reviewed_at: new Date().toISOString(),
        notes: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) throw updateError;

    // Log history
    await supabase.from('verification_history').insert([{
      request_id: requestId,
      action: 'REJECT',
      admin_id: adminId,
      previous_status: request.status,
      new_status: 'REJECTED',
      notes: reason
    }]);

    // Ensure user status is not left as PENDING, mark as REJECTED or leave it if you prefer them to try again.
    // For now we'll mark status as REJECTED so the frontend knows to prompt them.
    await supabase
      .from('users')
      .update({ status: 'REJECTED' })
      .eq('id', request.user_id);

    return res.status(200).json({ success: true, message: 'Request rejected successfully.' });

  } catch (error: any) {
    console.error('Reject Verification Error:', error.message || error);
    return res.status(500).json({ success: false, message: 'Server error rejecting request' });
  }
};

// @desc    Submit a new verification request (Called internally after onboarding)
export const submitVerificationRequest = async (userId: string, role: string, documents: any[]): Promise<void> => {
  try {
    // 1. Create the request
    const { data: request, error: requestError } = await supabase
      .from('verification_requests')
      .insert([{
        user_id: userId,
        role: role,
        status: 'PENDING'
      }])
      .select()
      .single();

    if (requestError) throw requestError;

    // 2. Insert documents
    if (documents && documents.length > 0) {
      const docPayload = documents.map(doc => ({
        request_id: request.id,
        document_type: doc.type,
        file_url: doc.url,
        status: 'PENDING'
      }));
      
      const { error: docError } = await supabase
        .from('verification_documents')
        .insert(docPayload);

      if (docError) throw docError;
    }

    // 3. Log history
    await supabase.from('verification_history').insert([{
      request_id: request.id,
      action: 'SUBMIT',
      new_status: 'PENDING',
      notes: 'Initial submission after onboarding.'
    }]);

  } catch (error: any) {
    console.error('Submit Verification Request Error:', error.message || error);
    throw error;
  }
};
