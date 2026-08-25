'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function ContactPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    await new Promise(res => setTimeout(res, 1000));
    console.log(data);
    alert('Message sent successfully!');
  };

  return (
    <div className="py-20 px-4 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h1 className="text-4xl font-bold mb-6">Get in Touch</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
            Have questions about our platform? Need support with an order? Our team is here to help.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-primary/10 p-3 rounded-lg text-primary mr-4">
                <span className="text-xl">📍</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Office</h3>
                <p className="text-gray-500">123 Agriculture Tech Park<br />Bengaluru, Karnataka 560001</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary/10 p-3 rounded-lg text-primary mr-4">
                <span className="text-xl">📞</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Phone</h3>
                <p className="text-gray-500">+91 1800-123-4567</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary/10 p-3 rounded-lg text-primary mr-4">
                <span className="text-xl">✉️</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Email</h3>
                <p className="text-gray-500">support@agriassist.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input label="Full Name" placeholder="John Doe" {...register('name')} error={errors.name?.message} />
            <Input label="Email Address" type="email" placeholder="john@example.com" {...register('email')} error={errors.email?.message} />
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Message</label>
              <textarea 
                className="flex min-h-[120px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-900"
                placeholder="How can we help you?"
                {...register('message')}
              />
              {errors.message && <span className="text-xs text-red-500">{errors.message.message}</span>}
            </div>
            <Button className="w-full" isLoading={isSubmitting}>Send Message</Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
