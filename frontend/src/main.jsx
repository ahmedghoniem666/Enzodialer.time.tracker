import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Agent from './pages/Agent'
import Admin from './pages/Admin'

function App(){
  return <BrowserRouter>
    <Routes>
      <Route path='/' element={<Login />} />
      <Route path='/agent' element={<Agent />} />
      <Route path='/admin' element={<Admin />} />
    </Routes>
  </BrowserRouter>
}

createRoot(document.getElementById('root')).render(<App />)
