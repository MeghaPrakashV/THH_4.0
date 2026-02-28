const fs = require('fs');

// ─── VENTS PAGE ───────────────────────────────────────────
fs.writeFileSync('src/pages/Vents.jsx', `
import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const Vents = () => {
  const [ventText, setVentText] = useState('');
  const [allVents, setAllVents] = useState([]);
  const [user, setUser] = useState(null);
  const [sort, setSort] = useState('recent');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    const orderField = sort === 'liked' ? 'likes' : 'createdAt';
    const q = query(collection(db, 'vents'), orderBy(orderField, 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setAllVents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [sort]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!ventText.trim() || !user) return;
    setLoading(true);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await addDoc(collection(db, 'vents'), {
      content: ventText.trim(),
      userId: user.uid,
      likes: 0,
      likedBy: [],
      createdAt: serverTimestamp(),
      expiresAt,
    });
    setVentText('');
    setLoading(false);
  };

  const handleLike = async (vent) => {
    if (!user) return alert('Please login to like!');
    const ref = doc(db, 'vents', vent.id);
    const likedBy = vent.likedBy || [];
    if (likedBy.includes(user.uid)) {
      await updateDoc(ref, { likes: increment(-1), likedBy: arrayRemove(user.uid) });
    } else {
      await updateDoc(ref, { likes: increment(1), likedBy: arrayUnion(user.uid) });
    }
  };

  const timeAgo = (timestamp) => {
    if (!timestamp) return 'just now';
    const seconds = Math.floor((new Date() - timestamp.toDate()) / 1000);
    if (seconds < 60) return seconds + 's ago';
    if (seconds < 3600) return Math.floor(seconds/60) + 'm ago';
    return Math.floor(seconds/3600) + 'h ago';
  };

  return (
    <div className="container mx-auto px-6 py-16 max-w-3xl">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black mb-4">Anonymous <span className="text-pink-500">Vents</span> 💨</h1>
        <p className="text-gray-500 text-lg">Say what you can't say anywhere else. Posts vanish in 24h.</p>
      </div>

      {user ? (
        <form onSubmit={handlePost} className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
          <textarea
            value={ventText}
            onChange={(e) => setVentText(e.target.value)}
            placeholder="What's on your mind? Vent freely... 😤"
            className="w-full p-4 border-2 border-gray-200 rounded-2xl resize-none h-32 focus:outline-none focus:border-pink-400 text-lg"
          />
          <button
            type="submit"
            disabled={loading || !ventText.trim()}
            className="mt-4 w-full py-4 bg-gradient-to-r from-pink-500 to-red-500 text-white font-black text-xl rounded-2xl hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Posting...' : '💨 Vent Anonymously'}
          </button>
        </form>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8 text-center">
          <p className="text-yellow-700 font-bold">Please login to post vents!</p>
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <button onClick={() => setSort('recent')} className={\`px-6 py-2 rounded-full font-bold transition \${sort === 'recent' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}\`}>
          🕐 Recent
        </button>
        <button onClick={() => setSort('liked')} className={\`px-6 py-2 rounded-full font-bold transition \${sort === 'liked' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}\`}>
          🔥 Most Liked
        </button>
      </div>

      <div className="space-y-4">
        {allVents.length === 0 && <p className="text-center text-gray-400 py-12">No vents yet. Be the first to vent! 😤</p>}
        {allVents.map((vent) => (
          <div key={vent.id} className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
            <p className="text-gray-800 text-lg mb-4 leading-relaxed">{vent.content}</p>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">{timeAgo(vent.createdAt)} • expires in 24h</span>
              <button
                onClick={() => handleLike(vent)}
                className={\`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition \${(vent.likedBy || []).includes(user?.uid) ? 'bg-pink-100 text-pink-500' : 'bg-gray-100 text-gray-500 hover:bg-pink-50'}\`}
              >
                ❤️ {vent.likes || 0}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Vents;
`);

