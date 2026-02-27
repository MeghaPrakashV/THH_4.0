import GlassCard from '../components/GlassCard';

const Dashboard = () => {
  const stats = [
    { value: '23', label: 'Active Vents', icon: '💨', color: 'from-pink-500 to-red-500' },
    { value: '3.2🥴', label: 'Mess Rating', icon: '🍲', color: 'from-orange-500 to-yellow-500' },
    { value: '156', label: 'Survival Tips', icon: '💡', color: 'from-green-500 to-teal-500' },
    { value: '7', label: 'Pending Complaints', icon: '⚠️', color: 'from-red-500 to-pink-500' }
  ];

  return (
    <div className="container mx-auto px-6 py-24 -mt-24">
      {/* Stats Row */}
      <div className="grid md:grid-cols-4 gap-8 mb-24">
        {stats.map((stat, idx) => (
          <GlassCard key={idx} hoverGradient={stat.color} className="group text-center">
            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">{stat.icon}</div>
            <div className="text-4xl font-black text-gray-900 mb-3">{stat.value}</div>
            <div className="text-xl text-gray-600 font-medium">{stat.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Feature Cards */}
      <div className="grid lg:grid-cols-3 gap-8 mb-24">
        <GlassCard hoverGradient="from-pink-500 to-orange-500" className="h-[320px]">
          <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-orange-500 rounded-3xl flex items-center justify-center text-4xl mb-8 ml-4 -mr-4 shadow-2xl">
            💨
          </div>
          <h3 className="text-4xl font-black text-gray-900 mb-6">Anonymous Vents</h3>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">Share your struggles anonymously. Posts auto-delete in 24h. Perfect for those midnight breakdowns.</p>
          <a href="/vents" className="inline-flex items-center gap-3 font-bold text-lg text-pink-500 hover:text-pink-600 group">
            Vent Now →
            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </GlassCard>

        <GlassCard hoverGradient="from-blue-500 to-indigo-500" className="h-[320px]">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center text-4xl mb-8 ml-4 -mr-4 shadow-2xl">
            📅
          </div>
          <h3 className="text-4xl font-black text-gray-900 mb-6">AI Calendar</h3>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">Upload your academic calendar PDF. AI extracts all exam dates, holidays & gives you live countdowns.</p>
          <a href="/calendar" className="inline-flex items-center gap-3 font-bold text-lg text-blue-500 hover:text-blue-600 group">
            Add Calendar →
            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </GlassCard>

        <GlassCard hoverGradient="from-orange-500 to-yellow-500" className="h-[320px]">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-3xl flex items-center justify-center text-4xl mb-8 ml-4 -mr-4 shadow-2xl">
            🍲
          </div>
          <h3 className="text-4xl font-black text-gray-900 mb-6">Mess Ratings</h3>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">Rate daily mess food with emojis. Track Michelin Disasters → Hostel Heaven. Weekly trends included.</p>
          <a href="/mess" className="inline-flex items-center gap-3 font-bold text-lg text-orange-500 hover:text-orange-600 group">
            Rate Today →
            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;
