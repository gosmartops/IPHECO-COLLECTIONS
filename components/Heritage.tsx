
import React from 'react';

const Heritage: React.FC = () => {
  return (
    <div className="pt-32 pb-24 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-6 space-y-24">
        {/* Hero Segment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-[#B38728] uppercase tracking-[0.4em] text-[10px] font-black">What We Believe</p>
              <h1 className="text-5xl md:text-7xl font-luxury font-black leading-tight">Dressing <br/>Good</h1>
            </div>
            <p className="text-gray-400 text-lg leading-relaxed font-light tracking-wide">
              We started IPHECO to help Nigerian men look great. We think looking good is important for every man. We make clothes that help you feel sharp and confident.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div className="space-y-2">
                <h4 className="text-3xl font-luxury text-white">100%</h4>
                <p className="text-[10px] uppercase tracking-widest text-gray-600">Great Materials</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-3xl font-luxury text-white">36+</h4>
                <p className="text-[10px] uppercase tracking-widest text-gray-600">Delivery Spots</p>
              </div>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1471&auto=format&fit=crop" 
              alt="Our clothes"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10"></div>
          </div>
        </div>

        {/* Story Segment */}
        <div className="space-y-12">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#B38728]/30 to-transparent"></div>
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-luxury font-black text-white">Made in Umuahia for Everyone</h2>
            <p className="text-gray-500 text-lg leading-relaxed font-light italic">
              "We started at Umuariga Junction. We wanted to make sure men in Nigeria have good clothes to wear for work and parties. Today, IPHECO is for the smart man."
            </p>
            <p className="text-gray-400 font-light leading-relaxed">
              From our shop in Abia State, we use only the best materials. Whether it is our polo shirts or formal shoes, we pick everything carefully. We want you to look your best in any crowd.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { title: 'Real Style', desc: 'We make clothes that Nigerian men love to wear.' },
            { title: 'Careful Work', desc: 'We pay attention to every detail in our clothes.' },
            { title: 'Easy Access', desc: 'Good clothes should be easy to buy. Just send us a message on WhatsApp.' }
          ].map((val, i) => (
            <div key={i} className="p-12 border border-white/5 bg-[#050505] space-y-6 hover:border-[#B38728]/30 transition-colors">
              <h3 className="text-xl font-luxury font-bold text-[#B38728]">{val.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed tracking-wide">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Heritage;
