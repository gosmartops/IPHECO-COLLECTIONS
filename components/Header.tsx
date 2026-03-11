
import React from 'react';
import Logo from './Logo';

interface HeaderProps {
  onCartClick: () => void;
  cartCount: number;
  onNavClick: (view: 'home' | 'collections' | 'heritage' | 'contact') => void;
  currentView: string;
}

const Header: React.FC<HeaderProps> = ({ onCartClick, cartCount, onNavClick, currentView }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/5 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8 flex-1">
          <nav className="hidden lg:flex space-x-8 text-[10px] uppercase tracking-[0.3em] font-semibold">
            <button 
              onClick={() => onNavClick('collections')} 
              className={`transition-colors uppercase ${currentView === 'collections' ? 'text-[#B38728]' : 'text-gray-400 hover:text-white'}`}
            >
              Shop
            </button>
            <button 
              onClick={() => onNavClick('heritage')} 
              className={`transition-colors uppercase ${currentView === 'heritage' ? 'text-[#B38728]' : 'text-gray-400 hover:text-white'}`}
            >
              Our Story
            </button>
          </nav>
        </div>

        <div className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity px-4" onClick={() => onNavClick('home')}>
          <Logo className="h-20 md:h-24" />
        </div>

        <div className="flex items-center justify-end space-x-6 flex-1">
          <nav className="hidden lg:flex space-x-8 text-[10px] uppercase tracking-[0.3em] font-semibold mr-6">
            <button 
              onClick={() => onNavClick('contact')} 
              className={`transition-colors uppercase ${currentView === 'contact' ? 'text-[#B38728]' : 'text-gray-400 hover:text-white'}`}
            >
              Contact
            </button>
          </nav>
          
          <button 
            onClick={onCartClick}
            className="relative p-2 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white group-hover:text-[#B38728] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 gold-bg text-black text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
