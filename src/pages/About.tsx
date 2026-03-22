import { motion } from 'framer-motion';
import { Users, Award, Globe, TrendingUp } from 'lucide-react';

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

export default function AboutPage() {
  return (
    <>
      <section className="gradient-hero">
        <div className="container py-20 text-center">
          <motion.h1 className="text-4xl md:text-5xl font-heading font-extrabold text-primary-foreground mb-4" {...fadeUp}>
            About HireEdge
          </motion.h1>
          <motion.p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg" {...fadeUp} transition={{ delay: 0.1 }}>
            A decade of connecting exceptional talent with leading organizations across India.
          </motion.p>
        </div>
      </section>

      <section className="container py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-heading font-bold text-foreground mb-6">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Founded in 2015, HireEdge has grown from a small recruitment firm in Mumbai to one of India's most trusted job consultancy partners. We serve 300+ client companies across 15+ industries.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our technology-driven approach combines deep industry expertise with advanced matching algorithms to deliver faster, better hiring outcomes.
            </p>
          </motion.div>
          <motion.div className="grid grid-cols-2 gap-4" {...fadeUp} transition={{ delay: 0.2 }}>
            {[
              { icon: Users, value: '5000+', label: 'Placements' },
              { icon: Award, value: '10+', label: 'Years Experience' },
              { icon: Globe, value: '15+', label: 'Industries' },
              { icon: TrendingUp, value: '98%', label: 'Retention Rate' },
            ].map((s, i) => (
              <div key={i} className="p-6 rounded-xl bg-card border border-border shadow-card text-center">
                <s.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-2xl font-heading font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-card border-y border-border">
        <div className="container py-20">
          <motion.h2 className="text-3xl font-heading font-bold text-foreground text-center mb-12" {...fadeUp}>
            Our Values
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Integrity', desc: 'We build trust through transparency and ethical practices in every engagement.' },
              { title: 'Excellence', desc: 'We set high standards and consistently deliver quality candidates and service.' },
              { title: 'Innovation', desc: 'We leverage technology to stay ahead and provide cutting-edge recruitment solutions.' },
            ].map((v, i) => (
              <motion.div key={i} className="p-6 rounded-xl border border-border bg-background" {...fadeUp} transition={{ delay: i * 0.1 }}>
                <h3 className="font-heading font-semibold text-foreground mb-2 text-lg">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
