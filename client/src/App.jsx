import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import PosterDashboard from './components/PosterDashboard'

function App() {
  const [user, setUser] = useState(null)

  return (
    <Router>
      <div className='min-h-screen text-dark flex bg-white flex-col'>
      <Header user={user} onAuthSuccess={setUser} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<div className="p-6">Home Page</div>} />
            <Route path="/dashboard" element={<PosterDashboard user={user} />} />
          </Routes>
        </main>
        <Footer />
        </div>

    </Router>
  )
}

export default App
