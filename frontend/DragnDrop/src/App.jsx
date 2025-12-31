import React, { useState } from 'react'
import DragDrop from './components/DragDrop'
import TonejsDemo from './components/TonejsDemo'
import Login from './components/Login'
import './App.css'

function App() {
  const [user, setUser] = useState(null)

  function handleLogin(userObj) {
    setUser(userObj)
  }

  function handleLogout() {
    setUser(null)
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <main>
      <div className="app">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px'}}>
          <div>Welcome, {user.name}</div>
          <button onClick={handleLogout} style={{padding:'6px 10px',borderRadius:6}}>Log out</button>
        </div>
        <TonejsDemo />
      </div>
      {/* for now i uncommented the dragdrop component i just didn't know what to do with it */}
      {/* <DragDrop /> */}
    </main>
  )
}

export default App
