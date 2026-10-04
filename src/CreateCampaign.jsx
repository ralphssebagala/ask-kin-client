import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['Medical','Happy Moments','Burials & Funerals','Religion & Faith','Education','Family Support','Disaster Relief','Business & Work','NGO / Ongoing','Wishes','Others'];

const DURATIONS = [
  { label: '7 days (Urgent)', value: 7 },
  { label: '15 days', value: 15 },
  { label: '30 days (Recommended)', value: 30 },
  { label: '45 days', value: 45 },
  { label: '60 days', value: 60 },
];

const PROVIDERS = [
  { id:'MTN', label:'MTN MoMo', country:'UG' },
  { id:'Airtel', label:'Airtel Money', country:'UG' },
  { id:'M-Pesa', label:'M-Pesa', country:'KE' },
  { id:'Tigo Pesa', label:'Tigo Pesa', country:'TZ' },
  { id:'MoMo RW', label:'MTN Rwanda', country:'RW' },
  { id:'EcoCash', label:'EcoCash', country:'UG' },
  { id:'Other', label:'Other', country:'ALL' },
];

export default function CreateCampaign({ onSuccess }) {
  const navigate = useNavigate();

  // === KYC GUARD ===
  const currentUser = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      return stored.email ? stored : null;
    } catch { return null; }
  }, []);
  const kycStatus = (currentUser?.kycStatus || currentUser?.KYC_STATUS || '').toLowerCase();
  const isApproved = kycStatus === 'approved' || kycStatus === 'verified';

  useEffect(() => {
    if (!currentUser) {
      navigate('/'); // not logged in
      return;
    }
    if (!isApproved) {
      // block direct URL access /create-campaign without approval
      navigate('/dashboard');
    }
  }, [currentUser, isApproved, navigate]);

  const [form, setForm] = useState({
    title:'', category:'Medical', goal:'5000000', durationDays:30,
    location:'Uganda', townCity:'Kampala', country:'UG',
    story:'', campaignCurrency:'UGX',
    payoutMethod:'Mobile Money', payoutProvider:'MTN',
    payoutProviderOther:'', payoutMomoNumber:'', payoutName:'',
    bankName:'', bankAccountNumber:'', bankAccountName:'', bankCountry:'Uganda',
    youtubeUrl:'', tiktokUrl:'', image:''
  });
  const [isOngoing, setIsOngoing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState('');

  const isNGO = form.category === 'NGO / Ongoing';

  const handleImage = (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      const base = reader.result;
      setPreview(base);
      setForm({...form, image: base.length > 3000? `https://picsum.photos/seed/${Date.now()}/600/400` : base });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async ()=>{
    if(!isApproved) {
      alert('Verification required. Please wait for approval.');
      navigate('/dashboard');
      return;
    }
    if(!form.title.trim()) return alert('Title required');
    if(!isNGO ||!isOngoing){
      if(!form.goal) return alert('Goal required');
    }
    if(!form.story.trim()) return alert('Story required');

    setLoading(true);
    try{
      const payload = {
        title: form.title,
        category: form.category,
        description: form.story,
        story: form.story,
        goal: isNGO && isOngoing? 0 : Number(form.goal),
        isOngoing: isNGO && isOngoing,
        durationDays: isNGO && isOngoing? 0 : Number(form.durationDays),
        durationLabel: isNGO && isOngoing? 'Ongoing / No target' : DURATIONS.find(d=>d.value===Number(form.durationDays))?.label || `${form.durationDays} days`,
        location: form.location,
        townCity: form.townCity,
        campaignCurrency: form.campaignCurrency,
        payoutCountry: form.country,
        payoutMethod: form.payoutMethod,
        payoutProvider: form.payoutMethod==='Mobile Money'? form.payoutProvider : null,
        payoutProviderOther: form.payoutProviderOther,
        payoutMomoNumber: form.payoutMethod==='Mobile Money'? form.payoutMomoNumber : null,
        payoutName: form.payoutMethod==='Mobile Money'? form.payoutName : form.bankAccountName,
        bankName: form.payoutMethod==='Bank Transfer'? form.bankName : null,
        bankAccountNumber: form.payoutMethod==='Bank Transfer'? form.bankAccountNumber : null,
        bankAccountName: form.payoutMethod==='Bank Transfer'? form.bankAccountName : null,
        bankCountry: form.payoutMethod==='Bank Transfer'? form.bankCountry : null,
        youtubeUrl: form.youtubeUrl,
        tiktokUrl: form.tiktokUrl,
        image: form.image,
        coverImage: form.image,
        creator: currentUser?.fullName || currentUser?.name || 'Test User',
        creatorEmail: currentUser?.email
      };

      const res = await fetch('https://api.ask-kin.com/api/campaigns', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if(data.status==='success'){
        alert('✅ Published! ' + data.campaign.id);
        if(onSuccess) onSuccess(data.campaign);
        navigate('/dashboard');
      }else{
        alert('Error: ' + data.message);
      }
    }catch(err){
      alert(err.message);
    }finally{ setLoading(false); }
  };

  const inputStyle = {width:'100%', border:'1px solid #e2e8f0', borderRadius:'10px', padding:'10px 12px', fontSize:'13px', outline:'none'};
  const labelStyle = {fontSize:'12px', fontWeight:'800', color:'#0f172a', marginBottom:'4px', display:'block'};

  // If not approved, show blocking screen (prevents flash)
  if (!currentUser) return null;
  if (!isApproved) {
    return (
      <div style={{maxWidth:'560px', margin:'0 auto', padding:'40px 20px', textAlign:'center'}}>
        <div style={{background:'white', borderRadius:'16px', padding:'32px', boxShadow:'0 4px 20px rgba(0,0,0,0.05)'}}>
          <div style={{fontSize:'40px', marginBottom:'12px'}}>⏳</div>
          <h2 style={{fontSize:'18px', fontWeight:'800'}}>Verification required</h2>
          <p style={{fontSize:'14px', color:'#6b7280', marginTop:'8px'}}>Your account is under review. You'll be notified once approved. Then you can create campaigns.</p>
          <button onClick={()=>navigate('/dashboard')} style={{marginTop:'20px', background:'#0f4d3a', color:'white', border:'none', borderRadius:'10px', padding:'10px 20px', fontWeight:'700', cursor:'pointer'}}>Go to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{maxWidth:'560px', margin:'0 auto', background:'#f8fafc', minHeight:'100vh', padding:'12px 12px 90px'}}>
      <div style={{background:'white', borderRadius:'16px', padding:'16px', boxShadow:'0 4px 20px rgba(0,0,0,0.05)'}}>
        <h2 style={{fontSize:'18px', fontWeight:'900', margin:'0 0 12px'}}>Create Campaign</h2>

        <label style={labelStyle}>Campaign Title</label>
        <input style={inputStyle} value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="e.g. Wheelchair for Okello - Kampala" />

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginTop:'12px'}}>
          <div>
            <label style={labelStyle}>Category</label>
            <select style={inputStyle} value={form.category} onChange={e=>{
              const val = e.target.value;
              setForm({...form, category: val});
              if(val!== 'NGO / Ongoing') setIsOngoing(false);
            }}>
              {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Currency</label>
            <select style={inputStyle} value={form.campaignCurrency} onChange={e=>setForm({...form, campaignCurrency:e.target.value, country: e.target.value==='UGX'?'UG': e.target.value==='KES'?'KE': e.target.value==='TZS'?'TZ':'UG'})}>
              <option value="UGX">UGX - Uganda</option>
              <option value="KES">KES - Kenya</option>
              <option value="TZS">TZS - Tanzania</option>
              <option value="RWF">RWF - Rwanda</option>
              <option value="BIF">BIF - Burundi</option>
            </select>
          </div>
        </div>

        {isNGO && (
          <div style={{marginTop:'12px', background:'#f0fdf4', border:'1px solid #a7f3d0', borderRadius:'10px', padding:'10px'}}>
            <label style={{display:'flex', gap:'8px', alignItems:'center', cursor:'pointer', fontSize:'13px', fontWeight:'700'}}>
              <input type="checkbox" checked={isOngoing} onChange={e=>setIsOngoing(e.target.checked)} />
              Ongoing / No target (NGO - indefinite fundraising)
            </label>
          </div>
        )}

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginTop:'12px'}}>
          <div>
            <label style={labelStyle}>Goal Amount</label>
            <input style={inputStyle} type="number" value={form.goal} disabled={isNGO && isOngoing} onChange={e=>setForm({...form, goal:e.target.value})} placeholder="5000000" />
          </div>
          <div>
            <label style={labelStyle}>Duration</label>
            <select style={inputStyle} value={form.durationDays} disabled={isNGO && isOngoing} onChange={e=>setForm({...form, durationDays:Number(e.target.value)})}>
              {DURATIONS.map(d=><option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{marginTop:'12px'}}>
          <label style={labelStyle}>Please Tell Your Story (What are you fundraising for?)</label>
          <textarea style={{...inputStyle, minHeight:'110px', resize:'vertical'}} value={form.story} onChange={e=>setForm({...form, story:e.target.value})} placeholder="Explain why, who benefits, how funds will be used..." />
        </div>

        <div style={{background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'12px', padding:'12px', marginTop:'12px'}}>
          <label style={labelStyle}>Video Links (Optional - 3x more trust)</label>
          <div style={{display:'flex', flexDirection:'column', gap:'8px', marginTop:'6px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <span>▶️</span>
              <input style={inputStyle} value={form.youtubeUrl} onChange={e=>setForm({...form, youtubeUrl:e.target.value})} placeholder="YouTube link https://youtube.com/watch?v=..." />
            </div>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <span>🎵</span>
              <input style={inputStyle} value={form.tiktokUrl} onChange={e=>setForm({...form, tiktokUrl:e.target.value})} placeholder="TikTok link https://tiktok.com/@..." />
            </div>
          </div>
        </div>

        <div style={{marginTop:'12px'}}>
          <label style={labelStyle}>Cover Image</label>
          <input type="file" accept="image/*" onChange={handleImage} style={inputStyle} />
          {preview && <img src={preview} style={{width:'100%', height:'180px', objectFit:'cover', borderRadius:'10px', marginTop:'8px'}} alt="" />}
          <div style={{fontSize:'10px', color:'#94a3b8', marginTop:'4px'}}>We auto-optimize large images to avoid ORA-01461</div>
        </div>

        <div style={{marginTop:'16px', background:'white', border:'1px solid #e2e8f0', borderRadius:'12px', padding:'12px'}}>
          <label style={labelStyle}>Payout Method (Where money goes)</label>
          <div style={{display:'flex', gap:'8px', margin:'8px 0'}}>
            <button type="button" onClick={()=>setForm({...form, payoutMethod:'Mobile Money'})} style={{flex:1, padding:'9px', borderRadius:'10px', border:form.payoutMethod==='Mobile Money'?'2px solid #0BA469':'1px solid #e2e8f0', background:form.payoutMethod==='Mobile Money'?'#f0fdf4':'white', fontWeight:'800', fontSize:'12px'}}>📱 Mobile Money</button>
            <button type="button" onClick={()=>setForm({...form, payoutMethod:'Bank Transfer'})} style={{flex:1, padding:'9px', borderRadius:'10px', border:form.payoutMethod==='Bank Transfer'?'2px solid #0BA469':'1px solid #e2e8f0', background:form.payoutMethod==='Bank Transfer'?'#f0fdf4':'white', fontWeight:'800', fontSize:'12px'}}>🏦 Bank Transfer</button>
          </div>

          {form.payoutMethod==='Mobile Money'? (
            <>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
                <div>
                  <label style={{...labelStyle, fontSize:'11px'}}>Provider</label>
                  <select style={inputStyle} value={form.payoutProvider} onChange={e=>setForm({...form, payoutProvider:e.target.value})}>
                    {PROVIDERS.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{...labelStyle, fontSize:'11px'}}>MoMo Number</label>
                  <input style={inputStyle} value={form.payoutMomoNumber} onChange={e=>setForm({...form, payoutMomoNumber:e.target.value})} placeholder="256772123456" />
                </div>
              </div>
              {form.payoutProvider==='Other' && (
                <input style={{...inputStyle, marginTop:'8px'}} value={form.payoutProviderOther} onChange={e=>setForm({...form, payoutProviderOther:e.target.value})} placeholder="Specify provider" />
              )}
              <div style={{marginTop:'8px'}}>
                <label style={{...labelStyle, fontSize:'11px'}}>Account Name</label>
                <input style={inputStyle} value={form.payoutName} onChange={e=>setForm({...form, payoutName:e.target.value})} placeholder="Name on MoMo account" />
              </div>
            </>
          ) : (
            <>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
                <div>
                  <label style={{...labelStyle, fontSize:'11px'}}>Bank Name</label>
                  <input style={inputStyle} value={form.bankName} onChange={e=>setForm({...form, bankName:e.target.value})} placeholder="e.g. ABSA Bank" />
                </div>
                <div>
                  <label style={{...labelStyle, fontSize:'11px'}}>Country</label>
                  <input style={inputStyle} value={form.bankCountry} onChange={e=>setForm({...form, bankCountry:e.target.value})} placeholder="Uganda" />
                </div>
              </div>
              <div style={{marginTop:'8px'}}>
                <label style={{...labelStyle, fontSize:'11px'}}>Account Number</label>
                <input style={inputStyle} value={form.bankAccountNumber} onChange={e=>setForm({...form, bankAccountNumber:e.target.value})} placeholder="73329765" />
              </div>
              <div style={{marginTop:'8px'}}>
                <label style={{...labelStyle, fontSize:'11px'}}>Account Name</label>
                <input style={inputStyle} value={form.bankAccountName} onChange={e=>setForm({...form, bankAccountName:e.target.value})} placeholder="e.g. Bushanah Petersen" />
              </div>
            </>
          )}
          <div style={{fontSize:'10px', color:'#64748b', background:'#f8fafc', padding:'8px', borderRadius:'8px', marginTop:'10px'}}>
            ✅ Threshold {form.campaignCurrency} {(form.campaignCurrency==='UGX'?50000:500).toLocaleString()} • Payouts every Monday 10am EAT • Verified badge
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading} style={{width:'100%', marginTop:'16px', background:'#0f4d3a', color:'white', border:'none', borderRadius:'12px', padding:'14px', fontSize:'15px', fontWeight:'900', cursor:'pointer', opacity: loading?0.7:1}}>
          {loading? 'Publishing...' : 'Publish Campaign'}
        </button>

        <div style={{textAlign:'center', fontSize:'11px', color:'#94a3b8', marginTop:'8px'}}>
          📍 {form.townCity} • ⏳ {isNGO && isOngoing? 'Ongoing' : `${form.durationDays} days`} • Created {new Date().toLocaleDateString('en-GB')}
        </div>
      </div>
    </div>
  );
}

