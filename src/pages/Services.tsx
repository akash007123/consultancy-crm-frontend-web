import { motion } from 'framer-motion';
import { Users, Briefcase, Target, Shield, BarChart3, GraduationCap } from 'lucide-react';

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

const services = [
  { icon: Users, title: 'Permanent Staffing', desc: 'Full-time recruitment across all levels — from freshers to senior management. We handle sourcing, screening, and onboarding.' },
  { icon: Briefcase, title: 'Contract Staffing', desc: 'Flexible workforce for project-based needs. Managed payroll, compliance, and seamless scaling up or down.' },
  { icon: Target, title: 'Executive Search', desc: 'Confidential headhunting for C-level and leadership positions. Deep network of industry leaders and decision-makers.' },
  { icon: Shield, title: 'HR Consulting', desc: 'HR policy development, compliance audits, employee engagement strategies, and organizational restructuring advisory.' },
  { icon: BarChart3, title: 'RPO Services', desc: 'Recruitment Process Outsourcing — we become an extension of your HR team to manage end-to-end hiring.' },
  { icon: GraduationCap, title: 'Campus Recruitment', desc: 'Strategic campus hiring programs connecting you with top talent from premier institutions across India.' },
];

export default function ServicesPage() {
  return (
    <>
      <section className="gradient-hero">
        <div className="container py-20 text-center">
          <motion.h1 className="text-4xl md:text-5xl font-heading font-extrabold text-primary-foreground mb-4" {...fadeUp}>
            Our Services
          </motion.h1>
          <motion.p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg" {...fadeUp} transition={{ delay: 0.1 }}>
            Comprehensive staffing and HR solutions to fuel your business growth.
          </motion.p>
        </div>
      </section>

      <section className="container py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={i}
              className="p-8 rounded-xl bg-card border border-border shadow-card hover:shadow-elevated transition-shadow"
              {...fadeUp}
              transition={{ delay: i * 0.08, duration: 0.6 }}
            >
              <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mb-5">
                <s.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-heading font-bold text-foreground text-lg mb-3">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
