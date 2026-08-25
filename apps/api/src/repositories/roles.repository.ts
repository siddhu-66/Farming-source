import { supabase } from '../config/supabase';
import { DatabaseError, NotFoundError, BusinessRuleError } from '../utils/errors';
import { generatePublicId } from '../utils/generatePublicId';

export class RolesRepository {
  async getRoleById(id: string) {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .maybeSingle();
      
    if (error) throw new DatabaseError(error.message);
    if (!data) throw new NotFoundError('Role not found');
    return data;
  }

  async getRoleByCode(roleCode: string) {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('role_code', roleCode)
      .eq('is_deleted', false)
      .maybeSingle();

    if (error) throw new DatabaseError(error.message);
    return data;
  }

  async getAllRoles(includeInactive = false) {
    let query = supabase.from('roles').select('*').eq('is_deleted', false);
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query.order('priority', { ascending: false });
    if (error) throw new DatabaseError(error.message);
    return data;
  }

  async createRole(roleData: any) {
    const enrichedData = {
      ...roleData,
      public_id: generatePublicId('ROL'),
      is_deleted: false,
      version: 1,
    };

    const { data, error } = await supabase
      .from('roles')
      .insert([enrichedData])
      .select()
      .single();

    if (error) throw new DatabaseError(error.message);
    return data;
  }

  async updateRole(id: string, updates: any) {
    const role = await this.getRoleById(id);
    if (role.is_system_role && updates.role_code) {
      throw new BusinessRuleError('Cannot modify role code of a system role');
    }

    const { data, error } = await supabase
      .from('roles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new DatabaseError(error.message);
    return data;
  }

  async deactivateRole(id: string) {
    const role = await this.getRoleById(id);
    if (role.is_system_role) {
      throw new BusinessRuleError('Cannot deactivate a system role');
    }

    const { data, error } = await supabase
      .from('roles')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new DatabaseError(error.message);
    return data;
  }

  async deleteRole(id: string) {
    const role = await this.getRoleById(id);
    if (role.is_system_role) {
      throw new BusinessRuleError('Cannot delete a system role');
    }

    const { error } = await supabase
      .from('roles')
      .update({ 
        is_deleted: true, 
        deleted_at: new Date().toISOString(),
        is_active: false 
      })
      .eq('id', id);

    if (error) throw new DatabaseError(error.message);
  }

  // System setup utility
  async initializeSystemRoles() {
    const systemRoles = [
      {
        role_code: 'FARMER',
        role_name: 'Farmer',
        display_name: 'Farmer',
        description: 'Primary agricultural producer',
        dashboard_route: '/farmer/dashboard',
        default_landing_page: '/farmer/dashboard',
        icon: 'tractor',
        color: '#22C55E',
        priority: 10,
        is_system_role: true,
        is_default_role: false,
        is_active: true,
      },
      {
        role_code: 'BUYER',
        role_name: 'Buyer',
        display_name: 'Buyer',
        description: 'Crop purchaser',
        dashboard_route: '/buyer/dashboard',
        default_landing_page: '/marketplace',
        icon: 'shopping-cart',
        color: '#3B82F6',
        priority: 20,
        is_system_role: true,
        is_default_role: false,
        is_active: true,
      },
      {
        role_code: 'TRANSPORT',
        role_name: 'Transport',
        display_name: 'Transport Provider',
        description: 'Logistics and delivery',
        dashboard_route: '/transport/dashboard',
        default_landing_page: '/transport/deliveries',
        icon: 'truck',
        color: '#F59E0B',
        priority: 30,
        is_system_role: true,
        is_default_role: false,
        is_active: true,
      },
      {
        role_code: 'INDUSTRY',
        role_name: 'Industry',
        display_name: 'Industry Partner',
        description: 'Large-scale processing buyer',
        dashboard_route: '/industry/dashboard',
        default_landing_page: '/industry/procurement',
        icon: 'factory',
        color: '#8B5CF6',
        priority: 40,
        is_system_role: true,
        is_default_role: false,
        is_active: true,
      },
      {
        role_code: 'ADMIN',
        role_name: 'Admin',
        display_name: 'Administrator',
        description: 'Platform management',
        dashboard_route: '/admin/dashboard',
        default_landing_page: '/admin/overview',
        icon: 'shield',
        color: '#EF4444',
        priority: 90,
        is_system_role: true,
        is_default_role: false,
        is_active: true,
      },
      {
        role_code: 'SUPER_ADMIN',
        role_name: 'Super Admin',
        display_name: 'Super Administrator',
        description: 'Full platform access',
        dashboard_route: '/admin/system',
        default_landing_page: '/admin/system',
        icon: 'crown',
        color: '#000000',
        priority: 100,
        is_system_role: true,
        is_default_role: false,
        is_active: true,
      }
    ];

    for (const role of systemRoles) {
      const existing = await supabase.from('roles').select('id').eq('role_code', role.role_code).maybeSingle();
      if (!existing.data) {
        await this.createRole(role);
      }
    }
  }
}

export default new RolesRepository();
