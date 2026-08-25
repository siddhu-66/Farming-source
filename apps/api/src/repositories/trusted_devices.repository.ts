import { supabase } from '../config/supabase';
import { DatabaseError } from '../utils/errors';
import { generatePublicId } from '../utils/generatePublicId';
import crypto from 'crypto';

export class TrustedDevicesRepository {
  async findDeviceByFingerprint(userId: string, fingerprint: string) {
    const { data, error } = await supabase.from('trusted_devices')
      .select('*')
      .eq('user_id', userId)
      .eq('device_fingerprint', fingerprint)
      .maybeSingle();
      
    if (error) throw new DatabaseError(error.message);
    return data;
  }

  async getDeviceById(userId: string, deviceId: string) {
    const { data, error } = await supabase.from('trusted_devices')
      .select('*')
      .eq('user_id', userId)
      .eq('id', deviceId)
      .maybeSingle();

    if (error) throw new DatabaseError(error.message);
    return data;
  }

  async registerDevice(userId: string, fingerprint: string, meta: any) {
    const { data, error } = await supabase.from('trusted_devices').insert([{
      user_id: userId,
      device_code: crypto.randomBytes(8).toString('hex'),
      device_fingerprint: fingerprint,
      device_name: `${meta.browser || 'Unknown Browser'} on ${meta.operatingSystem || 'Unknown OS'}`,
      device_type: meta.deviceType || 'Unknown',
      platform: meta.platform || 'Unknown',
      operating_system: meta.operatingSystem || 'Unknown',
      browser: meta.browser || 'Unknown',
      language: meta.language || 'English',
      timezone: meta.timezone || 'UTC',
      ip_address: meta.ipAddress || '0.0.0.0',
      is_trusted: true,
      last_login_at: new Date().toISOString()
    }]).select().single();

    if (error) {
      console.error(error);
      throw new DatabaseError(error.message);
    }
    return data;
  }

  async updateDeviceLogin(deviceId: string, isSuccess: boolean, sessionId?: string, refreshTokenId?: string) {
    const now = new Date().toISOString();
    if (isSuccess) {
      const { error } = await supabase.from('trusted_devices').update({ last_login_at: now }).eq('id', deviceId);
      if (error) throw new DatabaseError(error.message);
    }
  }

  async updateDeviceActivity(deviceId: string) {
    // No-op for this schema
  }

  async listDevices(userId: string) {
    const { data, error } = await supabase.from('trusted_devices')
      .select('*')
      .eq('user_id', userId)
      .eq('is_trusted', true)
      .order('last_login_at', { ascending: false });

    if (error) throw new DatabaseError(error.message);
    return data;
  }

  async renameDevice(userId: string, deviceId: string, name: string) {
    const { error } = await supabase.from('trusted_devices').update({
      device_name: name
    }).eq('user_id', userId).eq('id', deviceId);
    if (error) throw new DatabaseError(error.message);
  }

  async removeDevice(userId: string, deviceId: string) {
    const { error } = await supabase.from('trusted_devices').update({
      is_trusted: false
    }).eq('user_id', userId).eq('id', deviceId);
    if (error) throw new DatabaseError(error.message);
  }

  async setDeviceStatus(deviceId: string, status: 'TRUSTED' | 'BLOCKED', reason?: string) {
    const { error } = await supabase.from('trusted_devices').update({
      is_trusted: status === 'TRUSTED'
    }).eq('id', deviceId);
    if (error) throw new DatabaseError(error.message);
  }
}

export default new TrustedDevicesRepository();
