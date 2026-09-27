import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function AdminDashboard(){
  const [health, setHealth] = useState(null);
  const [delegates, setDelegates] = useState([]);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState('health');
  const [form, setForm] = useState({name:'', email:'', phone:'', role:'viewer', expiresInDays:7});
  const token = localStorage.getItem('token');

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' };

  async function loadHealth(){
    try{
      const r = await fetch(`${API}/api/admin/health`, {headers});
      const j = await r.json();
      if(j.health) setHealth(j.health);
    }catch(e){ console.error(e); }
  }
  async function loadDelegates(){
    const r = await fetch(`${API}/api/admin/delegates`, {headers});
    const j = await r.json();
    if(j.delegates) setDelegates(j.delegates);
  }
  async function loadStats(){
    const r = await fetch(`${API}/api/admin/stats`, {headers});
    const j = await r.json();
    setStats(j);
  }
  async function loadLogs(){
    const r = await fetch(`${API}/api/support/logs`, {headers});
    const j = await r.json();
    if(j.logs) setLogs(j.logs);
  }

  useEffect(()=>{
    loadHealth(); loadDelegates(); loadStats(); loadLogs();
    const iv = setInterval(loadHealth, 15000); // refresh health every 15s
    return ()=>clearInterval(iv);
  },[]);

  async function addDelegate(e){
    e.preventDefault();
    const r = await fetch(`${API}/api/admin/delegates`, {method:'POST', headers, body: JSON.stringify(form)});
    const j = await r.json();
    if(j.status==='success'){
      alert(`Delegate added. Token: ${j.delegate.token.substring(0,20)}... Send email to ${j.delegate.email}`);
      setForm({name:'', email:'', phone:'', role:'viewer', expiresInDays:7});
      loadDelegates();
    } else alert(j.error);
  }

  async function revoke(id){
    if(!confirm('Revoke delegate?')) return;
    await fetch(`${API}/api/admin/delegates/${id}`, {method:'DELETE', headers});
    loadDelegates();
  }

  const Light = ({label, data})=>{
    const ok = data?.status==='ok';
    const frozen = data?.status==='frozen';
    return (
      <div className={`p-4 rounded-xl border ${ok?'bg-green-50 border-green-300':'bg-red-50 border-red-300'}`}>
        <div className="flex justify-between items-center">
          <span className="font-bold">{label}</span>
          <span className={`w-3 h-3 rounded-full ${ok?'bg-green-500': frozen?'bg-yellow-500':'bg-red-500'} animate-pulse`}></span>
        </div>
        <p className="text-sm mt-2 text-gray-700">{data?.message||'loading...'}</p>
        {data?.expiry && <p className="text-xs mt-1">Expiry: {data.expiry}</p>}
        {data?.url && <p className="text-xs mt-1 truncate">{data.url}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-1">Ask Kin — Backend Dashboard</h1>
      <p className="text-sm text-gray-500 mb-4">Monday Payout 10am EAT | Delegate Watch System</p>

      <div className="flex gap-2 mb-6">
        {['health','delegates','overview','support'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab===t?'bg-black text-white':'bg-white border'}`}>{t}</button>
        ))}
      </div>

      {tab==='health' && health && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Light label="Pesapal Token" data={health.pesapal} />
          <Light label="Oracle DB" data={health.oracle} />
          <Light label="Ngrok IPN URL" data={health.ngrok} />
          <Light label="Payout Queue" data={{status: health.payout?.status, message: `${health.payout?.queue||0} ready for Monday`}} />
          <div className="col-span-full mt-4 p-4 bg-white rounded-xl border text-sm">
            <p>Server Time: {health.serverTime}</p>
            <p>Uptime: {Math.floor(health.uptime/60)} mins</p>
            <button onClick={loadHealth} className="mt-2 px-3 py-1 bg-black text-white rounded">Refresh Now</button>
          </div>
        </div>
      )}

      {tab==='delegates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={addDelegate} className="bg-white p-5 rounded-xl border space-y-3">
            <h2 className="font-bold">Add Final Year Delegate</h2>
            <input className="w-full border p-2 rounded" placeholder="Full Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/>
            <input className="w-full border p-2 rounded" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required/>
            <input className="w-full border p-2 rounded" placeholder="Phone" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/>
            <select className="w-full border p-2 rounded" value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
              <option value="viewer">Viewer (can see only)</option>
              <option value="support">Support Responder</option>
              <option value="payout">Payout Manager</option>
            </select>
            <input type="number" className="w-full border p-2 rounded" placeholder="Days" value={form.expiresInDays} onChange={e=>setForm({...form, expiresInDays:e.target.value})}/>
            <button className="w-full bg-black text-white py-2 rounded">Add Delegate (Auto-revoke)</button>
            <p className="text-xs text-gray-500">Delegate CANNOT delete campaigns, change MoMo numbers, or add other delegates. All actions logged.</p>
          </form>

          <div className="lg:col-span-2 bg-white p-5 rounded-xl border">
            <h2 className="font-bold mb-3">Active Delegates ({delegates.length})</h2>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500"><th>Name</th><th>Role</th><th>Expires</th><th></th></tr></thead>
              <tbody>{delegates.map(d=>(
                <tr key={d.ID} className="border-t"><td className="py-2">{d.NAME}<br/><span className="text-xs text-gray-500">{d.EMAIL}</span></td><td>{d.ROLE}</td><td className="text-xs">{new Date(d.EXPIRES_AT).toLocaleDateString()} {d.IS_ACTIVE? '🟢':'🔴'}</td><td><button onClick={()=>revoke(d.ID)} className="text-red-600">Revoke</button></td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {tab==='overview' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border"><p className="text-sm text-gray-500">Total Campaigns</p><p className="text-2xl font-bold">{stats.totalCampaigns}</p></div>
          <div className="bg-white p-5 rounded-xl border"><p className="text-sm text-gray-500">Total Raised</p><p className="text-2xl font-bold">UGX {stats.totalRaised}</p></div>
          <div className="bg-white p-5 rounded-xl border"><p className="text-sm text-gray-500">Support Taps</p><p className="text-2xl font-bold">{stats.supportTaps}</p></div>
        </div>
      )}

      {tab==='support' && (
        <div className="bg-white p-5 rounded-xl border">
          <h2 className="font-bold mb-3">Support Requests (Call / WhatsApp taps)</h2>
          <table className="w-full text-sm"><thead><tr className="text-left text-gray-500"><th>Channel</th><th>Campaign</th><th>Email</th><th>Time</th></tr></thead>
          <tbody>{logs.map((l,i)=><tr key={i} className="border-t"><td className="py-2">{l.CHANNEL}</td><td>{l.CAMPAIGN_ID||'-'}</td><td>{l.DONOR_EMAIL||'-'}</td><td>{new Date(l.CREATED_AT).toLocaleString()}</td></tr>)}</tbody></table>
        </div>
      )}
    </div>
  );
}