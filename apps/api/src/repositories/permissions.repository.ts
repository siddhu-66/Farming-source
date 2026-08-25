import { supabase } from '../config/supabase';
import { DatabaseError, NotFoundError, BusinessRuleError } from '../utils/errors';
import { generatePublicId } from '../utils/generatePublicId';

export class PermissionsRepository {
  async getPermissionById(id: string) {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .maybeSingle();
      
    if (error) throw new DatabaseError(error.message);
    if (!data) throw new NotFoundError('Permission not found');
    return data;
  }

  async getPermissionByCode(permissionCode: string) {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .eq('permission_code', permissionCode)
      .eq('is_deleted', false)
      .maybeSingle();

    if (error) throw new DatabaseError(error.message);
    return data;
  }

  async getAllPermissions(includeInactive = false) {
    let query = supabase.from('permissions').select('*').eq('is_deleted', false);
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query.order('module', { ascending: true });
    if (error) throw new DatabaseError(error.message);
    return data;
  }

  async createPermission(permissionData: any) {
    const enrichedData = {
      ...permissionData,
      public_id: generatePublicId('PER'),
      is_deleted: false,
      version: 1,
    };

    const { data, error } = await supabase
      .from('permissions')
      .insert([enrichedData])
      .select()
      .single();

    if (error) throw new DatabaseError(error.message);
    return data;
  }

  async updatePermission(id: string, updates: any) {
    const perm = await this.getPermissionById(id);
    if (perm.is_system_permission && updates.permission_code) {
      throw new BusinessRuleError('Cannot modify permission code of a system permission');
    }

    const { data, error } = await supabase
      .from('permissions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new DatabaseError(error.message);
    return data;
  }

  async deletePermission(id: string) {
    const perm = await this.getPermissionById(id);
    if (perm.is_system_permission) {
      throw new BusinessRuleError('Cannot delete a system permission');
    }

    const { error } = await supabase
      .from('permissions')
      .update({ 
        is_deleted: true, 
        deleted_at: new Date().toISOString(),
        is_active: false 
      })
      .eq('id', id);

    if (error) throw new DatabaseError(error.message);
  }

  // System setup utility
  async initializeSystemPermissions() {
    const systemPermissions = [
      {
        permission_code: 'AUTH_LOGIN',
        permission_name: 'Login',
        module: 'AUTH',
        category: 'Authentication',
        action: 'READ',
        description: 'Allow user to log in',
        risk_level: 'LOW',
        is_system_permission: true,
        is_active: true,
      },
      {
        permission_code: 'FARMER_CREATE_CROP',
        permission_name: 'Create Crop Listing',
        module: 'FARMER',
        category: 'Marketplace',
        action: 'CREATE',
        description: 'Allow farmer to create a crop listing',
        risk_level: 'MEDIUM',
        is_system_permission: true,
        is_active: true,
      },
      {
        permission_code: 'BUYER_PLACE_ORDER',
        permission_name: 'Place Order',
        module: 'ORDERS',
        category: 'Orders',
        action: 'CREATE',
        description: 'Allow buyer to place an order',
        risk_level: 'HIGH',
        is_system_permission: true,
        is_active: true,
      },
      {
        permission_code: 'ADMIN_MANAGE_USERS',
        permission_name: 'Manage Users',
        module: 'ADMIN',
        category: 'Administration',
        action: 'MANAGE',
        description: 'Allow admin to manage platform users',
        risk_level: 'CRITICAL',
        is_system_permission: true,
        is_active: true,
      }
    ];

    for (const perm of systemPermissions) {
      const existing = await supabase.from('permissions').select('id').eq('permission_code', perm.permission_code).maybeSingle();
      if (!existing.data) {
        await this.createPermission(perm);
      }
    }
  }
}

export default new PermissionsRepository();
