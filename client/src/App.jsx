import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { UtensilsCrossed, LogIn,UserPlus } from 'lucide-react'
import Header from './components/Header'
import Footer from './components/Footer'
function App() {
  return (
    <Router>
      <div className='min-h-screen text-dark flex bg-white flex-col'>

      
      <Header />
        <main className="p-6 flex-1">
          <Routes>
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </main>
        <Footer />
        </div>
      
    </Router>
  )
}

export default App
