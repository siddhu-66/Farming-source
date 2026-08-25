import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { submitVerificationRequest } from './verification.controller';

export const completeFarmerOnboarding = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { farm, location, crops, irrigation, equipment, storageAndLivestock, governmentSchemes } = req.body;

    // 1. Insert Farm
    const { data: farmData, error: farmError } = await supabase
      .from('farms')
      .insert({
        user_id: userId,
        name: farm.name,
        farmer_type: farm.farmerType,
        total_area: farm.totalArea,
        area_unit: farm.areaUnit,
        number_of_fields: farm.numberOfFields,
        years_of_experience: farm.yearsOfExperience || null,
        organic_certified: farm.organicCertified,
        certification_number: farm.certificationNumber || null,
      })
      .select()
      .single();

    if (farmError) throw farmError;
    const farmId = farmData.id;

    // 8. Hook into Universal Verification System
    let verificationDocs = [];
    if (farm && farm.organicCertUrl) verificationDocs.push({ type: 'ORGANIC_CERT', url: farm.organicCertUrl });
    await submitVerificationRequest(userId, 'FARMER', verificationDocs);

    // 2. Insert Location
    if (location) {
      const { error: locError } = await supabase
        .from('farm_locations')
        .insert({
          farm_id: farmId,
          user_id: userId,
          state: location.state,
          district: location.district,
          mandal: location.mandal || null,
          village: location.village,
          address: location.address || null,
          latitude: location.latitude,
          longitude: location.longitude,
        });
      if (locError) throw locError;
    }

    // 3. Insert Crops
    if (crops && crops.length > 0) {
      const cropInserts = crops.map((c: any) => ({
        farm_id: farmId,
        user_id: userId,
        category: c.category,
        name: c.name,
        variety: c.variety || null,
        season: c.season,
        cultivated_area: c.cultivatedArea,
        expected_harvest_date: c.expectedHarvestDate,
        estimated_yield: c.estimatedYield || null,
      }));
      
      const { error: cropsError } = await supabase.from('crops').insert(cropInserts);
      if (cropsError) throw cropsError;
    }

    // 4. Insert Irrigation
    if (irrigation) {
      const { error: irrError } = await supabase
        .from('irrigation_profiles')
        .insert({
          farm_id: farmId,
          user_id: userId,
          irrigation_type: irrigation.irrigationType,
          water_source: irrigation.waterSource,
          frequency: irrigation.frequency || null,
          water_availability: irrigation.waterAvailability || null,
        });
      if (irrError) throw irrError;
    }

    // 5. Insert Equipment
    if (equipment && equipment.length > 0) {
      const equipInserts = equipment.map((e: any) => ({
        user_id: userId,
        name: e.name,
        quantity: e.quantity,
        working_condition: e.workingCondition || null,
      }));
      
      const { error: equipError } = await supabase.from('equipment').insert(equipInserts);
      if (equipError) throw equipError;
    }

    // 6. Insert Government Schemes (Optional - but we can store it)
    if (governmentSchemes) {
      const { error: govError } = await supabase
        .from('government_profiles')
        .insert({
          user_id: userId,
          pm_kisan_beneficiary: governmentSchemes.pmKisanBeneficiary,
          soil_health_card: governmentSchemes.soilHealthCard,
          crop_insurance: governmentSchemes.cropInsurance,
          kisan_credit_card: governmentSchemes.kisanCreditCard,
          fpo_member: governmentSchemes.fpoMember,
        });
      if (govError) throw govError;
    }

    // Finally, if they completed this, we might want to update a flag on `users` if we added one.
    // Assuming `onboarding_completed` was already set in basic profile, maybe `farmer_setup_completed` exists,
    // or we just rely on `farms` table having entries.

    res.json({ success: true, message: 'Farmer onboarding completed successfully', data: { farmId } });
  } catch (error) {
    next(error);
  }
};
