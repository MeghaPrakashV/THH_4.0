import { useState, useEffect } from 'react';
import { db } from '../firebase'; // Connect to your hardware store
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

const Vents = () => {
  const [ventText, setVentText] = useState('');
  const [allVents, setAllVents] = useState([]);

  // 1. GET DATA (The Listener)
  useEffect(() => {
    const q = query(collection(db, "vents"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAllVents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 2. SEND DATA (The Poster)
  const handlePost = async (e) => {
    e.preventDefault();
    if (!ventText.trim()) return;
    
    await addDoc(collection(db, "vents"), {
      text: ventText,
      createdAt: serverTimestamp(),
    });
    setVentText('');
  };

  return (
    <div>
      {/* Your UI for the Input box and the List of Vents */}
    </div>
  );
};

export default Vents;