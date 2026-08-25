"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFarmerProfileStore } from "@/stores/useFarmerProfileStore";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Loader2, Plus, Users, UserCheck, Trash2 } from "lucide-react";
import {
  Dialog,
} from "@/components/ui/Dialog";

const workerSchema = z.object({
  workerName: z.string().min(2, "Worker name is required"),
  phone: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  experienceYears: z.coerce.number().optional(),
  dailyWage: z.coerce.number().optional(),
  monthlySalary: z.coerce.number().optional(),
  joiningDate: z.string().optional(),
  status: z.string().default('Active'),
});

type WorkerFormValues = z.infer<typeof workerSchema>;

export default function WorkersPage() {
  const { workers, fetchWorkers } = useFarmerProfileStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<WorkerFormValues>({
    resolver: zodResolver(workerSchema),
    defaultValues: {
      status: 'Active',
      role: 'Daily Wage Worker'
    }
  });

  const onSubmit = async (data: WorkerFormValues) => {
    setIsAdding(true);
    try {
      const res = await api.post("/farmer/workers", data);
      if (res.data?.success) {
        toast.success("Worker added successfully");
        setIsDialogOpen(false);
        reset();
        await fetchWorkers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add worker");
    } finally {
      setIsAdding(false);
    }
  };

  const deleteWorker = async (id: string) => {
    if (!confirm("Are you sure you want to remove this worker?")) return;
    try {
      const res = await api.delete(`/farmer/workers/${id}`);
      if (res.data?.success) {
        toast.success("Worker removed");
        await fetchWorkers();
      }
    } catch (err) {
      toast.error("Failed to remove worker");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Farm Workers</h2>
          <p className="text-muted-foreground">Manage your workforce, roles, and compensation.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Worker
        </Button>

        <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title="Add New Worker">

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workerName">Worker Full Name</Label>
                  <Input id="workerName" {...register("workerName")} />
                  {errors.workerName && <p className="text-sm text-red-500">{errors.workerName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number</Label>
                  <Input id="phone" {...register("phone")} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role / Category</Label>
                  <select 
                    id="role" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    {...register("role")}
                  >
                    <option value="Permanent Worker">Permanent Worker</option>
                    <option value="Seasonal Worker">Seasonal Worker</option>
                    <option value="Daily Wage Worker">Daily Wage Worker</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Equipment Operator">Equipment Operator</option>
                  </select>
                  {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experienceYears">Experience (Years)</Label>
                  <Input id="experienceYears" type="number" {...register("experienceYears")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dailyWage">Daily Wage (₹)</Label>
                  <Input id="dailyWage" type="number" {...register("dailyWage")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlySalary">Monthly Salary (₹)</Label>
                  <Input id="monthlySalary" type="number" {...register("monthlySalary")} />
                </div>
              </div>

              <div className="flex justify-end pt-4 gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isAdding}>
                  {isAdding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Worker
                </Button>
              </div>
            </form>
          
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workers.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-muted/50 rounded-xl border border-dashed">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No Workers Found</h3>
            <p className="text-muted-foreground">You haven't added any farm workers yet.</p>
          </div>
        ) : (
          workers.map((worker: any) => (
            <Card key={worker.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{worker.workerName}</CardTitle>
                    <CardDescription>{worker.phone || 'No phone'}</CardDescription>
                  </div>
                  <Badge variant="secondary">{worker.role}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3 flex-1">
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-muted-foreground">Experience</div>
                  <div className="font-medium text-right">{worker.experienceYears ? `${worker.experienceYears} Years` : 'N/A'}</div>
                  
                  <div className="text-muted-foreground">Wage/Salary</div>
                  <div className="font-medium text-right text-emerald-600">
                    {worker.dailyWage ? `₹${worker.dailyWage}/day` : worker.monthlySalary ? `₹${worker.monthlySalary}/mo` : 'Not set'}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-3 border-t bg-muted/20 flex justify-between">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50">
                  <UserCheck className="w-4 h-4 mr-2" /> Attendance
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50" onClick={() => deleteWorker(worker.id)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Remove
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
