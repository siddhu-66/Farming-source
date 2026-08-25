'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Search, ShieldAlert, CheckCircle, Ban, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users').catch(() => ({ data: [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'FARMER', status: 'ACTIVE', joinedAt: '2023-01-15' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'BUYER', status: 'PENDING_VERIFICATION', joinedAt: '2023-02-10' }
      ]}));
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (userId: string, action: string) => {
    try {
      setActionLoading(`${userId}-${action}`);
      await api.post(`/admin/users/${userId}/${action}`);
      toast.success(`User ${action}ed successfully`);
      await fetchUsers(); // Refresh
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">User Management</h1>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>All Users</CardTitle>
          <div className="flex space-x-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input className="pl-10 h-10" placeholder="Search users..." />
            </div>
            <Select 
              options={[
                { value: 'ALL', label: 'All Roles' },
                { value: 'FARMER', label: 'Farmers' },
                { value: 'BUYER', label: 'Buyers' }
              ]} 
              className="w-40"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
               {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="default">{user.role}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'ACTIVE' ? 'success' : user.status === 'SUSPENDED' ? 'danger' : 'warning'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.joinedAt}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {user.status === 'PENDING_VERIFICATION' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600"
                          onClick={() => handleAction(user.id, 'verify')}
                          disabled={actionLoading !== null}
                        >
                          <CheckCircle className="h-4 w-4 mr-1"/> Verify
                        </Button>
                      )}
                      {user.status !== 'SUSPENDED' ? (
                         <Button 
                           size="sm" 
                           variant="outline" 
                           className="text-red-600"
                           onClick={() => handleAction(user.id, 'suspend')}
                           disabled={actionLoading !== null}
                         >
                           <Ban className="h-4 w-4 mr-1"/> Suspend
                         </Button>
                      ) : (
                         <Button 
                           size="sm" 
                           variant="outline" 
                           className="text-green-600"
                           onClick={() => handleAction(user.id, 'restore')}
                           disabled={actionLoading !== null}
                         >
                           <CheckCircle className="h-4 w-4 mr-1"/> Restore
                         </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
