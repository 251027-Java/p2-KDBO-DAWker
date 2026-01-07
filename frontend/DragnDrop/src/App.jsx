import React, { useState, useEffect } from 'react'
import DragnDrop from './components/DragnDrop'
// import TonejsDemo from './components/TonejsDemo'
// import Login from './components/Login'
import Searchts from './components/Searchts'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import TestComponent from './components/TestComponent'
// TONE.JS CODE COMMENTED OUT - Using Native Web Audio API only
// import ToneJsDemo from './components/TonetsDemo'
import NativeAmpDemo from './components/NativeAmpDemo'
import Loggin from './components/Loggin'
import CreateAccount from './components/CreateAccount'
import Landing from './components/Landing'
import UserPage from './components/UserPage'
import Layout from './components/Layout'
import Forums from './components/Forums'
import ForumPage from './components/ForumPage'
import SettingsPage from './components/SettingsPage'

function App() {




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
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Loggin />} />
          <Route path="/create-account" element={<CreateAccount />} />

          {/* Makes it so that all other components have a sidebar */}
          <Route element={<Layout />} >
            <Route path="/search" element={<Searchts />} />
            <Route path="/demo" element={<TestComponent />} />
            {/* <Route path="/test" element={<ToneJsDemo />} /> */}
            <Route path="/native-amp/:dawId?" element={<NativeAmpDemo />} />
            <Route path="/userpage" element={<UserPage />} />
            <Route path="/forums" element={<Forums/>} />
            <Route path="/forums/:postId" element={<ForumPage/>} />
            <Route path="/settings" element={<SettingsPage/>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>

  )
}

export default App
