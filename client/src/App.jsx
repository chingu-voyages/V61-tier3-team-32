import { BrowserRouter as Router } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import AppShell from "./components/layout/AppShell";

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </Router>
  );
}

export default App;
