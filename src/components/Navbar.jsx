import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="backdrop-blur-xl bg-white/80 border-b border-gray-200 sticky top-0 z-50 supports-[backdrop-filter:blur()]:bg-white/60">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl font-black text-white">HSK</span>
            </div>
            <span className="text-2xl font-black gradient-text hidden lg:block">Hostel Survival Kit</span>
          </Link>
          
          <div className="flex items-center gap-8">
            <Link to="/" className="font-bold text-lg text-gray-700 hover:text-pink-500 transition-colors">Dashboard</Link>
            <Link to="/vents" className="font-bold text-lg text-gray-700 hover:text-pink-500 transition-colors">Vents</Link>
            <Link to="/mess" className="font-bold text-lg text-gray-700 hover:text-pink-500 transition-colors">Mess</Link>
            <Link to="/tips" className="font-bold text-lg text-gray-700 hover:text-pink-500 transition-colors">Tips</Link>
            
            <button className="btn-primary px-8 py-3 text-base">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