// ─── MESS RATING PAGE ─────────────────────────────────────
fs.writeFileSync('src/pages/MessRating.jsx', `
import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const getRatingLabel = (avg) => {
  if (avg <= 1.5) return '🔥 Michelin Disaster';
  if (avg <= 2.5) return '😐 Survivable';
  if (avg <= 3.5) return '👍 Mid But Edible';
  if (avg <= 4.5) return '😊 Actually Decent';
  return '🌟 Hostel Heaven';
};

const MessRating = () => {
  const [user, setUser] = useState(null);
  const [currentRating, setCurrentRating] = useState(3);
  const [meal, setMeal] = useState('lunch');
  const [comment, setComment] = useState('');
  const [todayRatings, setTodayRatings] = useState([]);
  const [weekRatings, setWeekRatings] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const q = query(collection(db, 'mess_ratings'), where('date', '==', today));
    const unsub = onSnapshot(q, (snap) => {
      setTodayRatings(snap.docs.map(d => d.data()));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const q = query(collection(db, 'mess_ratings'), where('date', '>=', weekAgo), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setWeekRatings(snap.docs.map(d => d.data()));
    });
    return () => unsub();
  }, []);

  const submitRating = async () => {
    if (!user) return alert('Please login first!');
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    await addDoc(collection(db, 'mess_ratings'), {
      rating: currentRating,
      meal,
      comment,
      date: today,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
    setSubmitted(true);
    setLoading(false);
  };

  const todayAvg = todayRatings.length > 0
    ? todayRatings.reduce((a, b) => a + b.rating, 0) / todayRatings.length
    : null;

  const weekAvg = weekRatings.length > 0
    ? weekRatings.reduce((a, b) => a + b.rating, 0) / weekRatings.length
    : null;

  const emojis = ['💀', '🥴', '😐', '😀', '😋'];

  return (
    <div className="container mx-auto px-6 py-16 max-w-3xl">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black mb-4">Mess Food <span className="text-orange-500">Judgement</span> 🍲</h1>
        <p className="text-gray-500 text-lg">Rate today's mess. Track Michelin Disasters → Hostel Heaven.</p>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-gray-100">
          <div className="text-4xl font-black text-orange-500 mb-2">{todayAvg ? todayAvg.toFixed(1) : '--'}/5</div>
          <div className="text-gray-500 font-medium">Today's Average</div>
          <div className="text-sm mt-1 font-bold">{todayAvg ? getRatingLabel(todayAvg) : 'No ratings yet'}</div>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-gray-100">
          <div className="text-4xl font-black text-purple-500 mb-2">{weekAvg ? weekAvg.toFixed(1) : '--'}/5</div>
          <div className="text-gray-500 font-medium">Weekly Average</div>
          <div className="text-sm mt-1 font-bold">{weekAvg ? getRatingLabel(weekAvg) : 'No data'}</div>
        </div>
      </div>

      {/* Rating Form */}
      {!submitted ? (
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="text-8xl mb-4">{emojis[currentRating - 1]}</div>
            <div className="text-3xl font-black">{currentRating}/5</div>
            <div className="text-gray-500 mt-1">{getRatingLabel(currentRating)}</div>
          </div>

          <div className="flex justify-center gap-3 mb-6">
            {[1,2,3,4,5].map((star) => (
              <button key={star} onClick={() => setCurrentRating(star)}
                className={\`text-5xl transition-all transform hover:scale-110 \${star <= currentRating ? 'opacity-100' : 'opacity-30'}\`}>
                ⭐
              </button>
            ))}
          </div>

          <div className="flex gap-3 mb-4">
            {['breakfast', 'lunch', 'dinner'].map((m) => (
              <button key={m} onClick={() => setMeal(m)}
                className={\`flex-1 py-2 rounded-xl font-bold capitalize transition \${meal === m ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}\`}>
                {m}
              </button>
            ))}
          </div>

          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment... (optional)"
            className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-orange-400 mb-4"
          />

          <button onClick={submitRating} disabled={loading || !user}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-black text-xl rounded-2xl hover:opacity-90 transition disabled:opacity-50">
            {loading ? 'Submitting...' : '🍲 Rate Today\\'s Food'}
          </button>
          {!user && <p className="text-center text-red-400 mt-2 text-sm">Please login to rate!</p>}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center mb-8">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-2xl font-black text-green-700">Rating Submitted!</h3>
          <p className="text-green-600 mt-2">Thanks for your feedback. Come back tomorrow!</p>
        </div>
      )}

      {/* Today's ratings count */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <h3 className="font-black text-xl mb-2">Today's Ratings 📊</h3>
        <p className="text-gray-500">{todayRatings.length} people rated today's food</p>
      </div>
    </div>
  );
};

export default MessRating;
`);

