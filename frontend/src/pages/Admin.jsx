import React, { useState, useEffect } from 'react';
import { get, post } from '../api';
export default function Admin(){
  const token = localStorage.getItem('token');
  const [incidents,setIncidents]=useState([]);
  useEffect(()=>{ load(); },[]);
  async function load(){ const r = await get('/api/incidents', token); setIncidents(r.incidents || []); }
  return <div style={{maxWidth:1000,margin:'24px auto',padding:20}}>
    <h3>Admin Dashboard</h3>
    <div style={{marginTop:12}}>
      <h4>Incidents</h4>
      <ul>{incidents.map(i => <li key={i.id}>{new Date(i.timestamp).toLocaleString()} — {i.reason} — {i.details?.url}</li>)}</ul>
    </div>
  </div>
}
