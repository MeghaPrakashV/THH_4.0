import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Vents from './pages/Vents';
import MessRating from './pages/MessRating';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <main>
          <Hero />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vents" element={<Vents />} />
            <Route path="/mess" element={<MessRating />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
