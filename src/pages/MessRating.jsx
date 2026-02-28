
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
                className={`text-5xl transition-all transform hover:scale-110 ${star <= currentRating ? 'opacity-100' : 'opacity-30'}`}>
                ⭐
              </button>
            ))}
          </div>

          <div className="flex gap-3 mb-4">
            {['breakfast', 'lunch', 'dinner'].map((m) => (
              <button key={m} onClick={() => setMeal(m)}
                className={`flex-1 py-2 rounded-xl font-bold capitalize transition ${meal === m ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
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
            {loading ? 'Submitting...' : '🍲 Rate Today\'s Food'}
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
