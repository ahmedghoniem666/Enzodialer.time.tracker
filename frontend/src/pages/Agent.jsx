import React, { useState, useEffect } from 'react';
import { post } from '../api';
export default function Agent(){
  const [token] = useState(localStorage.getItem('token'));
  const [shiftId,setShiftId]=useState(null);
  const [status,setStatus]=useState('Not started');

  async function startShift(){
    const r = await post('/api/start-shift', {}, token);
    setShiftId(r.shiftId);
    setStatus('Started at ' + new Date().toLocaleTimeString());
    startHeartbeat(r.shiftId);
  }
  async function endShift(){
    await post('/api/end-shift', { shiftId }, token);
    setShiftId(null);
    setStatus('Ended at ' + new Date().toLocaleTimeString());
    stopHeartbeat();
  }

  let hb=null;
  function startHeartbeat(sid){
    sendHeartbeat(sid);
    hb = setInterval(()=>sendHeartbeat(sid), 15*1000);
    window._enzo_hb = hb;
  }
  function stopHeartbeat(){ clearInterval(window._enzo_hb||0); }

  async function sendHeartbeat(sid){
    await post('/api/activity', { shiftId: sid, type:'heartbeat', payload: { url: window.location.href, visibility: document.visibilityState } }, token);
    console.log('hb sent');
  }

  useEffect(()=>()=>stopHeartbeat(),[]);

  return <div style={{maxWidth:720,margin:'24px auto',padding:20}}>
    <h3>Agent Dashboard</h3>
    <div>{status}</div>
    <div style={{marginTop:12}}>
      <button onClick={startShift} disabled={!!shiftId}>Start Shift</button>
      <button onClick={endShift} disabled={!shiftId} style={{marginLeft:8}}>End Shift</button>
    </div>
  </div>
}
