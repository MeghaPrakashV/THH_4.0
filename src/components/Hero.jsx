const Hero = () => {
  return (
    <section className="relative overflow-hidden py-32 bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#45B7D1]">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="inline-block p-4 bg-white/30 backdrop-blur-xl rounded-3xl mb-12 animate-float">
          <span className="px-6 py-3 bg-white/50 rounded-2xl text-white font-bold text-lg shadow-lg">🚀 Made by Hostel Survivors</span>
        </div>
        
        <h1 className="text-7xl md:text-8xl lg:text-9xl font-black bg-gradient-to-r from-white via-gray-100 to-white/80 bg-clip-text text-transparent mb-8 leading-tight">
          Hostel <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-orange-400 bg-clip-text text-transparent drop-shadow-2xl">Survival</span> Kit
        </h1>
        
        <p className="text-2xl md:text-3xl text-white/95 max-w-4xl mx-auto mb-16 leading-relaxed font-medium">
          Survive hostel life with <span className="font-black text-yellow-300">AI calendars</span>, anonymous vents, mess ratings, 
          and survival tips from fellow warriors. 
          <span className="block mt-4 text-4xl">Made for students, by students. 💪</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto mb-24">
          <button className="group relative px-16 py-8 bg-white text-[#FF6B6B] font-black text-2xl rounded-3xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-3 transition-all duration-500 overflow-hidden w-full sm:w-auto">
            <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></span>
            <span className="relative z-10">Start Surviving 🚀</span>
          </button>
          <button className="px-12 py-6 border-3 border-white/70 bg-white/20 backdrop-blur-xl rounded-3xl text-white font-bold text-xl hover:bg-white/40 hover:border-white/90 transition-all duration-300">
            Watch How It Works
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { num: '10K+', label: 'Survivors' },
            { num: '50K', label: 'Vents Shared' },
            { num: '2.8M', label: 'Rating Votes' },
            { num: '1K+', label: 'Tips Added' }
          ].map((stat, idx) => (
            <div key={idx} className="text-white/90">
              <div className="text-4xl md:text-5xl font-black mb-2">{stat.num}</div>
              <div className="text-lg font-medium opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="absolute top-1/4 left-10 w-24 h-24 bg-white/30 rounded-full animate-bounce-slow blur-sm"></div>
      <div className="absolute bottom-1/4 right-20 w-32 h-32 bg-yellow-300/40 rounded-full animate-pulse blur-sm"></div>
      <div className="absolute top-1/2 right-32 w-20 h-20 bg-white/20 rounded-2xl animate-float"></div>
    </section>
  );
};

export default Hero;
