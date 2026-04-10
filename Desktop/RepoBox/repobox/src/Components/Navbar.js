import React from 'react'
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useState } from 'react'
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../Firebase/Config';
import './Navbar.css';

function Navbar({ showSidebar, setShowSidebar }) {
  const [repositories, setRepositories] = useState([])
  const [name, setName] = useState('');
  const [user, setUser] = useState(null);
  const [createnewrepo, setCreatenewrepo] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  

   useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser ? currentUser.displayName : '');
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () =>{
    await signOut(auth);
    navigate('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  }

  const toggleModal = () => {
    setShowModal(!showModal);
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    if (setSearch) setSearch(e.target.value);
  }

  const createNewRepo = () => {
    setCreatenewrepo(true);
  }
 
  const handleCreateRepo = () => {
    if (name.trim() === '') {
      alert('Repository name cannot be empty');
      return;
    }

    const newRepo = {
      id: Date.now(),
      name: name,
      description: '',
    };
    setRepositories([...repositories, newRepo]);
    setCreatenewrepo(false);
    setName('');
  }
 


  return (
    <div className='navbar'>
        <div className='navBrand' onClick={() => navigate('/')}>
        <div className='navLogo'>R</div>
        <span className='navTitle'>RepoBox</span>
      </div>

       <div className='navSearch'>
        <span className='searchIcon'>🔍</span>
        <input
          type='text'
          className='searchInput'
          placeholder='Search repositories...'
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      <div 
           className="menu"
           onClick={() => setShowSidebar(!showSidebar)}>☰</div>
 
      <div className='navLinks'>
        <span onClick={() => navigate('/')}>Home</span>
        {user ? (
          <>
            <span className='navUser'>👤 {user.displayName || user.email}</span>
            <button className='navBtn logout' onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <button className='navBtn login' onClick={() => navigate('/login')}>Login</button>
            <button className='navBtn signup' onClick={() => navigate('/signup')}>Sign Up</button>
          </>
        )}
      </div>
 
      <div className='hamburger' onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>
 
      {menuOpen && (
        <div className='mobileMenu'>
          <span onClick={() => { navigate('/'); setMenuOpen(false); }}>Home</span>
          {user ? (
            <>
              <span className='navUser'>👤 {user.displayName || user.email}</span>
              <span onClick={() => { handleLogout(); setMenuOpen(false); }}>Logout</span>
            </>
          ) : (
            <>
              <span onClick={() => { navigate('/login'); setMenuOpen(false); }}>Login</span>
              <span onClick={() => { navigate('/signup'); setMenuOpen(false); }}>Sign Up</span>
            </>
          )}
        </div>
      )}

    </div>
  )
}

export default Navbar