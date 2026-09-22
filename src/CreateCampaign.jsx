import React, { useState, useRef, useEffect } from 'react';

const CATS = [
  'Medical','Happy Moments & Ceremonies','Burials & Funerals',
  'Religion & Faith','Education','Family Support',
  'Disaster Relief','Business & Work','NGO / Ongoing','Wishes','Others'
];

const CURRENCY_CONFIG = {
  UGX: { label: 'Uganda - UGX', country: 'UG', prefix: '256', threshold: 20000, symbol: 'UGX' },
  KES: { label: 'Kenya - KES', country: 'KE', prefix: '254', threshold: 500, symbol: 'KES' },
  TZS: { label: 'Tanzania - TZS', country: 'TZ', prefix: '255', threshold: 10000, symbol: 'TZS' },
  RWF: { label: 'Rwanda - RWF', country: 'RW', prefix: '250', threshold: 5000, symbol: 'RWF' },
  BIF: { label: 'Burundi - BIF', country: 'BI', prefix: '257', threshold: 10000, symbol: 'BIF' },
};

function normalizeMomoNumber(input, expectedPrefix) {
  if (!input) return '';
  let p = input.replace(/[\s+\-]/g, '').trim();
  if (p.startsWith('0')) p = p.substring(1);
  // If already has full country code
  if (/^(256|254|255|250|257)\d{8,9}$/.test(p)) return p;
  // If number is too short after removing 0, add prefix
  return expectedPrefix + p;
}

