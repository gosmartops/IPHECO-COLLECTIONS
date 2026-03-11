
import React from 'react';
import { SOCIAL_LINKS } from '../constants';

interface HeroProps {
  onCtaClick?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onCtaClick }) => {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-40 scale-105"
          alt="Fashion Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-black"></div>
      </div>

      <div className="relative z-10 text-center px-6 space-y-12 max-w-5xl">
        <div className="space-y-4">
          <p className="text-[#B38728] uppercase tracking-[0.8em] text-[10px] font-bold animate-pulse">Good Men's Clothes</p>
          <h2 className="text-6xl md:text-9xl font-luxury font-black text-white leading-[0.9] tracking-tighter">
            LOOK<br/>
            <span className="gold-gradient italic">GOOD</span>
          </h2>
        </div>
        
        <p className="text-gray-400 text-lg md:text-xl font-light tracking-[0.1em] max-w-2xl mx-auto leading-relaxed border-l border-[#B38728]/30 pl-8 text-left md:text-center">
          The best clothes for Nigerian men. We have everything from native wear to office clothes to help you look good.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
          <button 
            onClick={onCtaClick}
            className="gold-bg text-black px-12 py-5 rounded-none font-black uppercase tracking-[0.3em] text-[10px] hover:opacity-90 transition-all transform hover:-translate-y-1 active:scale-95 w-full sm:w-auto shadow-2xl shadow-[#B38728]/20"
          >
            See Our Clothes
          </button>
          <a 
            href={SOCIAL_LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white/10 text-white px-12 py-5 rounded-none font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-white hover:text-black transition-all transform hover:-translate-y-1 w-full sm:w-auto backdrop-blur-sm flex items-center justify-center"
          >
            Talk to Us
          </a>
        </div>
      </div>

      <div className="absolute bottom-12 left-12 hidden lg:flex flex-col space-y-6 text-[10px] tracking-[0.4em] uppercase text-gray-500 font-bold">
        <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[#B38728] transition-colors -rotate-90 origin-left mb-12">Instagram</a>
        <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-[#B38728] transition-colors -rotate-90 origin-left">WhatsApp</a>
      </div>

      <div className="absolute bottom-12 right-12 hidden lg:block text-right">
        <p className="text-[#B38728] text-[10px] tracking-[0.4em] uppercase font-bold">Quick Delivery Everywhere</p>
        <p className="text-gray-600 text-[9px] tracking-[0.2em] uppercase mt-1">Lagos, Abuja, PH & others</p>
      </div>
    </section>
  );
};

export default Hero;
