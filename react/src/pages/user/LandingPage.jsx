import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiAirplay,
  FiHome,
  FiMapPin,
  FiCalendar,
  FiUsers,
  FiStar,
  FiChevronRight,
  FiArrowRight,
  FiCheckCircle,
  FiGlobe,
  FiAward,
  FiTrendingUp,
  FiHeadphones,
  FiMail,
  FiPhone,
  FiMap,
  FiTwitter,
  FiFacebook,
  FiInstagram,
  FiLinkedin,
  FiMenu,
  FiX,
  FiClock,
  FiBriefcase,
  FiShield,
  FiCompass,
  FiDollarSign,
  FiHeart,
  FiZap,
  FiSend,
  FiUser,
  FiMessageCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { GiAirplaneDeparture } from 'react-icons/gi';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const heroVideoRef = useRef(null);
  const servicesVideoRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Animation on scroll observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const testimonials = [
    {
      name: 'Captain James Wilson',
      role: 'Frequent Flyer (2M+ miles)',
      image: 'https://randomuser.me/api/portraits/men/44.jpg',
      content: 'As someone who flies over 200,000 miles annually, 123RESERVE has become my go-to platform. The booking process is seamless and the rewards are unmatched.',
      rating: 5
    },
    {
      name: 'Sarah Mitchell',
      role: 'Business Traveler',
      image: 'https://randomuser.me/api/portraits/women/32.jpg',
      content: 'The ability to compare airlines, cabin classes, and get the best deals in real-time has saved me thousands on business class flights.',
      rating: 5
    },
    {
      name: 'David Chen',
      role: 'Aviation Enthusiast',
      image: 'https://randomuser.me/api/portraits/men/68.jpg',
      content: 'The attention to detail in flight information, seat maps, and airline partnerships makes this platform a must for any serious traveler.',
      rating: 5
    },
  ];
  
  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);
  
  const flightServices = [
    { icon: FiCompass, title: 'Flight Route Planning', description: 'Smart algorithms find you the most efficient flight paths and connections.' },
    { icon: FiDollarSign, title: 'Best Price Guarantee', description: 'We monitor millions of fares to ensure you get the lowest price possible.' },
    { icon: FiShield, title: 'Secure Booking', description: 'Enterprise-grade security protects your payments and personal data.' },
    { icon: FiClock, title: '24/7 Flight Support', description: 'Round-the-clock customer service for all your travel needs.' },
    { icon: FiHeart, title: 'Loyalty Rewards', description: 'Earn miles on every booking and unlock exclusive perks.' },
    { icon: FiZap, title: 'Instant Confirmation', description: 'Get your e-tickets delivered instantly after booking.' },
  ];
  
  const cabinClasses = [
    { id: 'economy', name: 'Economy Class', price: 'Best Deals', features: ['Standard Seat', 'Meal Service', 'Entertainment', '1 Carry-on'], icon: FiUsers },
    { id: 'premium', name: 'Premium Economy', price: 'Extra Comfort', features: ['Extra Legroom', 'Priority Boarding', 'Premium Meals', '2 Checked Bags'], icon: FiTrendingUp },
    { id: 'business', name: 'Business Class', price: 'Luxury Travel', features: ['Lie-Flat Seats', 'Lounge Access', 'Gourmet Dining', 'Fast Track'], icon: FiStar },
    { id: 'first', name: 'First Class', price: 'Ultimate Luxury', features: ['Private Suite', 'Chauffeur Service', 'Fine Dining', 'Spa Access'], icon: FiAward },
  ];

  const navItems = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about' },
    { name: 'Services', id: 'services' },
    { name: 'Cabins', id: 'cabins' },
    { name: 'Testimonials', id: 'testimonials' },
    { name: 'Contact', id: 'contact' }
  ];

  const handleSmoothScroll = (id) => {
    setIsMenuOpen(false);
    // Small delay to let menu close animation start before scrolling
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.subject.trim()) errors.subject = 'Subject is required';
    if (!formData.message.trim()) errors.message = 'Message is required';
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      setFormData({ name: '', email: '', subject: '', message: '' });
    } else {
      setFormErrors(errors);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] overflow-x-hidden">

      <div
        className={`fixed inset-0 z-9999 md:hidden transition-all duration-300 ${
          isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-[#0A0E1A]/80 backdrop-blur-sm transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Slide-in panel from the right */}
        <div
          className={`absolute top-0 right-0 h-full w-4/5 max-w-xs bg-[#0D1220] border-l border-[#C9A84C]/20 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#252E44]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#C9A84C] rounded-lg flex items-center justify-center">
                <FiAirplay className="text-[#0A0E1A] text-base" />
              </div>
              <span className="text-base font-black tracking-wide text-[#F5F0E8]">
                123 <span className="text-[#C9A84C]">RESERVE</span>
              </span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-lg bg-[#1C2438] text-[#C9A84C] hover:bg-[#252E44] transition-colors"
              aria-label="Close menu"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-1">
            {navItems.map((item, i) => (
              <button
                key={item.name}
                onClick={() => handleSmoothScroll(item.id)}
                className="w-full text-left px-4 py-3 rounded-xl text-[#F5F0E8] hover:text-[#C9A84C] hover:bg-[#1C2438] transition-all duration-200 text-base font-medium flex items-center justify-between group"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span>{item.name}</span>
                <FiChevronRight size={16} className="text-[#8B92A5] group-hover:text-[#C9A84C] group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </nav>

          {/* CTA buttons at bottom */}
          <div className="px-6 py-6 border-t border-[#252E44] flex flex-col gap-3">
            <button
              onClick={() => { setIsMenuOpen(false); navigate('/login'); }}
              className="w-full py-3 rounded-xl text-[#C9A84C] border border-[#C9A84C]/40 hover:bg-[#C9A84C]/10 transition-all font-semibold text-sm"
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsMenuOpen(false); navigate('/register'); }}
              className="w-full py-3 bg-linear-to-r from-[#C9A84C] to-[#E8C97A] rounded-xl text-[#0A0E1A] font-bold text-sm hover:shadow-lg hover:shadow-[#C9A84C]/30 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* ─── NAVIGATION ──────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-[#0A0E1A]/95 backdrop-blur-xl border-b border-[#C9A84C]/20 py-3' : 'bg-transparent py-4 md:py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-linear-to-br from-[#C9A84C] to-[#E8C97A] rounded-lg md:rounded-xl flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-105">
                <FiAirplay className="text-[#0A0E1A] text-base md:text-xl" />
              </div>
              <div>
                <span className="text-base md:text-xl font-black tracking-wide text-[#F5F0E8]">123 </span>
                <span className="text-base md:text-xl font-black tracking-wide text-[#C9A84C]">RESERVE</span>
              </div>
            </Link>
            
            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleSmoothScroll(item.id)}
                  className="text-[#8B92A5] hover:text-[#C9A84C] transition-colors duration-300 text-sm font-medium"
                >
                  {item.name}
                </button>
              ))}
            </div>
            
            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-xl text-[#C9A84C] border border-[#C9A84C]/40 hover:bg-[#C9A84C]/10 transition-all duration-300 text-sm font-semibold"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 bg-linear-to-r from-[#C9A84C] to-[#E8C97A] rounded-xl text-[#0A0E1A] text-sm font-bold hover:shadow-lg hover:shadow-[#C9A84C]/30 transition-all duration-300"
              >
                Get Started
              </button>
            </div>
            
            {/* Hamburger — only visible on mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-[#1C2438] text-[#C9A84C] hover:bg-[#252E44] transition-colors z-[60] relative"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </nav>
      
      {/* HERO SECTION */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-10">
        <div className="absolute inset-0 z-0">
          <video
            ref={heroVideoRef}
            className="w-full h-full object-cover scale-105"
            poster="https://images.unsplash.com/photo-1542296332-2e4473faf563?w=1920&h=1080&fit=crop"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-flying-over-the-city-25870-large.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-linear-to-br from-[#0A0E1A]/90 via-[#0A0E1A]/70 to-[#0A0E1A]/40"></div>
          <div className="absolute inset-0 bg-linear-to-t from-[#0A0E1A] via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 text-center lg:text-left">
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#F5F0E8] leading-tight mb-4 md:mb-6">
                Discover the <span className="text-[#C9A84C]">Skies</span>
                <br />Book Smarter, Fly Better
              </h1>
              <p className="text-[#B0B7C8] text-base md:text-lg mb-6 md:mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Compare 1000+ airlines, find the best fares, and book your next flight with confidence. 
                Your ultimate aviation booking platform.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mb-6 md:mb-8">
                {['Best price guarantee', 'Free cancellation', 'Earn miles', '24/7 support'].map((item) => (
                  <div key={item} className="flex items-center gap-2 md:gap-3 p-1.5 md:p-2">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#C9A84C]/20 flex items-center justify-center">
                      <FiCheckCircle className="text-[#C9A84C]" size={12} />
                    </div>
                    <span className="text-[#F5F0E8] text-xs md:text-sm">{item}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 md:gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="group px-5 md:px-8 py-3 md:py-4 bg-linear
-to-r from-[#C9A84C] to-[#E8C97A] rounded-xl md:rounded-2xl text-[#0A0E1A] font-bold text-sm md:text-lg hover:shadow-2xl hover:shadow-[#C9A84C]/30 transition-all duration-300 flex items-center gap-2"
                >
                  Book Your Flight
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-5 md:px-8 py-3 md:py-4 border-2 border-[#C9A84C]/40 rounded-xl md:rounded-2xl text-[#C9A84C] font-semibold text-sm md:text-lg hover:bg-[#C9A84C]/10 transition-all duration-300 backdrop-blur-sm"
                >
                  Sign In
                </button>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start gap-4 md:gap-6 mt-8 md:mt-10">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${20 + i}.jpg`}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-[#0A0E1A]"
                      alt="User"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className="text-[#C9A84C] fill-[#C9A84C]" size={12} />
                    ))}
                    <span className="text-[#F5F0E8] font-semibold ml-2 text-sm">4.9/5</span>
                  </div>
                  <p className="text-[#8B92A5] text-xs">from 100,000+ flyers</p>
                </div>
              </div>
            </div>
            
            <div className="animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-200 hidden lg:block">
              <div className="relative">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#C9A84C]/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#E8C97A]/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <video
                    className="w-full h-auto"
                    poster="https://images.unsplash.com/photo-1542296332-2e4473faf563?w=600&h=400&fit=crop"
                    autoPlay
                    loop
                    muted
                    playsInline
                  >
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-flying-over-the-city-25870-large.mp4" type="video/mp4" />
                  </video>
                </div>
                <p className="text-center text-[#8B92A5] text-sm mt-3">Experience the joy of flying ✈️</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* ABOUT SECTION */}
      <section id="about" className="py-16 md:py-24 bg-[#0F1420] overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="animate-on-scroll opacity-0 translate-y-6 md:translate-y-0 md:-translate-x-5 transition-all duration-700 text-center lg:text-left">
              <span className="text-[#C9A84C] text-xs md:text-sm font-semibold uppercase tracking-wider">About Us</span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#F5F0E8] mt-2 mb-4 md:mb-6">
                Your Trusted Partner in Global Aviation
              </h2>
              <p className="text-[#B0B7C8] mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                Founded by aviation enthusiasts, 123RESERVE has revolutionized the way travelers book flights.
                We combine cutting-edge technology with deep industry expertise to deliver the best booking experience.
              </p>
              <p className="text-[#B0B7C8] mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                Our mission is to make air travel accessible, affordable, and enjoyable for everyone.
                With partnerships across 125+ airlines and 350+ destinations worldwide, we're committed to
                getting you where you need to go.
              </p>
              <div className="flex justify-center lg:justify-start gap-6">
                {[['1M+', 'Happy Flyers'], ['4.9★', 'Average Rating'], ['10+', 'Years Experience']].map(([val, label]) => (
                  <div key={label}>
                    <div className="text-xl md:text-2xl font-bold text-[#C9A84C]">{val}</div>
                    <div className="text-[#8B92A5] text-xs md:text-sm">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-on-scroll opacity-0 translate-y-6 md:translate-y-0 md:translate-x-5 transition-all duration-700 delay-200">
              <div className="grid grid-cols-2 gap-3 md:gap-4 w-full">
                <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop" alt="Airplane wing" className="w-full h-32 md:h-48 object-cover rounded-xl md:rounded-2xl shadow-xl" />
                <img src="https://images.unsplash.com/photo-1542296332-2e4473faf563?w=400&h=300&fit=crop" alt="Travel" className="w-full h-32 md:h-48 object-cover rounded-xl md:rounded-2xl shadow-xl mt-4 md:mt-8" />
                <img src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop" alt="Airport" className="w-full h-32 md:h-48 object-cover rounded-xl md:rounded-2xl shadow-xl" />
                <img src="https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=400&h=300&fit=crop" alt="Flight attendant" className="w-full h-32 md:h-48 object-cover rounded-xl md:rounded-2xl shadow-xl mt-4 md:mt-8" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* SERVICES SECTION */}
      <section id="services" className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            ref={servicesVideoRef}
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&h=1080&fit=crop"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-airplane-flying-over-the-city-25870-large.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#0A0E1A]/85 backdrop-blur-sm"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">
              <span className="text-[#C9A84C] text-xs md:text-sm font-semibold uppercase tracking-wider">What We Offer</span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#F5F0E8] mt-2">Premium Flight Services</h2>
              <p className="text-[#B0B7C8] mt-3 md:mt-4 max-w-2xl mx-auto text-sm md:text-base">
                Experience seamless air travel with our comprehensive range of flight services
              </p>
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {flightServices.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div
                  key={idx}
                  className="animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 bg-[#1C2438]/90 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-[#252E44] hover:border-[#C9A84C]/50 hover:-translate-y-2 group"
                  style={{ transitionDelay: `${idx * 0.1}s` }}
                >
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-[#C9A84C]/20 flex items-center justify-center mb-3 md:mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="text-[#C9A84C]" size={20} />
                  </div>
                  <h3 className="text-base md:text-xl font-bold text-[#F5F0E8] mb-1 md:mb-2">{service.title}</h3>
                  <p className="text-[#B0B7C8] text-xs md:text-sm leading-relaxed">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* CABIN CLASSES SECTION */}
      <section id="cabins" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">
              <span className="text-[#C9A84C] text-xs md:text-sm font-semibold uppercase tracking-wider">Travel in Style</span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#F5F0E8] mt-2">Choose Your Cabin Class</h2>
              <p className="text-[#8B92A5] mt-3 md:mt-4 max-w-2xl mx-auto text-sm md:text-base">
                From budget-friendly to ultra-luxury, find the perfect cabin for your journey
              </p>
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {cabinClasses.map((cabin, idx) => {
              const Icon = cabin.icon;
              return (
                <div
                  key={idx}
                  className="animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 bg-[#1C2438] rounded-xl md:rounded-2xl p-4 md:p-6 border border-[#252E44] hover:border-[#C9A84C]/50 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                  style={{ transitionDelay: `${idx * 0.1}s` }}
                  onClick={() => navigate('/user-dashboard/flights')}
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-[#C9A84C]/20 flex items-center justify-center mb-3 md:mb-4">
                    <Icon className="text-[#C9A84C]" size={20} />
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-[#F5F0E8] mb-1">{cabin.name}</h3>
                  <p className="text-[#C9A84C] text-xs md:text-sm font-semibold mb-2 md:mb-3">{cabin.price}</p>
                  <ul className="space-y-1.5 md:space-y-2">
                    {cabin.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2 text-[#8B92A5] text-xs">
                        <FiCheckCircle size={8} className="text-[#C9A84C]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-16 md:py-24 bg-[#0F1420]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">
              <span className="text-[#C9A84C] text-xs md:text-sm font-semibold uppercase tracking-wider">Testimonials</span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#F5F0E8] mt-2">What Our Flyers Say</h2>
              <p className="text-[#8B92A5] mt-3 md:mt-4 max-w-2xl mx-auto text-sm md:text-base">
                Join thousands of satisfied travelers who trust us with their journeys
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, idx) => (
                  <div key={idx} className="w-full shrink-0 px-2 md:px-4">
                    <div className="bg-[#1C2438] rounded-xl md:rounded-2xl p-6 md:p-8 border border-[#252E44] max-w-2xl mx-auto">
                      <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                        <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover" />
                        <div>
                          <h4 className="text-base md:text-lg font-bold text-[#F5F0E8]">{testimonial.name}</h4>
                          <p className="text-[#8B92A5] text-xs md:text-sm">{testimonial.role}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <FiStar key={i} className="text-[#C9A84C] fill-[#C9A84C]" size={12} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-[#F5F0E8] italic text-sm md:text-base">"{testimonial.content}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center gap-2 mt-6 md:mt-8">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                    activeTestimonial === idx ? 'w-6 md:w-8 bg-[#C9A84C]' : 'w-1.5 md:w-2 bg-[#252E44]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* CONTACT SECTION */}
      <section id="contact" className="py-16 md:py-24 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="animate-on-scroll opacity-0 translate-y-6 transition-all duration-700">
              <span className="text-[#C9A84C] text-xs md:text-sm font-semibold uppercase tracking-wider">Get In Touch</span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#F5F0E8] mt-2">Contact Our Flight Experts</h2>
              <p className="text-[#8B92A5] mt-3 md:mt-4 max-w-2xl mx-auto text-sm md:text-base">
                Have questions? We're here to help you 24/7 with your travel needs
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            <div className="animate-on-scroll opacity-0 translate-y-6 md:translate-y-0 md:-translate-x-5 transition-all duration-700">
              <div className="bg-linear
-to-br from-[#1C2438] to-[#141B2B] rounded-xl md:rounded-2xl p-5 md:p-8 border border-[#252E44] shadow-2xl">
                <h3 className="text-xl md:text-2xl font-bold text-[#F5F0E8] mb-2">Send us a message</h3>
                <p className="text-[#8B92A5] text-sm md:text-base mb-6">Fill out the form and we'll get back to you within 24 hours</p>

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your Full Name"
                      className="w-full px-4 py-3 bg-[#0F1420] border border-[#252E44] rounded-xl text-[#F5F0E8] text-sm placeholder-[#8B92A5] focus:outline-none focus:border-[#C9A84C]"
                    />
                    {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                  </div>
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email Address"
                      className="w-full px-4 py-3 bg-[#0F1420] border border-[#252E44] rounded-xl text-[#F5F0E8] text-sm placeholder-[#8B92A5] focus:outline-none focus:border-[#C9A84C]"
                    />
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Subject"
                      className="w-full px-4 py-3 bg-[#0F1420] border border-[#252E44] rounded-xl text-[#F5F0E8] text-sm placeholder-[#8B92A5] focus:outline-none focus:border-[#C9A84C]"
                    />
                    {formErrors.subject && <p className="text-red-500 text-xs mt-1">{formErrors.subject}</p>}
                  </div>
                  <div>
                    <textarea
                      name="message"
                      rows="4"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Your Message"
                      className="w-full px-4 py-3 bg-[#0F1420] border border-[#252E44] rounded-xl text-[#F5F0E8] text-sm placeholder-[#8B92A5] focus:outline-none focus:border-[#C9A84C] resize-none"
                    ></textarea>
                    {formErrors.message && <p className="text-red-500 text-xs mt-1">{formErrors.message}</p>}
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-linear
-to-r from-[#C9A84C] to-[#E8C97A] rounded-xl text-[#0A0E1A] font-bold text-sm md:text-base hover:shadow-lg hover:shadow-[#C9A84C]/30 transition-all duration-300"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>

            <div className="animate-on-scroll opacity-0 translate-y-6 md:translate-y-0 md:translate-x-5 transition-all duration-700 delay-200">
              <div className="bg-linear
-to-br from-[#1C2438] to-[#141B2B] rounded-xl md:rounded-2xl p-5 md:p-8 border border-[#252E44] shadow-2xl">
                <h3 className="text-xl md:text-2xl font-bold text-[#F5F0E8] mb-2">Contact Information</h3>
                <div className="space-y-5 mt-6">
                  {[
                    { label: 'Address', value: '123 Aviation Avenue, New York' },
                    { label: 'Email', value: 'support@123reserve.com' },
                    { label: 'Phone', value: '+1 (555) FLY-1234' },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-4 bg-[#0F1420] rounded-xl">
                      <p className="text-[#C9A84C] text-sm font-semibold">{label}</p>
                      <p className="text-[#F5F0E8] text-sm">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-linear
-to-r from-[#C9A84C]/10 to-transparent border-y border-[#C9A84C]/20">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="animate-on-scroll opacity-0 scale-95 transition-all duration-700">
            <GiAirplaneDeparture className="text-4xl md:text-5xl text-[#C9A84C] mx-auto mb-3 md:mb-4" />
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold text-[#F5F0E8] mb-3 md:mb-4">Ready for Takeoff?</h2>
            <p className="text-[#8B92A5] text-sm md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto">
              Join thousands of flyers who have discovered the easiest way to book flights. Your next adventure awaits!
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              <button
                onClick={() => navigate('/register')}
                className="px-5 md:px-8 py-2.5 md:py-4 bg-[#C9A84C] rounded-lg md:rounded-xl text-[#0A0E1A] font-bold text-sm md:text-lg hover:bg-[#E8C97A] transition-all shadow-lg hover:shadow-xl"
              >
                Find Flights
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-5 md:px-8 py-2.5 md:py-4 border border-[#C9A84C]/40 rounded-lg md:rounded-xl text-[#C9A84C] font-semibold text-sm md:text-lg hover:bg-[#C9A84C]/10 transition-all"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* FOOTER */}
      <footer className="bg-[#0A0E1A] border-t border-[#252E44] pt-12 md:pt-16 pb-6 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-[#C9A84C] rounded-lg md:rounded-xl flex items-center justify-center">
                  <FiAirplay className="text-[#0A0E1A] text-base md:text-xl" />
                </div>
                <div>
                  <span className="text-base md:text-xl font-black tracking-wide text-[#F5F0E8]">123 </span>
                  <span className="text-base md:text-xl font-black tracking-wide text-[#C9A84C]">RESERVE</span>
                </div>
              </div>
              <p className="text-[#8B92A5] text-xs md:text-sm mb-4">
                Your trusted aviation booking platform for seamless flight reservations worldwide.
              </p>
              <div className="flex justify-center sm:justify-start gap-3">
                {[FiFacebook, FiTwitter, FiInstagram, FiLinkedin].map((Icon, i) => (
                  <a key={i} href="#" className="p-1.5 md:p-2 rounded-lg bg-[#1C2438] text-[#8B92A5] hover:text-[#C9A84C] transition-colors">
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="text-[#F5F0E8] font-bold mb-3 md:mb-4 text-sm md:text-base">Quick Links</h3>
              <ul className="space-y-1.5 md:space-y-2">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <button onClick={() => handleSmoothScroll(item.id)} className="text-[#8B92A5] hover:text-[#C9A84C] transition-colors text-xs md:text-sm">
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="text-[#F5F0E8] font-bold mb-3 md:mb-4 text-sm md:text-base">Support</h3>
              <ul className="space-y-1.5 md:space-y-2">
                {['Help Center', 'Flight Status', 'Terms of Service', 'Privacy Policy'].map((link) => (
                  <li key={link}><a href="#" className="text-[#8B92A5] hover:text-[#C9A84C] transition-colors text-xs md:text-sm">{link}</a></li>
                ))}
              </ul>
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="text-[#F5F0E8] font-bold mb-3 md:mb-4 text-sm md:text-base">Contact Info</h3>
              <ul className="space-y-2 md:space-y-3">
                <li className="flex items-center justify-center sm:justify-start gap-2 md:gap-3 text-[#8B92A5] text-xs md:text-sm">
                  <FiMap size={14} className="text-[#C9A84C]" /><span>123 Aviation Ave, NY 10001</span>
                </li>
                <li className="flex items-center justify-center sm:justify-start gap-2 md:gap-3 text-[#8B92A5] text-xs md:text-sm">
                  <FiMail size={14} className="text-[#C9A84C]" /><span>support@123reserve.com</span>
                </li>
                <li className="flex items-center justify-center sm:justify-start gap-2 md:gap-3 text-[#8B92A5] text-xs md:text-sm">
                  <FiPhone size={14} className="text-[#C9A84C]" /><span>+1 (555) FLY-1234</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-6 md:pt-8 border-t border-[#252E44] text-center">
            <p className="text-[#8B92A5] text-xs md:text-sm">
              &copy; 2024 123RESERVE. All rights reserved. Your trusted aviation booking partner.
            </p>
          </div>
        </div>
      </footer>
      
      <style jsx>{`
        .animate-on-scroll {
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .animate-on-scroll.animate-in {
          opacity: 1 !important;
          transform: translateY(0) translateX(0) scale(1) !important;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;