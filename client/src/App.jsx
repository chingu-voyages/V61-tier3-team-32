import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-light-gray text-dark">
        <header className="bg-primary text-white p-4 shadow-md flex  items-center">
     
          <h1 className="text-2xl font-bold">FoodRescue</h1>
          <nav>
            <span className="cursor-pointer font-medium hover:text-primary-light">Login / Sign Up</span>
          </nav>
        </header>
        
        <main className="p-6">
          <Routes>
            <Route path="/" element={
              <div className="flex flex-col items-center justify-center h-64">
                <h2 className="text-3xl font-bold mb-4">Don't waste it. Share it.</h2>
                <p className="text-mid-gray max-w-lg text-center mb-8">
                  FoodRescue connects food donors with claimers to redistribute surplus food in real time.
                </p>
                <button className="bg-primary hover:bg-accent text-white px-6 py-2 rounded-lg shadow-sm transition">
                  Browse Feed
                </button>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
