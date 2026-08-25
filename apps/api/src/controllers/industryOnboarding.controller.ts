import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { submitVerificationRequest } from './verification.controller';

export const completeIndustryOnboarding = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { 
      company,
      documents,
      factory,
      warehouses,
      procurement,
      capacity,
      bankDetails
    } = req.body;

    // 1. Check if user is actually an industry
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    if (user.role !== 'INDUSTRY') {
      return res.status(403).json({ success: false, message: 'Only industry users can complete this onboarding flow.' });
    }

    // 2. Insert or update Industry Profile (Company Info)
    let industryId: string;
    
    const { data: existingProfile } = await supabase
      .from('industry_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      industryId = existingProfile.id;
      const { error: profileError } = await supabase
        .from('industry_profiles')
        .update({
          company_name: company.companyName,
          industry_type: company.industryType,
          registration_number: company.registrationNumber || null,
          gst_number: company.gstNumber || null,
          pan_number: company.panNumber || null,
          company_email: company.companyEmail,
          contact_number: company.contactNumber,
          website: company.website || null,
          year_established: company.yearEstablished || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', industryId);

      if (profileError) throw profileError;
    } else {
      const { data: profileData, error: profileError } = await supabase
        .from('industry_profiles')
        .insert([{
          user_id: userId,
          company_name: company.companyName,
          industry_type: company.industryType,
          registration_number: company.registrationNumber || null,
          gst_number: company.gstNumber || null,
          pan_number: company.panNumber || null,
          company_email: company.companyEmail,
          contact_number: company.contactNumber,
          website: company.website || null,
          year_established: company.yearEstablished || null,
        }])
        .select()
        .single();
        
      if (profileError) throw profileError;
      industryId = profileData.id;
    }

    // 3. Process Documents
    if (documents && documents.length > 0) {
      await supabase.from('industry_documents').delete().eq('industry_id', industryId);
      
      const docsToInsert = documents.map((doc: any) => ({
        industry_id: industryId,
        doc_type: doc.docType,
        file_url: doc.fileUrl
      }));

      const { error: docError } = await supabase
        .from('industry_documents')
        .insert(docsToInsert);
        
      if (docError) throw docError;
    }

    // 4. Process Factory
    if (factory) {
      await supabase.from('industry_factories').delete().eq('industry_id', industryId);
      
      const { error: factoryError } = await supabase
        .from('industry_factories')
        .insert([{
          industry_id: industryId,
          factory_name: factory.factoryName,
          factory_address: factory.factoryAddress,
          state: factory.state,
          district: factory.district,
          city: factory.city,
          postal_code: factory.postalCode,
          latitude: factory.latitude || null,
          longitude: factory.longitude || null,
          number_of_employees: factory.numberOfEmployees || null,
          working_shifts: factory.workingShifts || null
        }]);

      if (factoryError) throw factoryError;
    }

    // 5. Process Warehouses
    if (warehouses && warehouses.length > 0) {
      await supabase.from('industry_warehouses').delete().eq('industry_id', industryId);
      
      const warehousesToInsert = warehouses.map((w: any) => ({
        industry_id: industryId,
        warehouse_name: w.warehouseName,
        address: w.address,
        capacity_tons: Number(w.capacityTons),
        cold_storage: w.coldStorage || false,
        temperature_controlled: w.temperatureControlled || false,
        latitude: w.latitude || null,
        longitude: w.longitude || null,
        is_default: w.isDefault || false
      }));

      const { error: warehouseError } = await supabase
        .from('industry_warehouses')
        .insert(warehousesToInsert);

      if (warehouseError) throw warehouseError;
    }

    // 6. Process Procurement Preferences
    if (procurement) {
      await supabase.from('industry_procurement_preferences').delete().eq('industry_id', industryId);
      
      const { error: procError } = await supabase
        .from('industry_procurement_preferences')
        .insert([{
          industry_id: industryId,
          raw_materials: procurement.rawMaterials || [],
          min_order_quantity: Number(procurement.minOrderQuantity) || null,
          max_order_quantity: Number(procurement.maxOrderQuantity) || null,
          preferred_quality_grade: procurement.preferredQualityGrade || null,
          purchase_frequency: procurement.purchaseFrequency,
          preferred_states: procurement.preferredStates || [],
          preferred_districts: procurement.preferredDistricts || [],
          preferred_farmer_types: procurement.preferredFarmerTypes || [],
          organic_only: procurement.organicOnly || false,
          certified_farms_only: procurement.certifiedFarmsOnly || false,
          contract_farming_preferred: procurement.contractFarmingPreferred || false
        }]);

      if (procError) throw procError;
    }

    // 7. Process Capacity
    if (capacity) {
      await supabase.from('industry_processing_capacity').delete().eq('industry_id', industryId);
      
      const { error: capacityError } = await supabase
        .from('industry_processing_capacity')
        .insert([{
          industry_id: industryId,
          daily_capacity: Number(capacity.dailyCapacity) || 0,
          monthly_capacity: Number(capacity.monthlyCapacity) || null,
          annual_capacity: Number(capacity.annualCapacity) || null,
          capacity_unit: capacity.capacityUnit,
          operating_hours: capacity.operatingHours || null,
          logistics_preference: capacity.logisticsPreference || null,
          loading_facilities: capacity.loadingFacilities || []
        }]);

      if (capacityError) throw capacityError;
    }

    // 8. Process Bank Details
    if (bankDetails) {
      await supabase.from('industry_payment_settings').delete().eq('industry_id', industryId);
      
      const { error: bankError } = await supabase
        .from('industry_payment_settings')
        .insert([{
          industry_id: industryId,
          bank_name: bankDetails.bankName || null,
          account_holder: bankDetails.accountHolder || null,
          account_number: bankDetails.accountNumber || null,
          ifsc_code: bankDetails.ifscCode || null,
          upi_id: bankDetails.upiId || null
        }]);

      if (bankError) throw bankError;
    }

    // 6. Hook into Universal Verification System
    let verificationDocs = [];
    if (documents) {
      if (documents.fssaiLicense) verificationDocs.push({ type: 'FSSAI', url: documents.fssaiLicense });
      if (documents.isoCertificate) verificationDocs.push({ type: 'ISO', url: documents.isoCertificate });
      if (documents.factoryLicense) verificationDocs.push({ type: 'FACTORY_LICENSE', url: documents.factoryLicense });
    }
    await submitVerificationRequest(userId, 'INDUSTRY', verificationDocs);

    // 8. Mark onboarding as complete in the users table
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
      message: 'Industry onboarding completed successfully.',
      data: { industryId }
    });

  } catch (error: any) {
    console.error('Industry Onboarding Error:', error.message || error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete industry onboarding',
      error: error.message || error
    });
  }
};
