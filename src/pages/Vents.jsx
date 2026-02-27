import { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';

const Vents = () => {
  const [newVent, setNewVent] = useState('');
  const [posts, setPosts] = useState([
    { id: 1, content: "WiFi died mid-assignment submission 😭😭😭", likes: 45, time: "2h ago" },
    { id: 2, content: "Mess food tastes like punishment from previous birth", likes: 32, time: "4h ago" },
    { id: 3, content: "Finally found the perfect study spot in the staircase!", likes: 28, time: "6h ago" }
  ]);
  const [sortBy, setSortBy] = useState('recent');

  const postVent = () => {
    if (!newVent.trim()) return;
    const newPost = {
      id: Date.now(),
      content: newVent,
      likes: 0,
      time: 'Just now'
    };
    setPosts([newPost, ...posts]);
    setNewVent('');
  };

  const toggleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  const sortedPosts = sortBy === 'top' 
    ? [...posts].sort((a, b) => b.likes - a.likes)
    : posts;

  return (
    <div className="container mx-auto px-6 py-24 max-w-4xl">
      <div className="text-center mb-24">
        <h1 className="text-6xl md:text-7xl font-black gradient-text mb-6">
          Anonymous <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">Vents</span>
        </h1>
        <p className="text-2xl text-gray-600 max-w-2xl mx-auto mb-8">Share your struggles anonymously. Posts auto-delete in 24h. No judgment, just survival.</p>
        <div className="flex justify-center gap-4">
          <button className={`px-6 py-3 rounded-2xl font-bold ${sortBy === 'recent' ? 'bg-pink-500 text-white' : 'bg-gray-100'}`} onClick={() => setSortBy('recent')}>
            Recent 💨
          </button>
          <button className={`px-6 py-3 rounded-2xl font-bold ${sortBy === 'top' ? 'bg-pink-500 text-white' : 'bg-gray-100'}`} onClick={() => setSortBy('top')}>
            Top 🔥
          </button>
        </div>
      </div>

      {/* Post Form */}
      <GlassCard className="mb-12 max-w-2xl mx-auto">
        <textarea
          value={newVent}
          onChange={(e) => setNewVent(e.target.value)}
          placeholder="What's eating you today? Vent anonymously... (auto-deletes in 24h) 💨"
          className="w-full p-8 border-2 border-gray-200 rounded-3xl text-xl resize-vertical min-h-[160px] focus:border-pink-300 focus:outline-none placeholder-gray-500 font-medium"
          maxLength={280}
          rows={4}
        />
        <div className="flex justify-between items-center mt-6">
          <span className="text-lg text-gray-500">{newVent.length}/280</span>
          <button
            onClick={postVent}
            disabled={!newVent.trim()}
            className="btn-primary px-12 py-4 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Vent It Out 💨
          </button>
        </div>
      </GlassCard>

      {/* Vent Posts */}
      <div className="space-y-6">
        {sortedPosts.map(post => (
          <GlassCard key={post.id} hoverGradient="from-purple-500 to-pink-500" className="group max-w-2xl mx-auto">
            <p className="text-xl leading-relaxed mb-8 text-gray-800">{post.content}</p>
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <div className="flex items-center gap-4 text-lg text-gray-600">
                <span>{post.time}</span>
                <span>• Anonymous Survivor</span>
              </div>
              <button
                onClick={() => toggleLike(post.id)}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <span className="text-2xl">👍</span>
                <span>{post.likes}</span>
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {sortedPosts.length === 0 && (
        <GlassCard className="text-center py-24 max-w-md mx-auto mt-12">
          <div className="text-6xl mb-8">💨</div>
          <h3 className="text-3xl font-black text-gray-900 mb-4">No vents yet</h3>
          <p className="text-xl text-gray-600 mb-8">Be the first to share your hostel struggles!</p>
          <button className="btn-primary px-12 py-4 text-xl">Start Venting</button>
        </GlassCard>
      )}
    </div>
  );
};

export default Vents;
