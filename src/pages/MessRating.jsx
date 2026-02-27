import { useState } from 'react';
import GlassCard from '../components/GlassCard';

const MessRating = () => {
  const [currentRating, setCurrentRating] = useState(3);
  const [ratings, setRatings] = useState([
    { day: 'Mon', rating: 2.8 },
    { day: 'Tue', rating: 3.1 },
    { day: 'Wed', rating: 3.2 },
    { day: 'Thu', rating: 2.9 },
    { day: 'Fri', rating: 3.4 },
    { day: 'Sat', rating: 4.1 },
    { day: 'Sun', rating: 3.7 }
  ]);

  const ratingLabels = [
    '💀 Michelin Disaster',
    '🥴 Survivable',
    '😐 Decent',
    '😀 Good',
    '😋 Hostel Heaven'
  ];

  const ratingEmojis = ['💀', '🥴', '😐', '😀', '😋'];

  const submitRating = () => {
    setRatings(prev => [...prev.slice(1), { day: 'Today', rating: currentRating }]);
    // API call would go here
  };

  const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

  return (
    <div className="container mx-auto px-6 py-24 max-w-4xl">
      <div className="text-center mb-24">
        <h1 className="text-6xl md:text-7xl font-black gradient-text mb-6">
          Mess Food <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">Judgement</span>
        </h1>
        <p className="text-2xl text-gray-600 max-w-2xl mx-auto">Rate today's mess food. Track Michelin Disasters → Hostel Heaven. Weekly trends included.</p>
      </div>

      {/* Today's Rating */}
      <GlassCard className="max-w-2xl mx-auto mb-16 text-center">
        <div className="text-8xl mb-8 animate-bounce">{ratingEmojis[currentRating - 1]}</div>
        <div className="text-6xl font-black text-gray-900 mb-4">{currentRating}/5</div>
        <div className="text-2xl text-gray-600 mb-12">{ratingLabels[currentRating - 1]}</div>
        
        <div className="flex justify-center gap-4 mb-12">
          {[1,2,3,4,5].map((star) => (
            <button
              key={star}
              onClick={() => setCurrentRating(star)}
              className={`text-5xl p-4 rounded-2xl transition-all transform hover:scale-110 ${
                star <= currentRating 
                  ? 'text-yellow-400' 
                  : 'text-gray-300 hover:text-yellow-300'
              }`}
            >
              ⭐
            </button>
          ))}
        </div>
        
        <button
          onClick={submitRating}
          className="btn-primary px-16 py-6 text-2xl shadow-2xl"
        >
          Rate Today's Food 🍲
        </button>
      </GlassCard>

      {/* Weekly Stats */}
      <div className="grid md:grid-cols-2 gap-12 mb-24">
        <GlassCard hoverGradient="from-green-500 to-teal-500">
          <h3 className="text-3xl font-black text-gray-900 mb-8">Weekly Average</h3>
          <div className="text-6xl font-black text-green-600 mb-6">{avgRating.toFixed(1)}/5</div>
          <div className="text-2xl text-gray-600">{ratingLabels[Math.round(avgRating) - 1]}</div>
        </GlassCard>

        <GlassCard hoverGradient="from-purple-500 to-pink-500">
          <h3 className="text-3xl font-black text-gray-900 mb-8">Today's Rank</h3>
          <div className="text-6xl font-black text-purple-600 mb-6">#{ratings.length - ratings.findIndex(r => r.day === 'Today') || 0 + 1}</div>
          <div className="text-2xl text-gray-600">Out of 7 days</div>
        </GlassCard>
      </div>

      {/* Weekly Chart */}
      <GlassCard>
        <h3 className="text-3xl font-black text-gray-900 mb-12 text-center">This Week's Ratings 📊</h3>
        <div className="grid md:grid-cols-7 gap-4">
          {ratings.map((rating, idx) => (
            <div key={idx} className="text-center group">
              <div className="text-3xl mb-2">{ratingEmojis[Math.round(rating.rating) - 1]}</div>
              <div className="font-bold text-lg">{rating.rating}</div>
              <div className="text-sm text-gray-500">{rating.day}</div>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2 group-hover:h-4 transition-all">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 h-3 rounded-full transition-all group-hover:h-4"
                  style={{ width: `${(rating.rating / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default MessRating;
