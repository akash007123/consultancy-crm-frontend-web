import { Link } from 'react-router-dom';
import { Briefcase, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="font-heading font-bold text-xl">HireEdge</span>
            </div>
            <p className="text-sm opacity-70 leading-relaxed">
              India's trusted job consultancy partner. Connecting talent with opportunity since 2015.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm opacity-70">
              <Link to="/about" className="hover:opacity-100 transition-opacity">About Us</Link>
              <Link to="/services" className="hover:opacity-100 transition-opacity">Services</Link>
              <Link to="/contact" className="hover:opacity-100 transition-opacity">Contact</Link>
              <Link to="/login" className="hover:opacity-100 transition-opacity">Login</Link>
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">Services</h4>
            <div className="flex flex-col gap-2 text-sm opacity-70">
              <span>Permanent Staffing</span>
              <span>Contract Staffing</span>
              <span>Executive Search</span>
              <span>HR Consulting</span>
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">Contact</h4>
            <div className="flex flex-col gap-3 text-sm opacity-70">
              <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> +91 98765 43210</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@hireedge.com</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Mumbai, India</div>
            </div>
          </div>
        </div>
        <div className="border-t border-background/10 mt-12 pt-8 text-center text-sm opacity-50">
          © 2026 HireEdge Consultancy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
