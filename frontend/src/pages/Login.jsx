import React, { useState } from 'react'
import { post } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const nav = useNavigate()
  const submit = async () => {
    try {
      const r = await post('/api/login', { email, password })
      localStorage.setItem('token', r.token)
      localStorage.setItem('role', r.user.role)
      if (r.user.role === 'admin') nav('/admin'); else nav('/agent')
    } catch (e) { alert('Login failed') }
  }
  return <div style={{maxWidth:420,margin:'40px auto',padding:20,borderRadius:8,boxShadow:'0 8px 24px rgba(0,0,0,0.08)'}}>
    <h2>Enzo Monitor — Login</h2>
    <input placeholder='email' value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',padding:8,marginTop:8}}/>
    <input placeholder='password' type='password' value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%',padding:8,marginTop:8}}/>
    <button onClick={submit} style={{marginTop:12,padding:'8px 12px'}}>Login</button>
    <p style={{marginTop:8,color:'#666'}}>Default admin: admin / 741852</p>
  </div>
}
