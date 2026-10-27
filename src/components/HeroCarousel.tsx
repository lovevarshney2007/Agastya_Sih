import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Building2, 
  ArrowRight, 
  Lock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Award
} from 'lucide-react';
import { HERO_CAROUSEL_SLIDES } from '../data/carouselSlides';
import { UserRole, MainNavPage } from '../types';
import { Language } from '../data/translations';

interface HeroCarouselProps {
  onSelectRole: (role: UserRole) => void;
  onSelectNavPage: (page: MainNavPage) => void;
  language: Language;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  onSelectRole,
  onSelectNavPage,
  language
}) => {
  const isHi = language === 'HI';
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Search Bar inside Hero state
  const [searchQuery, setSearchQuery] = useState('');

  // Continuous Auto-play timer (4.5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_CAROUSEL_SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const slide = HERO_CAROUSEL_SLIDES[currentSlideIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIndex((prev) => (prev - 1 + HERO_CAROUSEL_SLIDES.length) % HERO_CAROUSEL_SLIDES.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIndex((prev) => (prev + 1) % HERO_CAROUSEL_SLIDES.length);
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchQuery.replace(/\s+/g, '');
    if (clean) {
      onSelectRole('PUBLIC_VERIFY');
      onSelectNavPage('PORTALS');
    } else {
      const el = document.getElementById('public-verification-widget');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* PART 1: TOP FULL-WIDTH LANDSCAPE IMAGE SLIDING CAROUSEL      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section 
        className="relative w-full overflow-hidden bg-slate-900 border-b dark:border-slate-800 border-slate-200 select-none group"
      >
        {/* Landscape Image Slider Viewport */}
        <div className="relative w-full h-[220px] sm:h-[320px] md:h-[420px] lg:h-[480px] bg-slate-950 flex items-center justify-center overflow-hidden">
          {HERO_CAROUSEL_SLIDES.map((s, idx) => (
            <div
              key={s.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                idx === currentSlideIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Pure Landscape Image Without any Overlay Text */}
              <img 
                src={s.imageLandscapeUrl} 
                alt="AICTE Official Banner"
                className="w-full h-full object-cover object-center"
              />
            </div>
          ))}

          {/* Left / Right Carousel Controls - Hidden by default, visible only on hover / interaction */}
          <button
            onClick={handlePrev}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/30 transition-all cursor-pointer shadow-xl opacity-0 group-hover:opacity-100 focus:opacity-100 duration-300 hover:scale-110"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/30 transition-all cursor-pointer shadow-xl opacity-0 group-hover:opacity-100 focus:opacity-100 duration-300 hover:scale-110"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Slider Indicators Bottom-Center - Subtle and elegant */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 opacity-70 group-hover:opacity-100 transition-opacity">
            {HERO_CAROUSEL_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`h-2 sm:h-2.5 rounded-full transition-all cursor-pointer ${
                  currentSlideIndex === idx 
                    ? 'w-7 sm:w-9 bg-[#FF9933]' 
                    : 'w-2 sm:w-2.5 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* PART 2: MAIN HERO EXECUTIVE SECTION WITH EXPANDED TEXT SIZES  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden border-b dark:border-slate-800 border-slate-200 transition-colors bg-gradient-to-b from-[#FFFDF9] via-[#F6FAFF] to-white dark:from-[#0B1528] dark:via-[#0E1F3D] dark:to-[#0B1120]">
        
        {/* Decorative Ambience */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-amber-400/15 via-transparent to-emerald-400/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/15 via-transparent to-amber-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Content Container */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            
            {/* LEFT COLUMN: Visual Academic Seal Card */}
            <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center">
              <div className="relative w-full max-w-md sm:max-w-lg rounded-3xl p-6 sm:p-9 dark:bg-slate-900/90 bg-white/95 border-2 dark:border-slate-700/80 border-slate-200 shadow-2xl backdrop-blur-md">
                
                {/* Top Accent Strip */}
                <div className="flex items-center justify-between pb-4 border-b dark:border-slate-800 border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0B2559] to-[#15469e] flex items-center justify-center text-white shadow-md">
                      <Building2 className="w-6 h-6 text-amber-300" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-widest font-black text-slate-400 block">
                        AICTE REGULATION BUREAU
                      </span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        Higher Education Portal
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded text-[10px] font-mono font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      LIVE ACTIVE
                    </span>
                  </div>
                </div>

                {/* Graphic Illustrated Badge / Seal Display */}
                <div className="py-7 text-center space-y-4">
                  <div className="w-28 h-28 mx-auto rounded-3xl bg-gradient-to-b from-amber-50 to-blue-50 dark:from-slate-800 dark:to-slate-950 p-4 border dark:border-slate-700 border-slate-200 flex items-center justify-center shadow-inner relative group">
                    <img 
                      src="/aicte-logo.png" 
                      alt="AICTE Seal" 
                      className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute -bottom-2.5 px-3 py-0.5 rounded-full bg-[#0B2559] text-amber-300 font-mono text-[10px] font-black shadow-md border border-amber-400/40">
                      ESTD. 1945
                    </span>
                  </div>

                  <div className="pt-2">
                    <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-serif">
                      {isHi ? 'अखिल भारतीय तकनीकी शिक्षा परिषद्' : 'All India Council for Technical Education'}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
                      Department of Higher Education, Ministry of Education, Govt. of India
                    </p>
                  </div>
                </div>

                {/* Quick Verified Highlights */}
                <div className="grid grid-cols-3 gap-2.5 pt-4 border-t dark:border-slate-800 border-slate-100 text-center font-mono">
                  {slide.quickStats.map((stat, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-black block truncate">
                        {stat.label}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-blue-700 dark:text-blue-400 block truncate mt-0.5">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Security Footnote */}
                <div className="mt-5 pt-3.5 border-t dark:border-slate-800 border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center space-x-1.5 font-medium">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>DPDP Act 2023 Architecture</span>
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">SHA-256 Chained</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Big Text Sizes, Saffron Sub-Head, Quick Search */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-6 text-center lg:text-left">
              
              {/* Category Pill Badge */}
              <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold font-mono border shadow-sm max-w-full truncate bg-white dark:bg-slate-900">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-ping" />
                <span className={`px-2 py-0.5 rounded text-xs font-black uppercase tracking-wider ${slide.badgeColor}`}>
                  {isHi ? slide.badgeHi : slide.badge}
                </span>
              </div>

              {/* Main Headline with Increased Text Sizes */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                  {isHi ? slide.headlineHi : slide.headline}
                </h1>
                <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#D97706] dark:text-amber-400 tracking-tight leading-[1.15]">
                  {isHi ? slide.highlightTextHi : slide.highlightText}
                </h2>
              </div>

              {/* Description Paragraph with Increased Font Size */}
              <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-2xl mx-auto lg:mx-0">
                {isHi ? slide.descriptionHi : slide.description}
              </p>

              {/* Action Buttons with Larger Touch Targets */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('public-verification-widget');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl bg-[#D97706] hover:bg-[#B45309] text-white text-sm sm:text-base font-black shadow-lg hover:shadow-xl transition-all flex items-center space-x-2.5 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <span>{isHi ? slide.primaryCtaTextHi : slide.primaryCtaText}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => {
                    if (slide.secondaryCtaRole) {
                      onSelectRole(slide.secondaryCtaRole as any);
                      onSelectNavPage(slide.secondaryCtaRole === 'PUBLIC_VERIFY' ? 'PORTALS' : 'LOGIN');
                    } else {
                      onSelectRole('INSTITUTION');
                      onSelectNavPage('LOGIN');
                    }
                  }}
                  className="px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl border-2 border-[#0B2559] dark:border-blue-400 text-[#0B2559] dark:text-blue-300 bg-white/90 dark:bg-slate-900/90 hover:bg-blue-50 dark:hover:bg-slate-800 text-sm sm:text-base font-black transition-all shadow-sm flex items-center space-x-2.5 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <Building2 className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                  <span>{isHi ? slide.secondaryCtaTextHi : slide.secondaryCtaText}</span>
                </button>
              </div>

              {/* Large Search Bar */}
              <div className="pt-4 max-w-xl mx-auto lg:mx-0">
                <form 
                  onSubmit={handleHeroSearch}
                  className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border-2 dark:border-slate-700 border-slate-300 shadow-xl"
                >
                  <div className="relative flex-1 w-full flex items-center pl-3">
                    <Search className="w-5 h-5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={isHi ? "12-अंकीय अपार आईडी (उदा. 892019482019)..." : "Enter 12-Digit APAAR ID (e.g. 892019482019)..."}
                      className="w-full px-3 py-2.5 text-sm sm:text-base text-slate-900 dark:text-white bg-transparent focus:outline-none font-mono"
                    />
                  </div>

                  <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-slate-700" />

                  <div className="w-full sm:w-auto">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs sm:text-sm font-black transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer whitespace-nowrap"
                    >
                      <Search className="w-4 h-4" />
                      <span>{isHi ? 'सत्यापित करें' : 'Verify ID'}</span>
                    </button>
                  </div>
                </form>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 px-1">
                  <span className="font-medium">Quick demo: 892019482019 (Valid) • 472910482910 (Disputed)</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">Instant Check</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
