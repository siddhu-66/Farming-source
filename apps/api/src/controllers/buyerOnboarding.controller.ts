import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { submitVerificationRequest } from './verification.controller';

export const completeBuyerOnboarding = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { 
      business, 
      warehouses, 
      preferences, 
      documents, 
      paymentSettings 
    } = req.body;

    // 1. Check if user is actually a buyer
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    if (user.role !== 'BUYER') {
      return res.status(403).json({ success: false, message: 'Only buyers can complete this onboarding flow.' });
    }

    // 2. Insert or update Buyer Profile
    let buyerId: string;
    
    // Check if buyer profile already exists
    const { data: existingProfile } = await supabase
      .from('buyer_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      buyerId = existingProfile.id;
      // Update existing
      const { error: profileError } = await supabase
        .from('buyer_profiles')
        .update({
          business_name: business.businessName,
          business_type: business.businessType,
          owner_name: business.ownerName,
          contact_person: business.contactPerson,
          mobile: business.mobile,
          email: business.email,
          registration_number: business.registrationNumber || null,
          years_in_business: business.yearsInBusiness || null,
          website: business.website || null,
          gst_number: business.gstNumber || null,
          pan_number: business.panNumber || null,
          trade_license: business.tradeLicense || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', buyerId);

      if (profileError) throw profileError;
    } else {
      // Create new
      const { data: profileData, error: profileError } = await supabase
        .from('buyer_profiles')
        .insert([{
          user_id: userId,
          business_name: business.businessName,
          business_type: business.businessType,
          owner_name: business.ownerName,
          contact_person: business.contactPerson,
          mobile: business.mobile,
          email: business.email,
          registration_number: business.registrationNumber || null,
          years_in_business: business.yearsInBusiness || null,
          website: business.website || null,
          gst_number: business.gstNumber || null,
          pan_number: business.panNumber || null,
          trade_license: business.tradeLicense || null
        }])
        .select()
        .single();
        
      if (profileError) throw profileError;
      buyerId = profileData.id;
    }

    // 3. Process Warehouses
    if (warehouses && warehouses.length > 0) {
      // First delete existing to replace
      await supabase.from('warehouses').delete().eq('buyer_id', buyerId);
      
      const warehousesToInsert = warehouses.map((w: any) => ({
        buyer_id: buyerId,
        name: w.name,
        address: w.address,
        state: w.state,
        district: w.district,
        city: w.city,
        postal_code: w.postalCode,
        capacity_tons: Number(w.capacityTons),
        cold_storage: w.coldStorage || false,
        latitude: w.latitude || null,
        longitude: w.longitude || null
      }));

      const { error: warehouseError } = await supabase
        .from('warehouses')
        .insert(warehousesToInsert);

      if (warehouseError) throw warehouseError;
    }

    // 4. Process Preferences
    if (preferences) {
      await supabase.from('buyer_preferences').delete().eq('buyer_id', buyerId);
      
      const { error: prefError } = await supabase
        .from('buyer_preferences')
        .insert([{
          buyer_id: buyerId,
          categories: preferences.categories || [],
          daily_capacity: Number(preferences.dailyCapacity) || null,
          monthly_capacity: Number(preferences.monthlyCapacity) || null,
          annual_capacity: Number(preferences.annualCapacity) || null,
          radius_km: Number(preferences.preferredRadiusKm) || null,
          schedule: preferences.procurementSchedule || null
        }]);

      if (prefError) throw prefError;
    }

    // 5. Process Documents
    if (documents && documents.length > 0) {
      await supabase.from('buyer_documents').delete().eq('buyer_id', buyerId);
      
      const docsToInsert = documents.map((doc: any) => ({
        buyer_id: buyerId,
        doc_type: doc.docType,
        file_url: doc.fileUrl
      }));

      const { error: docError } = await supabase
        .from('buyer_documents')
        .insert(docsToInsert);
        
      if (docError) throw docError;
    }

    // 6. Process Payment Settings & Billing
    if (paymentSettings) {
      await supabase.from('buyer_payment_settings').delete().eq('buyer_id', buyerId);
      
      const { error: paymentError } = await supabase
        .from('buyer_payment_settings')
        .insert([{
          buyer_id: buyerId,
          payment_methods: paymentSettings.paymentMethods || [],
          payment_terms: paymentSettings.paymentTerms || null,
          bank_name: paymentSettings.bankName || null,
          account_holder: paymentSettings.accountHolder || null,
          account_number: paymentSettings.accountNumber || null,
          ifsc_code: paymentSettings.ifscCode || null,
          billing_address: paymentSettings.billingAddress || null,
          delivery_address: paymentSettings.deliveryAddress || null
        }]);

      if (paymentError) throw paymentError;
    }

    // 6. Hook into Universal Verification System
    let verificationDocs = [];
    if (documents) {
      if (documents.gstCertificate) verificationDocs.push({ type: 'GST', url: documents.gstCertificate });
      if (documents.panCard) verificationDocs.push({ type: 'PAN', url: documents.panCard });
      if (documents.businessLicense) verificationDocs.push({ type: 'BUSINESS_LICENSE', url: documents.businessLicense });
    }
    await submitVerificationRequest(userId, 'BUYER', verificationDocs);

    // 7. Mark onboarding as complete in the users table
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
      message: 'Buyer onboarding completed successfully.',
      data: { buyerId }
    });

  } catch (error: any) {
    console.error('Buyer Onboarding Error:', error.message || error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete buyer onboarding',
      error: error.message || error
    });
  }
};
