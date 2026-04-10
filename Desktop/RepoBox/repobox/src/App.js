import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './Firebase/Config';
import Navbar from './Components/Navbar';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Signup from './Pages/Signup';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) 
    return 
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#f0fdf4', fontSize:'1.2rem', color:'#22c55e' }}>Loading...</div>;

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* If logged in → go home, else → go login */}
        <Route path='/' element={user ? <Home /> : <Navigate to='/login' />} />
        <Route path='/login' element={user ? <Navigate to='/' /> : <Login />} />
        <Route path='/signup' element={user ? <Navigate to='/' /> : <Signup />} />
      </Routes>
    </Router>
  );
}

export default App;