import React, { useState, useEffect } from 'react'
import DragnDrop from './components/DragnDrop'
// import TonejsDemo from './components/TonejsDemo'
// import Login from './components/Login'
import Searchts from './components/Searchts'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import TestComponent from './components/TestComponent'
import ToneJsDemo from './components/TonetsDemo'
import Loggin from './components/Loggin'
import Landing from './components/Landing'
import UserPage from './components/UserPage'
import Layout from './components/Layout'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('dawker_user')
      if (raw) setUser(JSON.parse(raw))
    } catch (err) {
      // ignore
    }
  }, [])

  function handleLogin(userObj) {
    setUser(userObj)
    try { localStorage.setItem('dawker_user', JSON.stringify(userObj)) } catch {}
  }

  function handleLogout() {
    setUser(null)
    try { localStorage.removeItem('dawker_user') } catch {}
  }

  useEffect(() => {
    const onLogout = () => handleLogout();
    window.addEventListener('dawker:logout', onLogout);
    return () => window.removeEventListener('dawker:logout', onLogout);
  }, []);

  if (!user) {
    return <Loggin onLogin={handleLogin} />
  }

  return (
    // <main>
    //   <div className="app">
    //     <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px'}}>
    //       <div>Welcome, {user.name}</div>
    //       <button onClick={handleLogout} style={{padding:'6px 10px',borderRadius:6}}>Log out</button>
    //     </div>
    //     <TonejsDemo />
    //   </div>
    //   {/* for now i uncommented the dragdrop component i just didn't know what to do with it */}
    //   {/* <DragDrop /> */}
    // </main>
    <>
      <BrowserRouter>
        <Routes>
          
          {/* Separates the landing page from the other component types */}
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Loggin />} />
          <Route path="/" element={<Searchts />} />

          {/* Makes it so that all other components have a sidebar */}
          <Route element={<Layout />} >
            <Route path="/search" element={<Searchts />} />
            {/* <Route path="/demo" element={<TestComponent />} />
            <Route path="/test" element={<ToneJsDemo />} /> */}
            <Route path="/userpage" element={<UserPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>

  )
}

export default App
