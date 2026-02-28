import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Vents from './pages/Vents';
import MessRating from './pages/MessRating';
import Tips from './pages/Tips';
import Complaints from './pages/Complaints';
import Calendar from './pages/Calendar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<><Hero /><Dashboard /></>} />
            <Route path="/vents" element={<Vents />} />
            <Route path="/mess" element={<MessRating />} />
            <Route path="/tips" element={<Tips />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/calendar" element={<Calendar />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;