// ─── TIPS PAGE ────────────────────────────────────────────
fs.writeFileSync('src/pages/Tips.jsx', `
import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, updateDoc, doc, arrayUnion, increment } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const Tips = () => {
  const [user, setUser] = useState(null);
  const [tips, setTips] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('study');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'survival_tips'), orderBy('upvotes', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setTips(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login first!');
    setLoading(true);
    await addDoc(collection(db, 'survival_tips'), {
      title, content, category,
      upvotes: 0,
      upvotedBy: [],
      userId: user.uid,
      authorName: user.displayName || 'Anonymous',
      createdAt: serverTimestamp(),
    });
    setTitle(''); setContent(''); setShowForm(false);
    setLoading(false);
  };

  const handleUpvote = async (tip) => {
    if (!user) return alert('Please login to upvote!');
    if ((tip.upvotedBy || []).includes(user.uid)) return;
    await updateDoc(doc(db, 'survival_tips', tip.id), {
      upvotes: increment(1),
      upvotedBy: arrayUnion(user.uid),
    });
  };

  const categories = ['all', 'study', 'budget', 'daily', 'general'];
  const filtered = filter === 'all' ? tips : tips.filter(t => t.category === filter);

  const categoryColors = { study: 'blue', budget: 'green', daily: 'purple', general: 'gray' };

  return (
    <div className="container mx-auto px-6 py-16 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black mb-4">Survival <span className="text-green-500">Tips</span> 💡</h1>
        <p className="text-gray-500 text-lg">Tips from fellow hostel warriors. Upvote the best ones!</p>
      </div>

      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={\`px-4 py-2 rounded-full font-bold capitalize transition text-sm \${filter === cat ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}\`}>
              {cat}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-black rounded-2xl hover:opacity-90 transition">
          + Add Tip
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Tip title..."
            className="w-full p-4 border-2 border-gray-200 rounded-2xl mb-4 focus:outline-none focus:border-green-400 text-lg" required />
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Describe your tip..."
            className="w-full p-4 border-2 border-gray-200 rounded-2xl mb-4 resize-none h-28 focus:outline-none focus:border-green-400" required />
          <div className="flex gap-3 mb-4 flex-wrap">
            {['study', 'budget', 'daily', 'general'].map(cat => (
              <button type="button" key={cat} onClick={() => setCategory(cat)}
                className={\`px-4 py-2 rounded-xl font-bold capitalize transition \${category === cat ? 'bg-green-500 text-white' : 'bg-gray-100'}\`}>
                {cat}
              </button>
            ))}
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-black text-xl rounded-2xl hover:opacity-90 disabled:opacity-50">
            {loading ? 'Posting...' : '💡 Share Tip'}
          </button>
        </form>
      )}

      {/* Leaderboard top 3 */}
      {tips.slice(0, 3).length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-8 border border-yellow-200">
          <h3 className="font-black text-xl mb-4">🏆 Top Tips Leaderboard</h3>
          {tips.slice(0, 3).map((tip, idx) => (
            <div key={tip.id} className="flex items-center gap-4 mb-2">
              <span className="text-2xl">{['🥇','🥈','🥉'][idx]}</span>
              <span className="font-bold flex-1">{tip.title}</span>
              <span className="text-orange-500 font-black">▲ {tip.upvotes}</span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {filtered.length === 0 && <p className="text-center text-gray-400 py-12">No tips yet. Share the first one! 💡</p>}
        {filtered.map(tip => (
          <div key={tip.id} className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className={\`text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700 capitalize mr-2\`}>{tip.category}</span>
                <h3 className="text-xl font-black mt-2">{tip.title}</h3>
              </div>
              <button onClick={() => handleUpvote(tip)}
                disabled={(tip.upvotedBy || []).includes(user?.uid)}
                className={\`flex flex-col items-center px-4 py-2 rounded-xl font-black transition \${(tip.upvotedBy || []).includes(user?.uid) ? 'bg-green-100 text-green-600' : 'bg-gray-100 hover:bg-green-50 text-gray-600'}\`}>
                <span>▲</span>
                <span>{tip.upvotes || 0}</span>
              </button>
            </div>
            <p className="text-gray-600 leading-relaxed">{tip.content}</p>
            <p className="text-gray-400 text-sm mt-3">by {tip.authorName || 'Anonymous'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tips;
`);

