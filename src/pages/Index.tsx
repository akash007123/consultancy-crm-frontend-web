import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Users, Building2, TrendingUp, CheckCircle, ArrowRight, Star,
  Briefcase, Target, Shield, Globe,
} from 'lucide-react';

const stats = [
  { value: '5000+', label: 'Candidates Placed' },
  { value: '300+', label: 'Client Companies' },
  { value: '15+', label: 'Industries Served' },
  { value: '98%', label: 'Client Satisfaction' },
];

const services = [
  { icon: Users, title: 'Permanent Staffing', desc: 'End-to-end recruitment for full-time positions across industries.' },
  { icon: Briefcase, title: 'Contract Staffing', desc: 'Flexible workforce solutions for project-based requirements.' },
  { icon: Target, title: 'Executive Search', desc: 'Specialized headhunting for C-suite and leadership roles.' },
  { icon: Shield, title: 'HR Consulting', desc: 'Strategic HR advisory, compliance, and policy development.' },
];

const testimonials = [
  { name: 'Anita Desai', role: 'HR Director, TechVista', text: 'HireEdge transformed our hiring process. Their candidates are always top-notch quality.' },
  { name: 'Ravi Menon', role: 'CEO, GreenLeaf Pharma', text: 'Reliable, professional, and incredibly efficient. Our go-to staffing partner for 3 years.' },
  { name: 'Sunita Jain', role: 'VP Operations, BuildRight', text: 'Their understanding of our industry needs sets them apart from other consultancies.' },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-[0.03]" />
        <div className="container py-24 md:py-36 relative">
          <motion.div className="max-w-3xl" {...fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              India's Trusted Recruitment Partner
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-extrabold leading-tight text-foreground mb-6">
              Connecting <span className="text-primary">Talent</span> with{' '}
              <span className="text-accent">Opportunity</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed">
              We help businesses find the right people and professionals find the right careers.
              End-to-end staffing solutions powered by technology.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/contact">
                <Button size="lg" className="gradient-hero text-primary-foreground border-0 px-8">
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/services">
                <Button size="lg" variant="outline" className="px-8">
                  Our Services
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card">
        <div className="container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={i} className="text-center" {...fadeUp} transition={{ delay: i * 0.1, duration: 0.6 }}>
                <p className="text-3xl md:text-4xl font-heading font-extrabold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="container py-20">
        <motion.div className="text-center mb-14" {...fadeUp}>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Our Services</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Comprehensive staffing and HR solutions tailored to your business needs.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={i}
              className="p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-elevated transition-shadow"
              {...fadeUp}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mb-4">
                <s.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-card border-y border-border">
        <div className="container py-20">
          <motion.div className="text-center mb-14" {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Why Choose HireEdge?</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: TrendingUp, title: 'Data-Driven Matching', desc: 'AI-powered candidate matching for faster, better hiring outcomes.' },
              { icon: Building2, title: 'Industry Expertise', desc: 'Deep domain knowledge across IT, Pharma, Manufacturing, and more.' },
              { icon: CheckCircle, title: 'End-to-End Support', desc: 'From sourcing to onboarding — we handle the complete lifecycle.' },
            ].map((item, i) => (
              <motion.div key={i} className="flex gap-4" {...fadeUp} transition={{ delay: i * 0.1, duration: 0.6 }}>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-20">
        <motion.div className="text-center mb-14" {...fadeUp}>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">What Our Clients Say</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="p-6 rounded-xl bg-card border border-border shadow-card"
              {...fadeUp}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-warning text-warning" />)}
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{t.text}"</p>
              <div>
                <p className="font-semibold text-foreground text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-hero">
        <div className="container py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-4">
            Ready to Build Your Dream Team?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Partner with HireEdge and experience recruitment excellence.
          </p>
          <Link to="/contact">
            <Button size="lg" variant="secondary" className="px-8 font-semibold">
              Contact Us Today <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
