import React, { useState } from 'react'
import DragnDrop from './components/DragnDrop'
// import TonejsDemo from './components/TonejsDemo'
// import Login from './components/Login'
import Searchts from './components/Searchts'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import TestComponent from './components/TestComponent'
import ToneJsDemo from './components/TonetsDemo'
import NativeAmpDemo from './components/NativeAmpDemo'

function App() {
  // const [user, setUser] = useState(null)

  // function handleLogin(userObj) {
  //   setUser(userObj)
  // }

  // function handleLogout() {
  //   setUser(null)
  // }

  // if (!user) {
  //   return <Login onLogin={handleLogin} />
  // }

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
          <Route path="/" element={<DragnDrop />} />
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/search" element={<Searchts />} />
          <Route path="/demo" element={<TestComponent />} />
          <Route path="/test" element={<ToneJsDemo />} />
          <Route path="/native-amp" element={<NativeAmpDemo />} />
        </Routes>
      </BrowserRouter>
    </>

  )
}

export default App