// ─── COMPLAINTS PAGE ──────────────────────────────────────
fs.writeFileSync('src/pages/Complaints.jsx', `
import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const Complaints = () => {
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('WiFi');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'complaints'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setComplaints(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login first!');
    setLoading(true);
    await addDoc(collection(db, 'complaints'), {
      title, description, category,
      status: 'Pending',
      userId: user.uid,
      timeline: [{ status: 'Pending', note: 'Complaint submitted', timestamp: new Date().toISOString() }],
      createdAt: serverTimestamp(),
    });
    setTitle(''); setDescription(''); setSubmitted(true); setLoading(false);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const categories = ['WiFi', 'Food', 'Cleanliness', 'Electricity', 'Noise', 'Maintenance'];
  const statusColors = { Pending: 'yellow', 'In Progress': 'blue', Resolved: 'green' };
  const statusBg = { Pending: 'bg-yellow-100 text-yellow-700', 'In Progress': 'bg-blue-100 text-blue-700', Resolved: 'bg-green-100 text-green-700' };

  return (
    <div className="container mx-auto px-6 py-16 max-w-3xl">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black mb-4">Complaints <span className="text-red-500">📢</span></h1>
        <p className="text-gray-500 text-lg">Submit complaints to hostel management. Track their status.</p>
      </div>

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center mb-6">
          <p className="text-green-700 font-bold">✅ Complaint submitted successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 mb-10 border border-gray-100">
        <h2 className="text-2xl font-black mb-6">New Complaint</h2>

        <div className="flex gap-2 flex-wrap mb-4">
          {categories.map(cat => (
            <button type="button" key={cat} onClick={() => setCategory(cat)}
              className={\`px-4 py-2 rounded-xl font-bold text-sm transition \${category === cat ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}\`}>
              {cat}
            </button>
          ))}
        </div>

        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Complaint title..."
          className="w-full p-4 border-2 border-gray-200 rounded-2xl mb-4 focus:outline-none focus:border-red-400 text-lg" required />
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the issue..."
          className="w-full p-4 border-2 border-gray-200 rounded-2xl mb-4 resize-none h-28 focus:outline-none focus:border-red-400" required />

        <button type="submit" disabled={loading || !user}
          className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-black text-xl rounded-2xl hover:opacity-90 disabled:opacity-50">
          {loading ? 'Submitting...' : '📢 Submit Complaint'}
        </button>
        {!user && <p className="text-center text-red-400 mt-2 text-sm">Please login to submit!</p>}
      </form>

      <h2 className="text-2xl font-black mb-6">My Complaints</h2>
      <div className="space-y-4">
        {complaints.length === 0 && <p className="text-center text-gray-400 py-8">No complaints submitted yet.</p>}
        {complaints.map(complaint => (
          <div key={complaint.id} className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-700 mr-2">{complaint.category}</span>
                <h3 className="text-xl font-black mt-2">{complaint.title}</h3>
              </div>
              <span className={\`text-xs font-bold px-3 py-1 rounded-full \${statusBg[complaint.status] || 'bg-gray-100 text-gray-700'}\`}>
                {complaint.status}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{complaint.description}</p>
            {complaint.timeline && (
              <div className="border-t pt-4">
                <p className="text-sm font-bold text-gray-500 mb-2">Timeline:</p>
                {complaint.timeline.map((t, i) => (
                  <div key={i} className="flex gap-3 items-start mb-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                    <div>
                      <span className="font-bold text-sm">{t.status}</span>
                      <span className="text-gray-500 text-sm"> — {t.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Complaints;
`);

// ─── UPDATE APP.JSX ───────────────────────────────────────
fs.writeFileSync('src/App.jsx', `
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Vents from './pages/Vents';
import MessRating from './pages/MessRating';
import Tips from './pages/Tips';
import Complaints from './pages/Complaints';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<><Hero /><Dashboard /></>} />
            <Route path="/vents" element={<Vents />} />
            <Route path="/mess" element={<MessRating />} />
            <Route path="/tips" element={<Tips />} />
            <Route path="/complaints" element={<Complaints />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
`);

console.log('✅ All pages created successfully!');
