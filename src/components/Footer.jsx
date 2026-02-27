const Footer = () => {
  return (
    <footer className="bg-white/50 backdrop-blur-xl border-t border-gray-200 mt-32 py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 text-center md:text-left">
          <div>
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto md:mx-0 mb-6">
              <span className="text-2xl font-black text-white">HSK</span>
            </div>
            <p className="text-gray-600 max-w-md mx-auto md:mx-0">Made with ❤️ by hostel survivors for hostel survivors.</p>
          </div>
          
          <div>
            <h4 className="text-xl font-bold mb-6 gradient-text">Features</h4>
            <ul className="space-y-3 text-gray-600">
              <li><a href="/vents" className="hover:text-pink-500 transition-colors">Anonymous Vents</a></li>
              <li><a href="/mess" className="hover:text-pink-500 transition-colors">Mess Ratings</a></li>
              <li><a href="/calendar" className="hover:text-pink-500 transition-colors">AI Calendar</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xl font-bold mb-6 gradient-text">Community</h4>
            <ul className="space-y-3 text-gray-600">
              <li><a href="#" className="hover:text-pink-500 transition-colors">Discord</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">Contribute</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xl font-bold mb-6 gradient-text">Contact</h4>
            <p className="text-gray-600 mb-4">help@hostelsurvivalkit.com</p>
            <div className="flex justify-center md:justify-start gap-4">
              <a href="#" className="w-12 h-12 bg-gray-100 hover:bg-pink-100 rounded-2xl flex items-center justify-center transition-colors">
                <span>🐦</span>
              </a>
              <a href="#" className="w-12 h-12 bg-gray-100 hover:bg-pink-100 rounded-2xl flex items-center justify-center transition-colors">
                <span>💬</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-16 pt-8 text-center text-gray-500 text-sm">
          © 2026 Hostel Survival Kit. Built with TinkerHub vibes.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
