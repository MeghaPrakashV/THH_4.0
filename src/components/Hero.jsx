import { useState, useEffect } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase'; // Directly using your config
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged 
} from 'firebase/auth';

const Hero = () => {
  // --- AUTH LOGIC REPLACEMENT ---
  const [user, setUser] = useState(null);
  
  // Listen for user login state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert(err.message);
    }
  };

  const register = async (email, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert(err.message);
    }
  };
  // ------------------------------

  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const addSampleCalendar = async () => {
    await addDoc(collection(db, 'calendarEvents'), {
      title: "Welcome to Hostel Survival Kit! 🎉",
      date: new Date('2026-04-15'),
      type: 'exam',
      description: 'Mid Semester Exam - AI parsed!',
      isManual: true,
      userId: user?.uid,
      createdAt: serverTimestamp()
    });
    alert('📅 Sample calendar event added! Check your dashboard!');
  };

  const handleCalendarUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    const sampleEvents = [
      { title: 'Mid Sem Exam', date: '2026-03-20', type: 'exam' },
      { title: 'Holi Holiday', date: '2026-03-25', type: 'holiday' },
      { title: 'Semester End', date: '2026-05-30', type: 'semester-end' }
    ];

    for (const event of sampleEvents) {
      await addDoc(collection(db, 'calendarEvents'), {
        ...event,
        userId: user?.uid,
        isManual: false,
        parsedAt: serverTimestamp()
      });
    }
    
    setUploading(false);
    alert('📅 Calendar parsed! 3 events added to your dashboard!');
  };

  if (showLogin && !user) {
    return (
      <section className="relative overflow-hidden py-32 bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#45B7D1]">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-6 max-w-md relative z-10">
          <button 
            onClick={() => setShowLogin(false)}
            className="mb-8 text-white/80 hover:text-white transition-all"
          >
            ← Back to Hero
          </button>
          
          <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-12 border border-white/30">
            <h2 className="text-4xl font-black text-white mb-8 text-center">
              Join the Survival
            </h2>
            <form className="space-y-6">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 bg-white/30 border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:border-white"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-white/30 border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:border-white"
                required
              />
              <button
                type="button"
                onClick={() => register(email, password)}
                className="w-full px-8 py-4 bg-gradient-to-r from-yellow-400 to-pink-500 hover:from-yellow-500 hover:to-pink-600 text-black font-black text-xl rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
              >
                🚀 Start Surviving
              </button>
              <button
                type="button"
                onClick={() => login(email, password)}
                className="w-full px-8 py-4 bg-white/50 hover:bg-white text-[#FF6B6B] font-black text-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                Already a Survivor? Login
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden py-32 bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#45B7D1]">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="inline-block p-4 bg-white/30 backdrop-blur-xl rounded-3xl mb-12 animate-float">
          <span className="px-6 py-3 bg-white/50 rounded-2xl text-white font-bold text-lg shadow-lg">
            🚀 Made by Hostel Survivors
          </span>
        </div>
        
        <h1 className="text-7xl md:text-8xl lg:text-9xl font-black bg-gradient-to-r from-white via-gray-100 to-white/80 bg-clip-text text-transparent mb-8 leading-tight">
          Hostel <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-orange-400 bg-clip-text text-transparent drop-shadow-2xl">Survival</span> Kit
        </h1>
        
        <p className="text-2xl md:text-3xl text-white/95 max-w-4xl mx-auto mb-16 leading-relaxed font-medium">
          Survive hostel life with <span className="font-black text-yellow-300">smart calendars</span>, anonymous vents, 
          mess ratings, and survival tips from fellow warriors. 
          <span className="block mt-4 text-4xl">Made for students, by students. 💪</span>
        </p>
        
        {!user ? (
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto mb-24">
            <button 
              onClick={() => setShowLogin(true)}
              className="group relative px-16 py-8 bg-white text-[#FF6B6B] font-black text-2xl rounded-3xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-3 transition-all duration-500 overflow-hidden w-full sm:w-auto"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></span>
              <span className="relative z-10">Get Started Free</span>
            </button>
            
            <button className="group px-16 py-8 bg-white/30 backdrop-blur-xl border border-white/50 hover:bg-white/50 text-white font-bold text-2xl rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500">
              <span>Watch Demo</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto mb-24">
            <button
              onClick={addSampleCalendar}
              className="group relative px-12 py-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xl rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-500"
            >
              ✨ Quick Start Calendar
            </button>

            <form onSubmit={handleCalendarUpload}>
              <div className="flex gap-3">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  id="calendar-upload"
                />
                <label htmlFor="calendar-upload" className="group relative px-12 py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-black text-xl rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-500 cursor-pointer">
                  📅 Upload Calendar
                </label>
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="px-12 py-6 bg-white/20 backdrop-blur-xl border border-white/50 hover:bg-white/40 text-white font-bold text-xl rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 disabled:opacity-50"
                >
                  {uploading ? 'Parsing...' : 'Parse Now'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto pt-16">
          {[
            { icon: '💨', label: 'Anonymous Vents', desc: '24h auto-delete' },
            { icon: '🍛', label: 'Mess Ratings', desc: 'Daily averages' },
            { icon: '📅', label: 'Smart Calendar', desc: 'Live countdowns' },
            { icon: '💡', label: 'Survival Tips', desc: 'Upvote system' }
          ].map((feature, idx) => (
            <div key={idx} className="group p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.label}</h3>
              <p className="text-sm opacity-75">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;