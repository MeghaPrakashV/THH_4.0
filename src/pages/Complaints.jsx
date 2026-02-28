
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
              className={`px-4 py-2 rounded-xl font-bold text-sm transition ${category === cat ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
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
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusBg[complaint.status] || 'bg-gray-100 text-gray-700'}`}>
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
