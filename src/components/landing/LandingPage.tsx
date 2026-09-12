import React, { useState, useMemo } from 'react';
import { useERP } from '../../services/erpStore';
import { NeedElectroLogo } from '../NeedElectroLogo';
import { Product, ServiceType } from '../../types';
import { 
  ArrowRight, ShieldCheck, Zap, Monitor, Cpu, Receipt, 
  CreditCard, Smartphone, Boxes, Wrench, BarChart3, Database, 
  Lock, CheckCircle2, Building2, Phone, Mail, MapPin, 
  ChevronRight, ExternalLink, Sparkles, Layers, DollarSign,
  TrendingUp, Users, RefreshCw, FileText, ArrowUpRight,
  Laptop, Tv, Camera, Wifi, Check, Star, HelpCircle,
  Clock, Calendar, MessageSquare, AlertCircle, X, Search,
  Compass, Shield, Award, HeartHandshake, ChevronDown, Menu
} from 'lucide-react';

interface LandingPageProps {
  onOpenLogin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenLogin }) => {
  const { products, services, addToast } = useERP();

  // Search & Filter State
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isServiceBookingOpen, setIsServiceBookingOpen] = useState(false);
  const [selectedServiceTitle, setSelectedServiceTitle] = useState<string>('Electrical Maintenance');

  // Service Booking Form
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingAddress, setBookingAddress] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Real Laptops from Inventory
  const laptopsList = useMemo(() => {
    return products.filter(p => 
      p.category === 'Laptop' || 
      p.category === 'Computers' || 
      p.name.toLowerCase().includes('laptop') ||
      p.name.toLowerCase().includes('hp') ||
      p.name.toLowerCase().includes('dell') ||
      p.name.toLowerCase().includes('lenovo') ||
      p.name.toLowerCase().includes('macbook')
    );
  }, [products]);

  // Filtered Products for Featured Grid
  const featuredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCat = productCategoryFilter === 'ALL' || p.category === productCategoryFilter;
      const matchesSearch = !searchKeyword.trim() || 
        p.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        p.category.toLowerCase().includes(searchKeyword.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, productCategoryFilter, searchKeyword]);

  // Handle Customer Service Booking
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingName.trim() || !bookingPhone.trim()) {
      alert('Please enter your Name and Phone Number so our technicians can contact you.');
      return;
    }

    setIsSubmittingBooking(true);
    setTimeout(() => {
      setIsSubmittingBooking(false);
      setIsServiceBookingOpen(false);
      setBookingName('');
      setBookingPhone('');
      setBookingAddress('');
      setBookingNotes('');
      addToast('success', 'Service Request Received!', `Thank you ${bookingName}. Our Moulvibazar service coordinator will call you at ${bookingPhone} within 30 minutes.`);
    }, 600);
  };

  // Structured Data Schema for Local SEO
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "NEED ELECTRO",
    "description": "Trusted Electrical and Technological Solutions in Moulvibazar. Laptops, Computers, CCTV & Security, Electrical Service, and Laptop EMI.",
    "telephone": "+8801733983752",
    "email": "needelectro23@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Shop No: 5, MR Plaza, Kusumbag",
      "addressLocality": "Moulvibazar",
      "addressRegion": "Sylhet",
      "addressCountry": "BD"
    },
    "parentOrganization": {
      "@type": "Organization",
      "name": "AMDADS GROUP"
    },
    "priceRange": "৳৳"
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#070c18',
      color: '#f8fafc',
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      overflowX: 'hidden',
      lineHeight: 1.6
    }}>
      {/* Inject SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      {/* =========================================================================
          1. CUSTOMER-SIDE STICKY EXECUTIVE HEADER
          ========================================================================= */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(7, 12, 24, 0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          maxWidth: '1320px',
          margin: '0 auto',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          {/* Logo */}
          <a href="#home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <NeedElectroLogo size="sm" showSisterConcern={true} theme="dark" />
          </a>

          {/* Navigation Links (Desktop) */}
          <nav className="desktop-nav-links" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.4rem',
            fontSize: '0.88rem',
            fontWeight: 600
          }}>
            <a href="#home" style={{ color: '#ffffff', textDecoration: 'none' }}>Home</a>
            <a href="#products" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Products</a>
            <a href="#laptops" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Laptops</a>
            <a href="#services" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Services</a>
            <a href="#cctv" style={{ color: '#cbd5e1', textDecoration: 'none' }}>CCTV & Security</a>
            <a href="#emi" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Laptop EMI</a>
            <a href="#about" style={{ color: '#cbd5e1', textDecoration: 'none' }}>About Us</a>
            <a href="#contact" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Contact</a>
          </nav>

          {/* Right Action Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {/* Phone Hotline Pill */}
            <a 
              href="tel:01733983752"
              className="hotline-pill"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#38bdf8',
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'none',
                background: 'rgba(56, 189, 248, 0.1)',
                padding: '0.4rem 0.8rem',
                borderRadius: '9999px',
                border: '1px solid rgba(56, 189, 248, 0.25)'
              }}
            >
              <Phone size={13} />
              <span>01733-983752</span>
            </a>

            {/* Mobile Hamburger Toggle Button */}
            <button
              className="mobile-hamburger-btn"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label="Toggle navigation menu"
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '0.45rem',
                cursor: 'pointer'
              }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div style={{
            backgroundColor: '#090e1a',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <a 
              href="#home" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#ffffff', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, padding: '0.3rem 0' }}
            >
              Home
            </a>
            <a 
              href="#products" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, padding: '0.3rem 0' }}
            >
              Products & Inventory
            </a>
            <a 
              href="#laptops" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, padding: '0.3rem 0' }}
            >
              Laptops & Computers
            </a>
            <a 
              href="#services" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, padding: '0.3rem 0' }}
            >
              Services & Repair
            </a>
            <a 
              href="#cctv" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, padding: '0.3rem 0' }}
            >
              CCTV & Security
            </a>
            <a 
              href="#emi" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, padding: '0.3rem 0' }}
            >
              Laptop EMI Facility
            </a>
            <a 
              href="#about" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, padding: '0.3rem 0' }}
            >
              About NEED ELECTRO
            </a>
            <a 
              href="#contact" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, padding: '0.3rem 0' }}
            >
              Contact Showroom
            </a>

            <div style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <a
                href="tel:01733983752"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, #008CFF 0%, #0055b3 100%)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  padding: '0.75rem',
                  fontWeight: 700,
                  fontSize: '0.92rem'
                }}
              >
                <Phone size={16} />
                <span>Direct Hotline: 01733-983752</span>
              </a>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
                Shop No: 5, MR Plaza, Kusumbag, Moulvibazar
              </div>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          2. HERO SECTION
          ========================================================================= */}
      <section id="home" style={{
        position: 'relative',
        padding: '5.5rem 1.5rem 5rem',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% -10%, rgba(0, 140, 255, 0.28) 0%, transparent 65%)'
      }}>
        {/* Tech Grid Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 0)',
          backgroundSize: '32px 32px',
          opacity: 0.35,
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '1180px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          {/* Trust Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.45rem 1.1rem',
            background: 'rgba(0, 140, 255, 0.12)',
            border: '1px solid rgba(0, 140, 255, 0.35)',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#38bdf8',
            marginBottom: '1.75rem',
            boxShadow: '0 4px 16px rgba(0, 140, 255, 0.2)'
          }}>
            <Sparkles size={14} />
            <span>A Sister Concern of AMDADS GROUP • Kusumbag, Moulvibazar</span>
          </div>

          {/* Main Heading */}
          <h1 style={{
            fontSize: 'clamp(2.4rem, 5.2vw, 4.4rem)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            margin: '0 auto 1.5rem',
            maxWidth: '1000px',
            color: '#ffffff'
          }}>
            Trusted <span style={{
              background: 'linear-gradient(135deg, #008CFF 0%, #38bdf8 50%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Electrical & Technological</span> Solutions
          </h1>

          {/* Supporting Text */}
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: '#94a3b8',
            maxWidth: '820px',
            margin: '0 auto 2.75rem',
            fontWeight: 400,
            lineHeight: 1.65
          }}>
            From electrical services and security solutions to laptops, computers, gadgets, and smart technology — <strong>NEED ELECTRO</strong> provides reliable solutions for modern homes, offices, and businesses in Moulvibazar and across Bangladesh.
          </p>

          {/* Action CTAs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '3.5rem'
          }}>
            <a
              href="#products"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                background: 'linear-gradient(135deg, #008CFF 0%, #0055b3 100%)',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '12px',
                padding: '0.9rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                boxShadow: '0 8px 24px rgba(0, 140, 255, 0.45)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>Explore Products</span>
              <ArrowRight size={16} />
            </a>

            <button
              onClick={() => {
                setSelectedServiceTitle('General Electrical & Tech Inquiry');
                setIsServiceBookingOpen(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '0.9rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease'
              }}
            >
              <Wrench size={16} color="#38bdf8" />
              <span>Book a Service</span>
            </button>

            <a
              href="#emi"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                background: 'linear-gradient(135deg, #002B5B 0%, #004080 100%)',
                color: '#fef08a',
                textDecoration: 'none',
                border: '1px solid rgba(254, 240, 138, 0.3)',
                borderRadius: '12px',
                padding: '0.9rem 1.8rem',
                fontSize: '0.95rem',
                fontWeight: 700
              }}
            >
              <CreditCard size={16} color="#fef08a" />
              <span>Shop on Laptop EMI</span>
            </a>
          </div>

          {/* Quick Value Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            padding: '1.5rem',
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px'
          }}>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#38bdf8' }}>100% Genuine</div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Original hardware & warranty</div>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981' }}>Certified</div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Skilled electrical technicians</div>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f59e0b' }}>Flexible EMI</div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Easy laptop installments</div>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff' }}>Moulvibazar</div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>MR Plaza, Kusumbag Showroom</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. QUICK SERVICE & PRODUCT CATEGORIES
          ========================================================================= */}
      <section style={{ padding: '4rem 1.5rem', backgroundColor: '#090f20' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#008CFF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              What We Offer
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0.3rem 0 0.6rem', color: '#ffffff' }}>
              Explore Our Solutions
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
              End-to-end electrical products, laptop sales, CCTV systems, and expert engineering services.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              {
                title: 'Laptops',
                desc: 'Business, executive, and student laptops from HP, Dell, and Lenovo.',
                icon: Laptop,
                color: '#008CFF',
                link: '#laptops'
              },
              {
                title: 'Computers',
                desc: 'Desktop computers, high-performance workstations, and custom PC setups.',
                icon: Monitor,
                color: '#38bdf8',
                link: '#products'
              },
              {
                title: 'Smartphones & Gadgets',
                desc: 'Modern smart devices, original charging accessories, and audio gear.',
                icon: Smartphone,
                color: '#ec4899',
                link: '#products'
              },
              {
                title: 'CCTV & Security',
                desc: 'Complete CCTV camera setups, DVRs, NVRs, and remote mobile monitoring.',
                icon: Camera,
                color: '#10b981',
                link: '#cctv'
              },
              {
                title: 'Electrical Products',
                desc: 'Circuit breakers, industrial wiring, switches, cables, and lighting.',
                icon: Zap,
                color: '#f59e0b',
                link: '#products'
              },
              {
                title: 'Networking Solutions',
                desc: 'Dual-band Wi-Fi routers, network switches, and corporate cabling.',
                icon: Wifi,
                color: '#8b5cf6',
                link: '#products'
              },
              {
                title: 'Electrical Services',
                desc: 'Professional commercial and home electrical wiring and diagnostics.',
                icon: Wrench,
                color: '#06b6d4',
                link: '#services'
              },
              {
                title: 'Smart Solutions',
                desc: 'Smart home switches, automated lighting, and power backup solutions.',
                icon: Sparkles,
                color: '#a855f7',
                link: '#services'
              }
            ].map(cat => {
              const IconComp = cat.icon;
              return (
                <a
                  key={cat.title}
                  href={cat.link}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1.75rem',
                    borderRadius: '20px',
                    background: 'rgba(15, 23, 42, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.25s ease'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = cat.color;
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  <div>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '14px',
                      background: `${cat.color}15`,
                      color: cat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem'
                    }}>
                      <IconComp size={24} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#ffffff' }}>
                      {cat.title}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                      {cat.desc}
                    </p>
                  </div>
                  <span style={{
                    marginTop: '1.5rem',
                    color: cat.color,
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    Explore <ArrowRight size={13} />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. FEATURED PRODUCTS (Connected to Live Database Inventory)
          ========================================================================= */}
      <section id="products" style={{ padding: '5rem 1.5rem', backgroundColor: '#070c18' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '1.5rem',
            marginBottom: '2.5rem'
          }}>
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#008CFF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Showroom Inventory
              </span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0.2rem 0 0.4rem', color: '#ffffff' }}>
                Featured Products
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
                Real products available in our Moulvibazar showroom with warranty.
              </p>
            </div>

            {/* Live Search & Category Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: '#64748b' }} />
                <input 
                  type="text"
                  placeholder="Search products..."
                  value={searchKeyword}
                  onChange={e => setSearchKeyword(e.target.value)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '0.45rem 0.85rem 0.45rem 2.1rem',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    width: '200px'
                  }}
                />
              </div>

              {['ALL', 'Laptop', 'Computers', 'Accessories', 'Electrical'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setProductCategoryFilter(cat)}
                  style={{
                    background: productCategoryFilter === cat ? '#008CFF' : 'rgba(255, 255, 255, 0.06)',
                    color: productCategoryFilter === cat ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {featuredProducts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'rgba(15, 23, 42, 0.5)',
              borderRadius: '20px',
              border: '1px dashed rgba(255, 255, 255, 0.15)',
              color: '#94a3b8'
            }}>
              <Boxes size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.25rem', color: '#ffffff', margin: '0 0 0.5rem' }}>No Products Found</h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Try clearing your search or category filter.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.75rem'
            }}>
              {featuredProducts.slice(0, 8).map(prod => (
                <div
                  key={prod.id}
                  style={{
                    borderRadius: '20px',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <div>
                    {/* Image / Graphic Display */}
                    <div style={{
                      height: '160px',
                      borderRadius: '14px',
                      background: 'rgba(2, 6, 23, 0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      {prod.imageUrl ? (
                        <img 
                          src={prod.imageUrl} 
                          alt={prod.name} 
                          style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} 
                        />
                      ) : (
                        <Laptop size={54} color="#008CFF" style={{ opacity: 0.7 }} />
                      )}

                      {/* Stock Badge */}
                      <span style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: prod.currentStock > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: prod.currentStock > 0 ? '#34d399' : '#f87171',
                        border: `1px solid ${prod.currentStock > 0 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '9999px'
                      }}>
                        {prod.currentStock > 0 ? 'In Stock' : 'Pre-Order'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
                      {prod.brand || 'Original'} • {prod.category}
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0.35rem 0 0.5rem', color: '#ffffff' }}>
                      {prod.name}
                    </h3>

                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                      {prod.model || prod.description || 'Reliable commercial hardware.'}
                    </p>
                  </div>

                  <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Price</span>
                        <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#38bdf8' }}>
                          ৳{(Number(prod.retailPrice) || 0).toLocaleString()}
                        </div>
                      </div>

                      {/* EMI pill if laptop */}
                      {(prod.category === 'Laptop' || prod.name.toLowerCase().includes('laptop')) && (
                        <span style={{
                          fontSize: '0.72rem',
                          background: 'rgba(254, 240, 138, 0.1)',
                          color: '#fef08a',
                          border: '1px solid rgba(254, 240, 138, 0.25)',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          fontWeight: 700
                        }}>
                          EMI Available
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => setSelectedProduct(prod)}
                        style={{
                          flex: 1,
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '10px',
                          padding: '0.6rem',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        View Details
                      </button>

                      <a
                        href="tel:01733983752"
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #008CFF 0%, #0055b3 100%)',
                          color: '#ffffff',
                          borderRadius: '10px',
                          padding: '0.6rem',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          textAlign: 'center',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        Order / Call
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          5. DEDICATED LAPTOP SECTION
          ========================================================================= */}
      <section id="laptops" style={{ padding: '5rem 1.5rem', backgroundColor: '#090f20' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#008CFF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Computing Solutions
            </span>
            <h2 style={{ fontSize: '2.3rem', fontWeight: 900, margin: '0.3rem 0 0.6rem', color: '#ffffff' }}>
              Find the Right Laptop for You
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
              Business, student, and high-performance laptops tested and certified by NEED ELECTRO engineers.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.75rem'
          }}>
            {(laptopsList.length > 0 ? laptopsList.slice(0, 6) : [
              { id: 'l1', name: 'HP EliteBook 840 G6', brand: 'HP', retailPrice: 34500, model: 'Core i5 8th Gen, 8GB RAM, 256GB SSD', category: 'Laptop', currentStock: 3 },
              { id: 'l2', name: 'Dell Latitude 7490', brand: 'Dell', retailPrice: 33000, model: 'Core i5 8th Gen, 8GB RAM, 256GB SSD', category: 'Laptop', currentStock: 2 },
              { id: 'l3', name: 'Lenovo ThinkPad T480', brand: 'Lenovo', retailPrice: 36000, model: 'Core i5 8th Gen, 16GB RAM, 256GB SSD', category: 'Laptop', currentStock: 4 }
            ]).map((laptop: any) => (
              <div
                key={laptop.id}
                style={{
                  borderRadius: '20px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(0, 140, 255, 0.2)',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                      {laptop.brand || 'Laptop'}
                    </span>
                    <span style={{
                      background: 'rgba(254, 240, 138, 0.15)',
                      color: '#fef08a',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      EMI Available
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0 0 0.5rem', color: '#ffffff' }}>
                    {laptop.name}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                    {laptop.model || 'High durability commercial business laptop with genuine battery backup.'}
                  </p>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.6rem',
                    background: 'rgba(2, 6, 23, 0.5)',
                    padding: '0.85rem',
                    borderRadius: '12px',
                    fontSize: '0.78rem',
                    color: '#94a3b8'
                  }}>
                    <div>⚡ <strong>CPU:</strong> Intel Core i5/i7</div>
                    <div>💾 <strong>RAM:</strong> 8GB / 16GB</div>
                    <div>🚀 <strong>SSD:</strong> 256GB / 512GB</div>
                    <div>🛡️ <strong>Warranty:</strong> Service Cover</div>
                  </div>
                </div>

                <div style={{ marginTop: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Showroom Price</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff' }}>
                      ৳{Number(laptop.retailPrice).toLocaleString()}
                    </div>
                  </div>

                  <a
                    href="tel:01733983752"
                    style={{
                      background: 'linear-gradient(135deg, #008CFF 0%, #0055b3 100%)',
                      color: '#ffffff',
                      textDecoration: 'none',
                      padding: '0.65rem 1.25rem',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      fontWeight: 700
                    }}
                  >
                    Check Availability
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. ELECTRICAL & TECHNOLOGY SERVICES
          ========================================================================= */}
      <section id="services" style={{ padding: '5rem 1.5rem', backgroundColor: '#070c18' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#008CFF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Engineering & Support
            </span>
            <h2 style={{ fontSize: '2.3rem', fontWeight: 900, margin: '0.3rem 0 0.6rem', color: '#ffffff' }}>
              Professional Services You Can Trust
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
              Certified electricians and technicians for homes, commercial showrooms, and offices.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              { title: 'Electrical Installation', desc: 'Complete building wiring, sub-station connections, and power distribution boards.', icon: Zap },
              { title: 'Electrical Maintenance', desc: 'Periodic safety audits, load balancing, short-circuit diagnostics, and switchgear upkeep.', icon: ShieldCheck },
              { title: 'Home Electrical Work', desc: 'Fast electrician dispatch for fans, lighting, circuit breakers, and inverter wiring.', icon: Building2 },
              { title: 'Office Electrical Work', desc: 'Corporate power infrastructure, UPS server connections, and LED panel setups.', icon: Layers },
              { title: 'CCTV Installation', desc: 'High-definition night vision IP/analog camera setup with smartphone live view.', icon: Camera },
              { title: 'CCTV Maintenance', desc: 'DVR repairs, camera realignment, hard disk replacement, and cabling troubleshooting.', icon: Wrench },
              { title: 'Networking Setup', desc: 'Cat6 structured cabling, enterprise Wi-Fi mesh, router config, and server rack setup.', icon: Wifi },
              { title: 'Computer/Laptop Support', desc: 'OS installation, chip-level motherboard repair, display change, and thermal repasting.', icon: Laptop },
              { title: 'Smart Device Setup', desc: 'Smart switches, video doorbells, IoT smart home sensors, and app integrations.', icon: Sparkles },
              { title: 'Emergency Electrical Service', desc: 'Urgent emergency response for power outages, burning smells, and tripped breakers.', icon: Clock }
            ].map(svc => (
              <div
                key={svc.title}
                style={{
                  borderRadius: '18px',
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(0, 140, 255, 0.15)',
                    color: '#008CFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}>
                    <svc.icon size={22} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.4rem', color: '#ffffff' }}>
                    {svc.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                    {svc.desc}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedServiceTitle(svc.title);
                    setIsServiceBookingOpen(true);
                  }}
                  style={{
                    marginTop: '1.25rem',
                    background: 'rgba(0, 140, 255, 0.1)',
                    color: '#38bdf8',
                    border: '1px solid rgba(0, 140, 255, 0.3)',
                    borderRadius: '8px',
                    padding: '0.55rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  Book Service <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. CCTV & SECURITY SECTION
          ========================================================================= */}
      <section id="cctv" style={{
        padding: '5rem 1.5rem',
        background: 'linear-gradient(135deg, #071329 0%, #002B5B 100%)',
        borderTop: '1px solid rgba(0, 140, 255, 0.2)',
        borderBottom: '1px solid rgba(0, 140, 255, 0.2)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Total Surveillance & Peace of Mind
              </span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900, margin: '0.4rem 0 1rem', color: '#ffffff', lineHeight: 1.2 }}>
                Secure Your Home & Business with Intelligent CCTV
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6, margin: '0 0 1.75rem' }}>
                NEED ELECTRO provides complete surveillance packages for homes, retail shops, factories, and schools in Moulvibazar. Watch crystal-clear live video from anywhere in the world on your smartphone.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                {[
                  'Full Color Night Vision & 2K / 4K Resolution',
                  'Remote Smartphone View (iOS & Android)',
                  'Motion Detection, Human Tracking & Siren Alerts',
                  'Professional Concealed Cabling with 1-Year Service Warranty'
                ].map((pt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.92rem', color: '#f1f5f9' }}>
                    <div style={{ background: '#10b981', color: '#ffffff', borderRadius: '50%', padding: '2px', display: 'flex' }}>
                      <Check size={12} />
                    </div>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setSelectedServiceTitle('CCTV Installation & Security');
                    setIsServiceBookingOpen(true);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #008CFF 0%, #0055b3 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.85rem 1.8rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(0, 140, 255, 0.4)'
                  }}
                >
                  Get a CCTV Solution
                </button>

                <a
                  href="tel:01733983752"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '12px',
                    padding: '0.85rem 1.8rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Phone size={15} /> Call CCTV Specialist
                </a>
              </div>
            </div>

            {/* Visual Box */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '24px',
              padding: '2.5rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <Camera size={64} color="#38bdf8" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.4rem' }}>
                  Popular 4-Camera CCTV Package
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                  Ideal for homes, pharmacies, grocery stores & showrooms
                </p>
              </div>

              <div style={{
                background: 'rgba(2, 6, 23, 0.6)',
                padding: '1.25rem',
                borderRadius: '14px',
                marginBottom: '1.5rem',
                fontSize: '0.86rem',
                color: '#cbd5e1',
                lineHeight: 1.6
              }}>
                • 4x 2MP Night Color Cameras (Hikvision / Dahua)<br />
                • 1x 4-Channel DVR with Cloud Access<br />
                • 1x 500GB / 1TB Surveillance Hard Disk<br />
                • Power Supply, BNC Connectors & Professional Installation
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Starting Package Price</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#38bdf8', margin: '0.2rem 0 1rem' }}>
                  ৳14,500 <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 400 }}>approx</span>
                </div>
                <a
                  href="tel:01733983752"
                  style={{
                    display: 'block',
                    background: '#10b981',
                    color: '#ffffff',
                    textDecoration: 'none',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}
                >
                  Book Site Survey Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. CUSTOMER-FACING EMI PROMOTION
          ========================================================================= */}
      <section id="emi" style={{ padding: '5rem 1.5rem', backgroundColor: '#090f20' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Flexible Financing
          </span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 900, margin: '0.3rem 0 0.6rem', color: '#ffffff' }}>
            Get Your Laptop with Easy EMI
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '750px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            Choose your laptop and make your purchase easier with NEED ELECTRO's EMI facility. No complicated paperwork — straightforward terms for professionals and students.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
            textAlign: 'left',
            marginBottom: '3rem'
          }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '18px', padding: '1.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', fontWeight: 800 }}>
                1
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem' }}>Select Laptop</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                Pick from our certified HP, Dell, or Lenovo laptops eligible for monthly installment plans.
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '18px', padding: '1.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', fontWeight: 800 }}>
                2
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem' }}>Down Payment</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                Pay a small down payment upfront at our Kusumbag showroom and agree on the duration.
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '18px', padding: '1.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', fontWeight: 800 }}>
                3
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem' }}>Monthly Installments</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                Clear your monthly installment conveniently via bKash, bank transfer, or cash drawer.
              </p>
            </div>
          </div>

          <a
            href="#laptops"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '12px',
              padding: '0.85rem 2rem',
              fontSize: '0.95rem',
              fontWeight: 700
            }}
          >
            <span>View EMI Laptops</span>
            <ArrowRight size={15} />
          </a>
        </div>
      </section>

      {/* =========================================================================
          9. WHY CHOOSE NEED ELECTRO (TRUST SECTION)
          ========================================================================= */}
      <section style={{ padding: '5rem 1.5rem', backgroundColor: '#070c18' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#008CFF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              The NEED ELECTRO Advantage
            </span>
            <h2 style={{ fontSize: '2.3rem', fontWeight: 900, margin: '0.3rem 0 0.6rem', color: '#ffffff' }}>
              Why Choose NEED ELECTRO?
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
              Backed by AMDADS GROUP with transparent pricing and verified engineering standards.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.75rem'
          }}>
            {[
              { title: 'Trusted Products', desc: '100% genuine electrical gear, original branded laptops, and authentic parts with warranty.', icon: Award },
              { title: 'Professional Service', desc: 'Skilled electrical technicians and computer hardware specialists ready to serve on-site.', icon: Wrench },
              { title: 'Transparent Pricing', desc: 'Clear and customer-friendly billing with official tax receipts and zero hidden charges.', icon: DollarSign },
              { title: 'Fast Local Support', desc: 'Showroom in Kusumbag, Moulvibazar for immediate physical support, repairs, and pickup.', icon: Clock },
              { title: 'EMI Facility', desc: 'Flexible laptop purchasing options empowering students, freelancing professionals, and businesses.', icon: CreditCard },
              { title: 'Complete Solutions', desc: 'Products, installation, cabling, maintenance, and IT support all handled under one roof.', icon: ShieldCheck }
            ].map(card => (
              <div
                key={card.title}
                style={{
                  padding: '1.75rem',
                  borderRadius: '20px',
                  background: 'rgba(15, 23, 42, 0.55)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(0, 140, 255, 0.12)',
                  color: '#008CFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}>
                  <card.icon size={22} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.4rem', color: '#ffffff' }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          10. ABOUT NEED ELECTRO & AMDADS GROUP
          ========================================================================= */}
      <section id="about" style={{
        padding: '5rem 1.5rem',
        backgroundColor: '#090f20',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Corporate Background
              </span>
              <h2 style={{ fontSize: '2.3rem', fontWeight: 900, margin: '0.3rem 0 1rem', color: '#ffffff', lineHeight: 1.2 }}>
                Powering Homes, Offices & Businesses
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.65, margin: '0 0 1rem' }}>
                <strong>NEED ELECTRO</strong> is a technology-driven electrical and gadget ecosystem providing electrical services, technology products, laptops, computers, CCTV, networking, smart devices and professional technical solutions.
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.65, margin: '0 0 1.5rem' }}>
                As a proud sister concern of <strong>AMDADS GROUP</strong>, we combine high-quality products and verified services under one roof to make technology and electrical solutions safer, easier, and more accessible in Moulvibazar and beyond.
              </p>

              <div style={{
                display: 'flex',
                gap: '1.5rem',
                flexWrap: 'wrap',
                padding: '1.25rem 0',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '1.75rem'
              }}>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#008CFF' }}>Service</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Certified technicians</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981' }}>Product</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Genuine hardware</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f59e0b' }}>Technology</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Modern gadgets</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#8b5cf6' }}>Support</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Dedicated aftersales</div>
                </div>
              </div>

              <a
                href="#contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#38bdf8',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                Learn More & Visit Showroom <ArrowRight size={14} />
              </a>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 43, 91, 0.5) 0%, rgba(0, 140, 255, 0.2) 100%)',
              border: '1px solid rgba(0, 140, 255, 0.3)',
              borderRadius: '24px',
              padding: '2.5rem',
              textAlign: 'center'
            }}>
              <NeedElectroLogo size="md" showSisterConcern={true} theme="dark" />
              <div style={{ margin: '1.5rem 0', fontSize: '0.9rem', color: '#cbd5e1' }}>
                <strong>Showroom Address:</strong><br />
                Shop No: 5, MR Plaza, Kusumbag,<br />
                Moulvibazar, Bangladesh
              </div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                Open 6 Days a Week: 10:00 AM – 9:00 PM
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          11. CUSTOMER REVIEWS / TESTIMONIALS
          ========================================================================= */}
      <section style={{ padding: '5rem 1.5rem', backgroundColor: '#070c18' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#008CFF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Feedback
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0.3rem 0 0.5rem', color: '#ffffff' }}>
              What Our Customers Say
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
              Trusted by hundreds of homeowners and business managers in Moulvibazar.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              {
                name: 'Trust Computer',
                role: 'Commercial Client',
                comment: 'Got multiple business laptops and computer parts. Excellent condition, genuine batteries, and very reliable warranty service.',
                stars: 5
              },
              {
                name: 'Fahimd Farhan',
                role: 'Laptop Customer',
                comment: 'Bought an HP Core i5 laptop through their easy monthly installment system. Clean documentation and great after-sales support.',
                stars: 5
              },
              {
                name: 'Showroom Owner, Kusumbag',
                role: 'CCTV Client',
                comment: 'Installed 8 CCTV cameras for our multi-story commercial shop. Clean cabling and crystal-clear night view on our mobile phones.',
                stars: 5
              }
            ].map((rev, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '18px',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '3px', marginBottom: '1rem', color: '#f59e0b' }}>
                    {[...Array(rev.stars)].map((_, s) => (
                      <Star key={s} size={15} fill="#f59e0b" />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                    "{rev.comment}"
                  </p>
                </div>
                <div style={{ marginTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.85rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#ffffff' }}>{rev.name}</div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>{rev.role} • Moulvibazar</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          12. CUSTOMER FAQ SECTION
          ========================================================================= */}
      <section style={{ padding: '5rem 1.5rem', backgroundColor: '#090f20' }}>
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#008CFF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Common Questions
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0.3rem 0 0.5rem', color: '#ffffff' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
              Everything you need to know about our products, services, and showroom.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              {
                q: 'What products does NEED ELECTRO sell?',
                a: 'We sell business and consumer laptops (HP, Dell, Lenovo, Apple), desktop computers, CCTV surveillance equipment, routers, networking cables, commercial electrical switchgear, circuit breakers, smart home switches, and essential accessories.'
              },
              {
                q: 'Do you provide laptop EMI (Monthly Installments)?',
                a: 'Yes! We offer a convenient laptop EMI installment facility for students, freelancers, and businesses. You provide a standard down payment at our Kusumbag showroom and pay the rest in easy monthly installments.'
              },
              {
                q: 'Do you provide CCTV camera installation and maintenance?',
                a: 'Yes, we provide end-to-end CCTV installation for homes, offices, schools, and commercial stores in Moulvibazar. We install night-vision IP/analog cameras and configure smartphone live viewing.'
              },
              {
                q: 'Do you provide home electrical services and electrician booking?',
                a: 'Yes! Our certified electricians can visit your home or office for electrical wiring, switchboard fixing, breaker trips, fan/light installation, and safety checks.'
              },
              {
                q: 'Where is the NEED ELECTRO showroom located?',
                a: 'Our central showroom is located at Shop No: 5, MR Plaza, Kusumbag, Moulvibazar, Bangladesh.'
              },
              {
                q: 'Do you provide services outside Moulvibazar city?',
                a: 'Yes, for commercial projects, CCTV setups, and sub-station installations, our engineering team travels to surrounding upazilas including Sreemangal, Kulaura, Rajnagar, and Kamalganj.'
              },
              {
                q: 'How can I contact NEED ELECTRO for emergency support?',
                a: 'You can call our direct customer hotline at 01733-983752 or email us at needelectro23@gmail.com. We respond promptly.'
              }
            ].map((faq, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.98rem',
                    fontWeight: 700,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown 
                    size={18} 
                    color="#38bdf8"
                    style={{
                      transform: openFaqIndex === i ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }} 
                  />
                </button>

                {openFaqIndex === i && (
                  <div style={{
                    padding: '0 1.5rem 1.25rem',
                    color: '#94a3b8',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          13. CONTACT & LOCATION SECTION
          ========================================================================= */}
      <section id="contact" style={{ padding: '5rem 1.5rem', backgroundColor: '#070c18' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem'
          }}>
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#008CFF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Get In Touch
              </span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900, margin: '0.3rem 0 1rem', color: '#ffffff' }}>
                Visit Our Showroom or Call Today
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 2rem' }}>
                Whether you need a new laptop, electrical consultation, CCTV proposal, or emergency support, our friendly team in Kusumbag is ready to help.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(0, 140, 255, 0.15)', color: '#008CFF', padding: '0.75rem', borderRadius: '12px' }}>
                    <MapPin size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '1rem' }}>Showroom Address</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '2px' }}>
                      Shop No: 5, MR Plaza, Kusumbag, Moulvibazar, Bangladesh
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.75rem', borderRadius: '12px' }}>
                    <Phone size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '1rem' }}>Phone / WhatsApp</div>
                    <a href="tel:01733983752" style={{ color: '#38bdf8', fontSize: '0.92rem', textDecoration: 'none', display: 'block', marginTop: '2px', fontWeight: 700 }}>
                      01733-983752
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', padding: '0.75rem', borderRadius: '12px' }}>
                    <Mail size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '1rem' }}>Official Email</div>
                    <a href="mailto:needelectro23@gmail.com" style={{ color: '#38bdf8', fontSize: '0.92rem', textDecoration: 'none', display: 'block', marginTop: '2px' }}>
                      needelectro23@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2.25rem' }}>
                <a
                  href="tel:01733983752"
                  style={{
                    background: 'linear-gradient(135deg, #008CFF 0%, #0055b3 100%)',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '10px',
                    padding: '0.75rem 1.5rem',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}
                >
                  Call Now
                </a>

                <a
                  href="https://wa.me/8801733983752"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '10px',
                    padding: '0.75rem 1.5rem',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}
                >
                  WhatsApp Us
                </a>
              </div>
            </div>

            {/* Quick Contact & Inquiry Form */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '2.5rem'
            }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.5rem' }}>
                Send Us a Message
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 1.5rem' }}>
                Leave your query and our team will get in touch with you directly.
              </p>

              <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Your Full Name *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Tanvir Ahmed"
                    value={bookingName}
                    onChange={e => setBookingName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      background: 'rgba(2, 6, 23, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Phone Number *
                  </label>
                  <input 
                    type="tel" 
                    required
                    placeholder="01700-000000"
                    value={bookingPhone}
                    onChange={e => setBookingPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      background: 'rgba(2, 6, 23, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Interested Service / Product
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. HP Laptop EMI, CCTV 4-Cam package, Electrical wiring..."
                    value={bookingNotes}
                    onChange={e => setBookingNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      background: 'rgba(2, 6, 23, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  style={{
                    marginTop: '0.5rem',
                    background: 'linear-gradient(135deg, #008CFF 0%, #0055b3 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.85rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {isSubmittingBooking ? 'Submitting...' : 'Send Inquiry'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          14. CUSTOMER-FACING FOOTER
          ========================================================================= */}
      <footer style={{
        backgroundColor: '#050912',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '4rem 1.5rem 2rem',
        fontSize: '0.88rem'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem'
          }}>
            {/* Col 1: Brand */}
            <div>
              <NeedElectroLogo size="sm" showSisterConcern={true} theme="dark" />
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6, margin: '1rem 0 1.25rem' }}>
                Trusted Electrical and Technological Solutions in Moulvibazar. Laptops, CCTV security, electrical engineering, and laptop EMI.
              </p>
              <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700 }}>
                A Sister Concern of AMDADS GROUP
              </div>
            </div>

            {/* Col 2: Products */}
            <div>
              <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem', marginBottom: '1rem' }}>
                Products
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                <a href="#laptops" style={{ color: 'inherit', textDecoration: 'none' }}>Business Laptops</a>
                <a href="#products" style={{ color: 'inherit', textDecoration: 'none' }}>Desktop Computers</a>
                <a href="#cctv" style={{ color: 'inherit', textDecoration: 'none' }}>CCTV & Security Cameras</a>
                <a href="#products" style={{ color: 'inherit', textDecoration: 'none' }}>Electrical Switchgear</a>
                <a href="#products" style={{ color: 'inherit', textDecoration: 'none' }}>Wi-Fi Routers & Cabling</a>
              </div>
            </div>

            {/* Col 3: Services */}
            <div>
              <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem', marginBottom: '1rem' }}>
                Services
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                <a href="#services" style={{ color: 'inherit', textDecoration: 'none' }}>Electrical Installation</a>
                <a href="#services" style={{ color: 'inherit', textDecoration: 'none' }}>Home Electrical Maintenance</a>
                <a href="#cctv" style={{ color: 'inherit', textDecoration: 'none' }}>CCTV Setup & Mobile Link</a>
                <a href="#services" style={{ color: 'inherit', textDecoration: 'none' }}>Laptop Repair & Upgrades</a>
                <a href="#services" style={{ color: 'inherit', textDecoration: 'none' }}>Office Network Structured Cabling</a>
              </div>
            </div>

            {/* Col 4: Company & Info */}
            <div>
              <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem', marginBottom: '1rem' }}>
                Company & Info
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                <a href="#about" style={{ color: 'inherit', textDecoration: 'none' }}>About NEED ELECTRO</a>
                <a href="#emi" style={{ color: 'inherit', textDecoration: 'none' }}>Laptop EMI Guidelines</a>
                <a href="#faq" style={{ color: 'inherit', textDecoration: 'none' }}>Customer FAQs</a>
                <a href="#contact" style={{ color: 'inherit', textDecoration: 'none' }}>Contact Showroom</a>
              </div>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '1.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            color: '#64748b',
            fontSize: '0.8rem'
          }}>
            <div>
              © {new Date().getFullYear()} NEED ELECTRO. All Rights Reserved. A Sister Concern of AMDADS GROUP.
            </div>
            <div>
              Shop No: 5, MR Plaza, Kusumbag, Moulvibazar • 01733-983752
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          INTERACTIVE SERVICE BOOKING MODAL
          ========================================================================= */}
      {isServiceBookingOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(0, 140, 255, 0.4)',
            borderRadius: '24px',
            maxWidth: '520px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
            position: 'relative'
          }}>
            <button
              onClick={() => setIsServiceBookingOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>
                Service Request
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', margin: '0.2rem 0' }}>
                {selectedServiceTitle}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                Our Moulvibazar coordinator will review your request and call you immediately.
              </p>
            </div>

            <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Rafiqul Islam"
                  value={bookingName}
                  onChange={e => setBookingName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(2, 6, 23, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Mobile Phone Number *
                </label>
                <input 
                  type="tel"
                  required
                  placeholder="01700-000000"
                  value={bookingPhone}
                  onChange={e => setBookingPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(2, 6, 23, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Address / Site Location in Moulvibazar
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Kusumbag, Court Road, Sreemangal Road..."
                  value={bookingAddress}
                  onChange={e => setBookingAddress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(2, 6, 23, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Issue Description or Preferred Time
                </label>
                <textarea 
                  rows={2}
                  placeholder="Describe your device problem or electrical issue..."
                  value={bookingNotes}
                  onChange={e => setBookingNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(2, 6, 23, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsServiceBookingOpen(false)}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  style={{
                    flex: 2,
                    background: 'linear-gradient(135deg, #008CFF 0%, #0055b3 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {isSubmittingBooking ? 'Submitting...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          PRODUCT DETAILS MODAL
          ========================================================================= */}
      {selectedProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(0, 140, 255, 0.4)',
            borderRadius: '24px',
            maxWidth: '560px',
            width: '100%',
            padding: '2.25rem',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedProduct(null)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <div style={{
              height: '180px',
              borderRadius: '16px',
              background: 'rgba(2, 6, 23, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              overflow: 'hidden'
            }}>
              {selectedProduct.imageUrl ? (
                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
              ) : (
                <Laptop size={64} color="#008CFF" style={{ opacity: 0.8 }} />
              )}
            </div>

            <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>
              {selectedProduct.brand || 'Brand'} • {selectedProduct.category}
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', margin: '0.3rem 0 0.5rem' }}>
              {selectedProduct.name}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
              {selectedProduct.description || selectedProduct.model || 'Verified commercial electronics hardware available in our Moulvibazar showroom.'}
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(2, 6, 23, 0.5)',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1.5rem'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Selling Price</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#38bdf8' }}>
                  ৳{(Number(selectedProduct.retailPrice) || 0).toLocaleString()}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Showroom Stock</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: selectedProduct.currentStock > 0 ? '#34d399' : '#f87171' }}>
                  {selectedProduct.currentStock > 0 ? `${selectedProduct.currentStock} Units Available` : 'Pre-Order Available'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a
                href="tel:01733983752"
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #008CFF 0%, #0055b3 100%)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Phone size={15} /> Call 01733-983752
              </a>

              <a
                href={`https://wa.me/8801733983752?text=Hello%20Need%20Electro,%20I%20am%20interested%20in%20${encodeURIComponent(selectedProduct.name)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  background: '#10b981',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                WhatsApp Inquiry
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
