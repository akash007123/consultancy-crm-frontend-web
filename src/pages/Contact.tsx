import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Thank you! We will get back to you shortly.');
    }, 1000);
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
                <Input placeholder="First Name" required />
                <Input placeholder="Last Name" required />
              </div>
              <Input type="email" placeholder="Email Address" required />
              <Input type="tel" placeholder="Phone Number" required />
              <Input placeholder="Company Name" />
              <Textarea placeholder="Tell us about your requirements..." rows={4} required />
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
