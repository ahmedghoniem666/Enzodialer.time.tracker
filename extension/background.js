const intervalSec = 15;
chrome.alarms.create('enzoHeartbeat', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name !== 'enzoHeartbeat') return;
  const s = await chrome.storage.local.get(['token','shiftId','apiUrl']);
  const token = s.token;
  const shiftId = s.shiftId;
  const API = s.apiUrl || 'http://localhost:4000';
  if (!token || !shiftId) return;
  try {
    const tabs = await chrome.tabs.query({ active:true, lastFocusedWindow:true });
    const tab = tabs[0];
    const payload = { shiftId, type: 'tab', payload: { url: tab?.url, title: tab?.title } };
    await fetch(API + '/api/activity', { method:'POST', headers:{ 'content-type':'application/json', 'authorization': 'Bearer ' + token }, body: JSON.stringify(payload) });
  } catch (e) { console.error(e); }
});