export default function CreateCampaign({ onCampaignCreated, onCancel, existingCampaign = null, editId = null, isEdit = false }) {
  const [step, setStep] = useState('form');
  const [form, setForm] = useState({
    title:'', category:'Happy Moments & Ceremonies', image:'', goal:'5000', duration:'30', story:'',
    campaignCurrency: 'UGX',
    payoutCountry: 'UG',
    payoutMomoNumber: '',
    payoutName: ''
  });
  const [ngoType, setNgoType] = useState('time-limited');
  const [loading, setLoading] = useState(false);
  const [createdLink, setCreatedLink] = useState('');
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (existingCampaign) {
      setForm({
        title: existingCampaign.title || '',
        category: existingCampaign.category || 'Happy Moments & Ceremonies',
        image: existingCampaign.coverImage || existingCampaign.image || '',
        goal: String(existingCampaign.goal || '5000'),
        duration: String(existingCampaign.durationDays || existingCampaign.duration || '30'),
        story: existingCampaign.story || existingCampaign.description || '',
        campaignCurrency: existingCampaign.campaignCurrency || 'UGX',
        payoutCountry: existingCampaign.payoutCountry || 'UG',
        payoutMomoNumber: existingCampaign.payoutMomoNumber || '',
        payoutName: existingCampaign.payoutName || '',
      });
      setPreview(existingCampaign.coverImage || existingCampaign.image || '');
      setNgoType(existingCampaign.isOngoing? 'ongoing' : 'time-limited');
    }
  }, [existingCampaign]);

  useEffect(() => {
    if (isEdit && editId &&!existingCampaign) {
      fetch(`http://localhost:5000/api/campaigns/${editId}`)
     .then(r=>r.json())
     .then(data=>{
          const c = data.campaign || data;
          if (c && c.title) {
            setForm({
              title: c.title || '',
              category: c.category || 'Happy Moments & Ceremonies',
              image: c.coverImage || c.image || '',
              goal: String(c.goal || '5000'),
              duration: String(c.durationDays || c.duration || '30'),
              story: c.story || c.description || '',
              campaignCurrency: c.campaignCurrency || 'UGX',
              payoutCountry: c.payoutCountry || 'UG',
              payoutMomoNumber: c.payoutMomoNumber || '',
              payoutName: c.payoutName || '',
            });
            setPreview(c.coverImage || c.image || '');
            setNgoType(c.isOngoing? 'ongoing' : 'time-limited');
          }
        }).catch(()=>{});
    }
  }, [isEdit, editId, existingCampaign]);

  const isNGO = form.category === 'NGO / Ongoing';
  const isOngoing = isNGO && ngoType === 'ongoing';
  const currentConfig = CURRENCY_CONFIG[form.campaignCurrency];

  const inputStyle = {
    width:'100%', background:'#f9fafb', border:'1px solid #e5e7eb',
    borderRadius:'12px', padding:'12px 14px', fontSize:'14px', outline:'none'
  };
  const disabledStyle = {...inputStyle, background:'#f3f4f6', color:'#9ca3af', cursor:'not-allowed' };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm({...form, image: ev.target.result});
      setPreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCurrencyChange = (newCurrency) => {
    const cfg = CURRENCY_CONFIG[newCurrency];
    setForm({...form, campaignCurrency: newCurrency, payoutCountry: cfg.country});
  };

  const handleReview = (e) => {
    e.preventDefault();
    if (!form.payoutMomoNumber) {
      alert('Please enter Mobile Money number for payouts');
      return;
    }
    const normalized = normalizeMomoNumber(form.payoutMomoNumber, currentConfig.prefix);
    if (normalized.length < 11 || normalized.length > 12) {
      alert(`Invalid MoMo number. Expected format: ${currentConfig.prefix}7XXXXXXXX (e.g. ${currentConfig.prefix}772123456). You entered: ${form.payoutMomoNumber}. For Burundi use 257...`);
      return;
    }
    // Save normalized version (e.g. 07... -> 2567...)
    setForm(prev => ({...prev, payoutMomoNumber: normalized}));
    setStep('review');
    window.scrollTo({top:0, behavior:'smooth'});
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    const payload = {
      title: form.title,
      description: form.story,
      story: form.story,
      category: form.category,
      image: form.image || `https://picsum.photos/seed/${Date.now()}/400/400`,
      coverImage: form.image,
      goal: isOngoing? 0 : Number(form.goal),
      raised: existingCampaign?.raised || 0,
      duration: isOngoing? 'ongoing' : form.duration,
      durationDays: isOngoing? null : form.duration,
      isOngoing: isOngoing,
      creator: 'Test',
      location: `${currentConfig.country} - ${form.campaignCurrency}`,
      campaignCurrency: form.campaignCurrency,
      payoutCountry: form.payoutCountry,
      payoutMomoNumber: form.payoutMomoNumber, // Now always 256/254/255/250/257...
      payoutName: form.payoutName,
      payoutConfig: {
        frequency: 'weekly_monday',
        threshold: currentConfig.threshold,
        currency: form.campaignCurrency,
        platformFeePercent: 5
      }
    };
    try {
      const url = isEdit && editId? `http://localhost:5000/api/campaigns/${editId}` : 'http://localhost:5000/api/campaigns';
      const method = isEdit && editId? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      const finalCampaign = data.campaign || data || payload;
      const finalId = finalCampaign._id || finalCampaign.id || editId;
      const link = `${window.location.origin}/campaign/${finalId}`;
      setCreatedLink(link);
      setStep('success');
      onCampaignCreated && onCampaignCreated(finalCampaign);
    } catch (err) {
      alert('Failed: ' + err.message);
      setStep('form');
    } finally { setLoading(false); }
  };

  if (step === 'success') {
    return (
      <div style={{minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', background:'#f6f7f8'}}>
        <div style={{background:'#fff', borderRadius:'20px', padding:'28px', maxWidth:'480px', width:'100%', textAlign:'center', boxShadow:'0 12px 32px rgba(0,0,0,0.08)'}}>
          <div style={{width:'56px', height:'56px', background:'#dcfce7', color:'#0f4d3a', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', margin:'0 auto 16px'}}>✓</div>
          <h2 style={{fontSize:'20px', fontWeight:'800', color:'#111827'}}>{isEdit? 'Campaign Updated!' : 'Your campaign has been received!'}</h2>
          <p style={{fontSize:'14px', color:'#6b7280', marginTop:'10px', lineHeight:'1.5'}}>{isEdit? 'Your changes have been saved.' : 'We have created a link for you to share.'}</p>
          <div style={{background:'#f9fafb', border:'1px dashed #d1d5db', borderRadius:'12px', padding:'12px', marginTop:'16px', fontSize:'13px', wordBreak:'break-all', color:'#0f4d3a', fontWeight:'600'}}>{createdLink}</div>
          <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
            <button onClick={()=>{navigator.clipboard.writeText(createdLink); alert('Link copied!')}} style={{flex:1, background:'#f3f4f6', border:'none', borderRadius:'999px', padding:'12px', fontWeight:'700', cursor:'pointer'}}>Copy Link</button>
            <button onClick={()=>onCancel && onCancel()} style={{flex:1, background:'#0f4d3a', color:'#fff', border:'none', borderRadius:'999px', padding:'12px', fontWeight:'700', cursor:'pointer'}}>Go to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div style={{minHeight:'100vh', background:'#f6f7f8', padding:'24px 16px'}}>
        <div style={{maxWidth:'640px', margin:'0 auto', background:'#fff', borderRadius:'20px', padding:'22px', boxShadow:'0 8px 24px rgba(0,0,0,0.06)'}}>
          <h2 style={{fontSize:'18px', fontWeight:'800', marginBottom:'16px'}}>{isEdit? 'Review Changes' : 'Review Campaign'}</h2>
          <img src={preview || form.image || 'https://picsum.photos/seed/review/600/400'} style={{width:'100%', height:'200px', objectFit:'cover', borderRadius:'12px'}} alt="cover" />
          <h3 style={{fontSize:'18px', fontWeight:'700', marginTop:'14px'}}>{form.title}</h3>
          <p style={{fontSize:'13px', color:'#6b7280', marginTop:'6px'}}>{form.category} {isOngoing? '• Ongoing' : `• ${currentConfig.symbol} ${form.goal} • ${form.duration} days`}</p>
          <p style={{fontSize:'13px', color:'#0f4d3a', marginTop:'6px', fontWeight:'600'}}>Payout: {form.payoutMomoNumber} ({form.campaignCurrency} - {currentConfig.threshold.toLocaleString()} min, Mondays)</p>
          <p style={{fontSize:'14px', color:'#374151', marginTop:'14px', lineHeight:'1.6', whiteSpace:'pre-wrap'}}>{form.story}</p>
          <div style={{display:'flex', gap:'10px', marginTop:'22px'}}>
            <button onClick={()=>setStep('form')} style={{flex:1, background:'#f3f4f6', border:'none', borderRadius:'999px', padding:'13px', fontWeight:'700', cursor:'pointer'}}>Back to Edit</button>
            <button onClick={handleFinalSubmit} disabled={loading} style={{flex:2, background:'#0f4d3a', color:'#fff', border:'none', borderRadius:'999px', padding:'13px', fontWeight:'700', cursor:'pointer', opacity: loading?0.7:1}}>{loading? (isEdit?'Updating...':'Publishing...') : (isEdit?'Confirm Update →':'Confirm & Publish →')}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh', background:'#f6f7f8', padding:'24px 16px 80px'}}>
      <div style={{maxWidth:'640px', margin:'0 auto'}}>
        <div style={{textAlign:'center', marginBottom:'20px'}}>
          <h1 style={{fontSize:'22px', fontWeight:'800', color:'#111827'}}>{isEdit? 'Edit Your Campaign' : 'Create a New Campaign'}</h1>
          <p style={{fontSize:'13.5px', color:'#6b7280'}}>Launch your fundraiser and share it securely.</p>
        </div>
        <form onSubmit={handleReview} style={{background:'#fff', borderRadius:'20px', padding:'22px', boxShadow:'0 8px 24px rgba(0,0,0,0.06)', display:'flex', flexDirection:'column', gap:'16px'}}>

          <div><label style={{fontSize:'12px', fontWeight:'700', color:'#374151', display:'block', marginBottom:'6px'}}>Campaign Title *</label><input style={inputStyle} placeholder="e.g., Church Roof Restoration" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required /></div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px'}}>
            <div>
              <label style={{fontSize:'12px', fontWeight:'700', color:'#374151', display:'block', marginBottom:'6px'}}>Category</label>
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={{...inputStyle, background:'#fff'}}>
                {CATS.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{fontSize:'12px', fontWeight:'700', color:'#374151', display:'block', marginBottom:'6px'}}>Campaign Currency *</label>
              <select value={form.campaignCurrency} onChange={e=>handleCurrencyChange(e.target.value)} style={{...inputStyle, background:'#fff', fontWeight:'700'}}>
                {Object.keys(CURRENCY_CONFIG).map(k=><option key={k} value={k}>{CURRENCY_CONFIG[k].label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{fontSize:'12px', fontWeight:'700', color:'#374151', display:'block', marginBottom:'6px'}}>Financial Goal ({currentConfig.symbol}) *</label>
            <input type="number" style={isOngoing? disabledStyle : inputStyle} value={isOngoing? '' : form.goal} placeholder={isOngoing? 'Not needed for ongoing' : '5000'} onChange={e=>setForm({...form,goal:e.target.value})} disabled={isOngoing} required={!isOngoing} />
          </div>

          <div style={{background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'14px', padding:'14px'}}>
            <h4 style={{fontSize:'13px', fontWeight:'800', color:'#166534', margin:'0 0 10px 0'}}>Where should we send your donations? *</h4>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
              <div>
                <label style={{fontSize:'11px', fontWeight:'600', color:'#374151'}}>MoMo Number - {currentConfig.country} ({currentConfig.prefix})</label>
                <input style={inputStyle} type="tel" placeholder={`e.g. ${currentConfig.prefix}772123456 or 07...`} value={form.payoutMomoNumber} onChange={e=>setForm({...form,payoutMomoNumber:e.target.value})} required />
              </div>
              <div>
                <label style={{fontSize:'11px', fontWeight:'600', color:'#374151'}}>Name on MoMo (KYC)</label>
                <input style={inputStyle} placeholder="e.g., Okello John" value={form.payoutName} onChange={e=>setForm({...form,payoutName:e.target.value})} required />
              </div>
            </div>
            <p style={{fontSize:'11px', color:'#166534', marginTop:'8px', lineHeight:'1.4'}}>
              ✅ We auto-convert 07... to {currentConfig.prefix}... for international payouts. Burundi accepted as 257...<br/>
              Payouts every <b>Monday 10am</b> if balance ≥ {currentConfig.threshold.toLocaleString()} {form.campaignCurrency}. Minus Pesapal (3.5%) + Ask Kin (5%).
            </p>
          </div>

          <div>
            <label style={{fontSize:'12px', fontWeight:'700', color:'#374151', display:'block', marginBottom:'6px'}}>Campaign Poster / Photo</label>
            <div style={{display:'flex', gap:'10px'}}>
              <input style={{...inputStyle, flex:2}} placeholder="Paste image URL (https://...)" value={form.image.startsWith('data:')? '' : form.image} onChange={e=>{setForm({...form,image:e.target.value}); setPreview(e.target.value);}} />
              <button type="button" onClick={()=>fileInputRef.current?.click()} style={{flex:1, background:'#fff', border:'1px solid #0f4d3a', color:'#0f4d3a', borderRadius:'12px', fontSize:'13px', fontWeight:'700', cursor:'pointer', whiteSpace:'nowrap'}}>📁 Upload</button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFile} accept="image/*" style={{display:'none'}} />
            {(preview || form.image) && <img src={preview || form.image} alt="preview" style={{marginTop:'10px', width:'100%', height:'180px', objectFit:'cover', borderRadius:'12px', border:'1px solid #e5e7eb'}} />}
          </div>

          {!isOngoing && <div><label style={{fontSize:'12px', fontWeight:'700', color:'#374151', display:'block', marginBottom:'6px'}}>Active Duration</label><select value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} style={{...inputStyle, background:'#fff'}}><option value="15">15 Days</option><option value="30">30 Days (Standard)</option><option value="60">60 Days</option><option value="90">90 Days</option></select></div>}

          <div><label style={{fontSize:'12px', fontWeight:'700', color:'#374151', display:'block', marginBottom:'6px'}}>Campaign Story & Details *</label><textarea value={form.story} onChange={e=>setForm({...form,story:e.target.value})} required placeholder="Describe why you are raising funds..." style={{...inputStyle, minHeight:'120px'}} /></div>

          <button type="submit" style={{background:'#0f4d3a', color:'#fff', border:'none', borderRadius:'999px', padding:'13px', fontWeight:'700', fontSize:'14px', cursor:'pointer', boxShadow:'0 6px 16px rgba(15,77,58,0.25)'}}>{isEdit? 'Review Changes →' : 'Review Campaign →'}</button>
        </form>
      </div>
    </div>
  );
}