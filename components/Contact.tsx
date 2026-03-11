
import React from 'react';
import { OFFICE_ADDRESS, CONTACT_NUMBERS, SOCIAL_LINKS } from '../constants';

const Contact: React.FC = () => {
  return (
    <div className="pt-32 pb-24 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-6 space-y-24">
        <div className="text-center space-y-4">
          <p className="text-[#B38728] uppercase tracking-[0.4em] text-[10px] font-black">Get in Touch</p>
          <h1 className="text-5xl md:text-7xl font-luxury font-black">Contact Us</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          <div className="space-y-16">
            <div className="space-y-8">
              <h2 className="text-2xl font-luxury font-bold text-white uppercase tracking-widest">Our Office</h2>
              <div className="space-y-4">
                <p className="text-gray-400 text-lg leading-relaxed font-light">
                  {OFFICE_ADDRESS}
                </p>
                <div className="flex space-x-4">
                  <a 
                    href={`https://www.google.com/maps/search/${encodeURIComponent(OFFICE_ADDRESS)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] uppercase tracking-widest font-bold text-[#B38728] border-b border-[#B38728] pb-1"
                  >
                    See on Map
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-2xl font-luxury font-bold text-white uppercase tracking-widest">Phone Numbers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {CONTACT_NUMBERS.map(num => (
                  <a key={num} href={`tel:${num}`} className="group block p-8 border border-white/5 bg-[#050505] hover:border-[#B38728]/30 transition-all">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold">Call Us</p>
                    <p className="text-xl font-bold group-hover:text-[#B38728] transition-colors">{num}</p>
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-2xl font-luxury font-bold text-white uppercase tracking-widest">Social Media</h2>
              <div className="flex space-x-12">
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors text-[10px] uppercase tracking-[0.3em] font-black">Instagram</a>
                <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors text-[10px] uppercase tracking-[0.3em] font-black">TikTok</a>
              </div>
            </div>
          </div>

          <div className="bg-[#050505] border border-white/5 p-12 space-y-12 shadow-2xl">
            <div className="space-y-4">
              <h3 className="text-2xl font-luxury font-bold">Message Us</h3>
              <p className="text-gray-500 text-sm font-light">Have a special order? Send us a message.</p>
            </div>
            
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-gray-600 font-bold">Your Name</label>
                  <input type="text" className="w-full bg-transparent border-b border-gray-800 py-3 text-white focus:outline-none focus:border-[#B38728] transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-gray-600 font-bold">Phone Number</label>
                  <input type="tel" className="w-full bg-transparent border-b border-gray-800 py-3 text-white focus:outline-none focus:border-[#B38728] transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-gray-600 font-bold">How can we help?</label>
                <textarea rows={4} className="w-full bg-transparent border-b border-gray-800 py-3 text-white focus:outline-none focus:border-[#B38728] transition-colors resize-none"></textarea>
              </div>
              <button className="w-full gold-bg text-black py-5 font-black uppercase tracking-[0.3em] text-[10px] hover:opacity-90 transition-all">
                Send Message
              </button>
            </form>
            
            <div className="text-center pt-8 border-t border-white/5">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest">Or just use WhatsApp</p>
              <a 
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center space-x-3 text-[#B38728] font-black uppercase tracking-[0.2em] text-[10px]"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.767 5.766 0 1.232.394 2.371 1.062 3.296l-1.12 4.095 4.195-1.1c.881.516 1.9.814 2.984.814 3.181 0 5.767-2.586 5.767-5.766 0-3.18-2.586-5.766-5.767-5.766zm3.332 7.74c-.147.414-.73.76-1.002.812-.272.052-.516.084-.816.084-.3 0-.6-.032-.9-.084l-.15-.034c-.815-.194-1.5-.544-2.145-1.189-.645-.645-.995-1.33-1.189-2.145l-.034-.15c-.052-.3-.084-.6-.084-.9 0-.3.032-.544.084-.816.052-.272.398-.855.812-1.002.414-.147.81-.147 1.002 0 .192.147.332.332.414.544l.272.69c.084.222.147.444.147.666 0 .222-.063.444-.147.666-.084.222-.222.444-.414.666-.192.222-.332.332-.332.544 0 .222.063.444.147.666.084.222.272.444.516.688.244.244.466.432.688.516.222.084.444.147.666.147.222 0 .332-.14.544-.332l.666-.414c.222-.084.444-.147.666-.147.222 0 .444.063.666.147l.69.272c.222.082.414.222.544.414.147.192.147.588 0 1.002z"/></svg>
                <span>WhatsApp Helper</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
