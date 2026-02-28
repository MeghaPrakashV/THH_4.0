import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const Calendar = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('exam');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'calendar_events'), orderBy('date', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login first!');
    setLoading(true);
    await addDoc(collection(db, 'calendar_events'), {
      title, date, type,
      userId: user.uid,
      source: 'manual',
      createdAt: serverTimestamp(),
    });
    setTitle(''); setDate('');
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'calendar_events', id));
  };

  const getCountdown = (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    if (diff < 0) return 'Past';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today!';
    return days + ' days left';
  };

  const typeColors = {
    exam: 'bg-red-100 text-red-700',
    holiday: 'bg-green-100 text-green-700',
    semester_end: 'bg-purple-100 text-purple-700',
    assignment: 'bg-yellow-100 text-yellow-700',
    other: 'bg-gray-100 text-gray-700',
  };

  const nextExam = events.find(e => e.type === 'exam' && new Date(e.date) >= new Date());
  const nextHoliday = events.find(e => e.type === 'holiday' && new Date(e.date) >= new Date());

  return (
    <div className="container mx-auto px-6 py-16 max-w-3xl">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black mb-4">Smart <span className="text-blue-500">Calendar</span> 📅</h1>
        <p className="text-gray-500 text-lg">Track exams, holidays and important dates.</p>
      </div>

      {/* Countdown Cards */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <div className="text-3xl mb-2">📝</div>
          <div className="font-black text-2xl text-red-600">{nextExam ? getCountdown(nextExam.date) : 'No exams'}</div>
          <div className="text-gray-500 text-sm mt-1">Next Exam {nextExam ? '— ' + nextExam.title : ''}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <div className="text-3xl mb-2">🏖️</div>
          <div className="font-black text-2xl text-green-600">{nextHoliday ? getCountdown(nextHoliday.date) : 'No holidays'}</div>
          <div className="text-gray-500 text-sm mt-1">Next Holiday {nextHoliday ? '— ' + nextHoliday.title : ''}</div>
        </div>
      </div>

      {/* Add Event Form */}
      <form onSubmit={handleAdd} className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
        <h2 className="text-2xl font-black mb-6">Add Event</h2>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title..."
          className="w-full p-4 border-2 border-gray-200 rounded-2xl mb-4 focus:outline-none focus:border-blue-400 text-lg" required />
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="w-full p-4 border-2 border-gray-200 rounded-2xl mb-4 focus:outline-none focus:border-blue-400 text-lg" required />
        <div className="flex gap-2 flex-wrap mb-4">
          {['exam', 'holiday', 'semester_end', 'assignment', 'other'].map(t => (
            <button type="button" key={t} onClick={() => setType(t)}
              className={`px-4 py-2 rounded-xl font-bold capitalize transition text-sm ${type === t ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
        <button type="submit" disabled={loading || !user}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-black text-xl rounded-2xl hover:opacity-90 disabled:opacity-50">
          {loading ? 'Adding...' : '📅 Add Event'}
        </button>
        {!user && <p className="text-center text-red-400 mt-2 text-sm">Please login to add events!</p>}
      </form>

      {/* Events List */}
      <div className="space-y-3">
        {events.length === 0 && <p className="text-center text-gray-400 py-8">No events yet. Add your first event!</p>}
        {events.map(event => (
          <div key={event.id} className="bg-white rounded-2xl shadow-md p-5 border border-gray-100 flex justify-between items-center">
            <div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize mr-2 ${typeColors[event.type] || 'bg-gray-100 text-gray-700'}`}>
                {event.type?.replace('_', ' ')}
              </span>
              <h3 className="font-black text-lg mt-2">{event.title}</h3>
              <p className="text-gray-500 text-sm">{event.date} • {getCountdown(event.date)}</p>
            </div>
            {user && (
              <button onClick={() => handleDelete(event.id)}
                className="text-red-400 hover:text-red-600 font-bold text-xl px-3">✕</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;