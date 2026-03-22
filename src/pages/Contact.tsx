import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { contactApi } from '@/lib/api';

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  message: string;
}

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await contactApi.submit({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        companyName: formData.companyName,
        message: formData.message,
      });
      
      toast.success('Thank you! We will get back to you shortly.');
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        companyName: '',
        message: '',
      });
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="gradient-hero">
        <div className="container py-20 text-center">
          <motion.h1 className="text-4xl md:text-5xl font-heading font-extrabold text-primary-foreground mb-4" {...fadeUp}>
            Contact Us
          </motion.h1>
          <motion.p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg" {...fadeUp} transition={{ delay: 0.1 }}>
            Let's discuss how we can help you build your dream team.
          </motion.p>
        </div>
      </section>

      <section className="container py-20">
        <div className="grid md:grid-cols-2 gap-16">
          <motion.div {...fadeUp}>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Get in Touch</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  placeholder="First Name" 
                  required 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <Input 
                  placeholder="Last Name" 
                  required 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
              <Input 
                type="email" 
                placeholder="Email Address" 
                required 
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              <Input 
                type="tel" 
                placeholder="Phone Number" 
                required 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              <Input 
                placeholder="Company Name" 
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
              />
              <Textarea 
                placeholder="Tell us about your requirements..." 
                rows={4} 
                required 
                name="message"
                value={formData.message}
                onChange={handleChange}
              />
              <Button type="submit" className="w-full gradient-hero text-primary-foreground border-0" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </motion.div>

          <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Contact Info</h2>
            <div className="space-y-6">
              {[
                { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
                { icon: Mail, label: 'Email', value: 'info@hireedge.com' },
                { icon: MapPin, label: 'Address', value: '4th Floor, Business Hub, Andheri East, Mumbai - 400069' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="font-medium text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 rounded-xl bg-card border border-border shadow-card">
              <h3 className="font-heading font-semibold text-foreground mb-2">Working Hours</h3>
              <p className="text-sm text-muted-foreground">Monday – Friday: 9:00 AM – 6:00 PM</p>
              <p className="text-sm text-muted-foreground">Saturday: 9:00 AM – 1:00 PM</p>
              <p className="text-sm text-muted-foreground">Sunday: Closed</p>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
