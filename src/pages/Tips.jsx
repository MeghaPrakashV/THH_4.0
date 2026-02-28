
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
              className={`px-4 py-2 rounded-full font-bold capitalize transition text-sm ${filter === cat ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
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
                className={`px-4 py-2 rounded-xl font-bold capitalize transition ${category === cat ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>
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
                <span className={`text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700 capitalize mr-2`}>{tip.category}</span>
                <h3 className="text-xl font-black mt-2">{tip.title}</h3>
              </div>
              <button onClick={() => handleUpvote(tip)}
                disabled={(tip.upvotedBy || []).includes(user?.uid)}
                className={`flex flex-col items-center px-4 py-2 rounded-xl font-black transition ${(tip.upvotedBy || []).includes(user?.uid) ? 'bg-green-100 text-green-600' : 'bg-gray-100 hover:bg-green-50 text-gray-600'}`}>
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
