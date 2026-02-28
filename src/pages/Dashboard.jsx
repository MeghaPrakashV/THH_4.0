import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, onSnapshot, where, orderBy } from 'firebase/firestore';
import GlassCard from '../components/GlassCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ vents: 0, messRating: '--', tips: 0, complaints: 0 });

  useEffect(() => {
    // Live vent count
    const ventUnsub = onSnapshot(collection(db, 'vents'), (snap) => {
      setStats(prev => ({ ...prev, vents: snap.size }));
    });

    // Live tips count
    const tipsUnsub = onSnapshot(collection(db, 'survival_tips'), (snap) => {
      setStats(prev => ({ ...prev, tips: snap.size }));
    });

    // Live complaints count
    const complaintsUnsub = onSnapshot(
      query(collection(db, 'complaints'), where('status', '==', 'Pending')),
      (snap) => setStats(prev => ({ ...prev, complaints: snap.size }))
    );

    // Today's mess rating
    const today = new Date().toISOString().split('T')[0];
    const messUnsub = onSnapshot(
      query(collection(db, 'mess_ratings'), where('date', '==', today)),
      (snap) => {
        const ratings = snap.docs.map(d => d.data().rating);
        const avg = ratings.length > 0
          ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
          : '--';
        setStats(prev => ({ ...prev, messRating: avg }));
      }
    );

    return () => { ventUnsub(); tipsUnsub(); complaintsUnsub(); messUnsub(); };
  }, []);

  const statCards = [
    { value: stats.vents, label: 'Active Vents', icon: '💨', color: 'from-pink-500 to-red-500' },
    { value: stats.messRating, label: 'Mess Rating', icon: '🍲', color: 'from-orange-500 to-yellow-500' },
    { value: stats.tips, label: 'Survival Tips', icon: '💡', color: 'from-green-500 to-teal-500' },
    { value: stats.complaints, label: 'Pending Complaints', icon: '⚠️', color: 'from-red-500 to-pink-500' }
  ];

  const featureCards = [
    {
      icon: '💨', title: 'Anonymous Vents',
      desc: 'Share your struggles anonymously. Posts auto-delete in 24h.',
      color: 'from-pink-500 to-red-500', link: '/vents', linkText: 'Vent Now'
    },
    {
      icon: '📅', title: 'AI Calendar',
      desc: 'Upload your academic calendar PDF. AI extracts all exam dates.',
      color: 'from-blue-500 to-indigo-500', link: '/calendar', linkText: 'Add Calendar'
    },
    {
      icon: '🍲', title: 'Mess Ratings',
      desc: 'Rate daily mess food. Track Michelin Disasters → Hostel Heaven.',
      color: 'from-orange-500 to-yellow-500', link: '/mess', linkText: 'Rate Today'
    },
    {
      icon: '💡', title: 'Survival Tips',
      desc: 'Tips from fellow hostel warriors. Upvote the best ones!',
      color: 'from-green-500 to-teal-500', link: '/tips', linkText: 'View Tips'
    },
    {
      icon: '📢', title: 'Complaints',
      desc: 'Submit complaints to hostel management. Track their status.',
      color: 'from-red-500 to-pink-500', link: '/complaints', linkText: 'Complain'
    },
  ];

  return (
    <div className="container mx-auto px-6 py-16">
      {/* Stats Row */}
      <div className="grid md:grid-cols-4 gap-6 mb-16">
        {statCards.map((stat, idx) => (
          <GlassCard key={idx} hoverGradient={stat.color} className="group text-center cursor-pointer">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{stat.icon}</div>
            <div className="text-4xl font-black text-gray-900 mb-2">{stat.value}</div>
            <div className="text-lg text-gray-600 font-medium">{stat.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Feature Cards */}
      <div className="grid lg:grid-cols-3 gap-8">
        {featureCards.map((card, idx) => (
          <GlassCard key={idx} hoverGradient={card.color} className="cursor-pointer group"
            onClick={() => navigate(card.link)}>
            <div className={`w-20 h-20 bg-gradient-to-br ${card.color} rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-xl`}>
              {card.icon}
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-4">{card.title}</h3>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">{card.desc}</p>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(card.link); }}
              className={`inline-flex items-center gap-2 font-bold text-lg bg-gradient-to-r ${card.color} bg-clip-text text-transparent group-hover:gap-4 transition-all`}>
              {card.linkText} →
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;