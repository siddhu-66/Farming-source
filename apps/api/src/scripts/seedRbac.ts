import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const roles = ['FARMER', 'BUYER', 'TRANSPORT', 'INDUSTRY', 'ADMIN'];

const farmerPermissions = [
  'profile.view', 'profile.edit', 'crop.create', 'crop.update', 'crop.delete', 'crop.view',
  'market.browse', 'market.list', 'order.view', 'order.accept', 'transport.request',
  'notification.view', 'report.personal', 'setting.manage'
];

const buyerPermissions = [
  'profile.view', 'profile.edit', 'market.browse', 'market.search', 'market.order', 'market.wishlist',
  'order.create', 'order.cancel', 'order.track', 'payment.make', 'report.purchase', 'notification.view'
];

const transportPermissions = [
  'profile.view', 'profile.edit', 'job.view', 'job.accept', 'job.reject', 'route.navigate',
  'delivery.update', 'delivery.upload', 'earning.view', 'report.transport'
];

const industryPermissions = [
  'profile.view', 'profile.edit', 'market.bulk', 'order.create', 'order.manage', 'contract.create',
  'contract.sign', 'inventory.view', 'payment.process', 'report.industry'
];

const adminPermissions = [
  'user.manage', 'role.manage', 'crop.manage', 'market.manage', 'order.manage', 'transport.manage',
  'industry.manage', 'payment.manage', 'report.manage', 'analytics.manage', 'notification.manage',
  'security.manage', 'audit.manage', 'system.manage'
];

const seedRbac = async () => {
  console.log('Starting RBAC seeding...');

  try {
    // 1. Ensure Roles Exist
    for (const roleName of roles) {
      const { error } = await supabase.from('roles').upsert({ name: roleName }, { onConflict: 'name' });
      if (error) throw new Error(`Error inserting role ${roleName}: ${error.message}`);
    }
    console.log('Roles seeded successfully.');

    // 2. Fetch Role IDs
    const { data: rolesData, error: rolesError } = await supabase.from('roles').select('id, name');
    if (rolesError) throw new Error(`Error fetching roles: ${rolesError.message}`);

    const roleIdMap = rolesData.reduce((acc, role) => {
      acc[role.name] = role.id;
      return acc;
    }, {} as Record<string, string>);

    // 3. Compile all unique permissions
    const allPermissions = new Set([
      ...farmerPermissions,
      ...buyerPermissions,
      ...transportPermissions,
      ...industryPermissions,
      ...adminPermissions
    ]);

    // 4. Ensure Permissions Exist
    for (const permCode of Array.from(allPermissions)) {
      const { error } = await supabase.from('permissions').upsert({ code: permCode, description: permCode }, { onConflict: 'code' });
      if (error) throw new Error(`Error inserting permission ${permCode}: ${error.message}`);
    }
    console.log('Permissions seeded successfully.');

    // 5. Fetch Permission IDs
    const { data: permsData, error: permsError } = await supabase.from('permissions').select('id, code');
    if (permsError) throw new Error(`Error fetching permissions: ${permsError.message}`);

    const permIdMap = permsData.reduce((acc, perm) => {
      acc[perm.code] = perm.id;
      return acc;
    }, {} as Record<string, string>);

    // 6. Map Roles to Permissions (role_permissions)
    const rolePermissionMappings = [
      { role: 'FARMER', perms: farmerPermissions },
      { role: 'BUYER', perms: buyerPermissions },
      { role: 'TRANSPORT', perms: transportPermissions },
      { role: 'INDUSTRY', perms: industryPermissions },
      { role: 'ADMIN', perms: adminPermissions },
    ];

    for (const mapping of rolePermissionMappings) {
      const roleId = roleIdMap[mapping.role];
      for (const permCode of mapping.perms) {
        const permId = permIdMap[permCode];
        
        // Upsert to role_permissions
        // We use a unique constraint on role_id + permission_id for onConflict
        const { error } = await supabase.from('role_permissions').upsert({
          role_id: roleId,
          permission_id: permId
        });
        
        // Ignore unique constraint violation if no explicit onConflict
        if (error && error.code !== '23505') {
           console.error(`Error inserting role_permission for ${mapping.role} - ${permCode}:`, error.message);
        }
      }
    }
    
    console.log('Role Permissions mapped successfully.');
    console.log('RBAC Seeding Complete!');
  } catch (error) {
    console.error('Seeding failed:', error);
  }
};

seedRbac();
