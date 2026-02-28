
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
        <button onClick={() => setSort('recent')} className={`px-6 py-2 rounded-full font-bold transition ${sort === 'recent' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
          🕐 Recent
        </button>
        <button onClick={() => setSort('liked')} className={`px-6 py-2 rounded-full font-bold transition ${sort === 'liked' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
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
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition ${(vent.likedBy || []).includes(user?.uid) ? 'bg-pink-100 text-pink-500' : 'bg-gray-100 text-gray-500 hover:bg-pink-50'}`}
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
