import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import PosterDashboard from './components/PosterDashboard'
import ClaimDashboard from './components/ClaimDashboard'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className='min-h-screen text-dark flex bg-white flex-col'>
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<div className="p-6">Home Page</div>} />
              <Route path="/posterdashboard" element={<PosterDashboard />} />
              <Route path="/claimdashboard" element={<ClaimDashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}
export default App;