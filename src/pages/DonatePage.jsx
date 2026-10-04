import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const COUNTRY_MAP = { UG: 'Uganda', UGANDA: 'Uganda', RW: 'Rwanda', KE: 'Kenya', TZ: 'Tanzania' };
function normalizeCountry(raw){ if(!raw) return 'Uganda'; const u=raw.toString().trim().toUpperCase(); return COUNTRY_MAP[u]||raw; }

const API = import.meta.env.VITE_API_URL || 'https://api.ask-kin.com';

export default function DonatePage({ campaign }){
  const navigate = useNavigate();
  const [amount,setAmount]=useState('');
  const [donorName,setDonorName]=useState('');
  const [donorPhone,setDonorPhone]=useState('');
  const [message,setMessage]=useState('');
  const [email,setEmail]=useState('');
  const [coverFee,setCoverFee]=useState(false);
  const [showConfirm,setShowConfirm]=useState(false);
  const [isPaying,setIsPaying]=useState(false);

  if(!campaign) return <div style={{padding:20}}>Loading...</div>;
  const city=campaign.townCity||campaign.TOWN_CITY||'Kampala';
  const country=normalizeCountry(campaign.payoutCountry||campaign.country||'Uganda');
  const locationStr=`${city}, ${country}`;

  const numAmount=Number(amount)||0;
  // FIXED MATH FOR 4(a):
  // If coverFee = false: user enters 20000, pays 20000, John gets 18000, fee 2000
  // If coverFee = true: user enters 20000, pays 22000, John gets 20000, fee 2000
  const platformFee = Math.round(numAmount * 0.10);
  const toBeneficiary = numAmount; // John always gets what donor typed
  const totalCharged = coverFee? numAmount + platformFee : numAmount;
  const feeDeductedFromBeneficiary = coverFee? 0 : platformFee;
  const actuallyToBeneficiary = coverFee? numAmount : numAmount - platformFee;

  const currency=campaign.campaignCurrency||'UGX';
  const campaignId=campaign._id||campaign.id||campaign.ID;
  const raised = Number(campaign.raised || campaign.RAISED || 0);
  const goal = Number(campaign.goal || campaign.GOAL || campaign.target || 0);
  const pct = goal > 0? Math.min(100, Math.round((raised/goal)*100)) : 0;

  const handlePay=async()=>{
    setIsPaying(true);
    try{
      const res=await fetch(`${API}/api/donations/create`,{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          campaignId: campaignId,
          amount: totalCharged, // what Pesapal charges
          baseAmount: numAmount, // what donor typed
          beneficiaryAmount: actuallyToBeneficiary,
          platformFee: platformFee,
          donorName: donorName||'Anonymous',
          donorEmail: email || 'test@test.com',
          donorPhone: donorPhone || '256700000000',
          message: message,
          currency,
          coverFee,
          anonymous:!donorName
        })
      });
      const text=await res.text();
      let data;
      try{ data=JSON.parse(text); } catch{ alert('Backend returned HTML - is backend running on 5000?'); console.log(text.slice(0,500)); setIsPaying(false); return; }
      const redirect=data.redirect_url || data.redirectUrl;
      if(redirect){
        localStorage.setItem('lastDonationId', data.donationId);
        localStorage.setItem('lastOrderTrackingId', data.order_tracking_id);
        window.location.href=redirect;
      }
      else{
        console.log('BACKEND RESPONSE:', data);
        alert('Failed: ' + (data.message || data.error || JSON.stringify(data)));
      }
    }catch(e){ alert('Error: '+e.message);} finally{setIsPaying(false);}
  };

  return(
    <div style={{background:'#f6f7f8', minHeight:'100vh', paddingBottom:'80px'}}>
      <div style={{background:'#040A1F', padding:'28px 16px 22px', textAlign:'center'}}>
        <h1 style={{fontSize:'28px', fontWeight:900, color:'white', margin:'0 0 6px'}}>Give Like <span style={{color:'#0BA469'}}>Kin.</span></h1>
        <p style={{fontSize:'13.5px', color:'#94a3b8', margin:0, fontStyle:'italic'}}>Rekindling the Gift of Giving.</p>
      </div>
      <div style={{maxWidth:'580px', margin:'0 auto', padding:'16px'}}>
        <button onClick={()=>navigate(-1)} style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'999px', padding:'8px 14px', fontSize:'12px', fontWeight:700, cursor:'pointer', marginBottom:'14px'}}>← Back to {locationStr}</button>
        <div style={{background:'white', borderRadius:'18px', padding:'20px', boxShadow:'0 10px 30px rgba(0,0,0,0.07)'}}>
          <h2 style={{fontSize:'20px', fontWeight:900, margin:'0 0 4px', textAlign:'center'}}>{campaign.title || campaign.TITLE}</h2>
          <p style={{fontSize:'12px', color:'#64748b', textAlign:'center', margin:'0 0 12px'}}>📍 {locationStr}</p>

          {/* RESTORED: Raised / Goal */}
          {goal > 0 && (
            <div style={{background:'#f8fafc', borderRadius:'12px', padding:'12px', marginBottom:'16px'}}>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', fontWeight:700, marginBottom:'6px'}}>
                <span>{currency} {raised.toLocaleString()} raised</span>
                <span style={{color:'#64748b'}}>of {currency} {goal.toLocaleString()}</span>
              </div>
              <div style={{height:'8px', background:'#e2e8f0', borderRadius:'99px', overflow:'hidden'}}>
                <div style={{width:`${pct}%`, height:'100%', background:'#0BA469'}}></div>
              </div>
              <div style={{fontSize:'11px', color:'#64748b', marginTop:'4px', textAlign:'right'}}>{pct}% funded</div>
            </div>
          )}

          <label style={{fontSize:'12px', fontWeight:800}}>Donation Amount ({currency})</label>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="e.g. 20000" style={{width:'100%', marginTop:'6px', padding:'12px', borderRadius:'10px', border:'1px solid #e5e7eb', boxSizing:'border-box'}}/>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginTop:'10px'}}>
            {[5000,20000,50000].map(v=><button key={v} onClick={()=>setAmount(v.toString())} style={{padding:'10px', borderRadius:'10px', border:'1px solid #e5e7eb', background:Number(amount)===v?'#0BA469':'#f8fafc', color:Number(amount)===v?'white':'#0f172a', fontWeight:800, fontSize:'12px', cursor:'pointer'}}>{v.toLocaleString()}</button>)}
          </div>
          {numAmount>0 && (
            <div style={{marginTop:'16px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'12px', padding:'12px'}}>
              <div style={{fontSize:'11px', fontWeight:800, color:'#166534', marginBottom:'6px'}}>HOW YOUR {currency} {numAmount.toLocaleString()} IS SHARED</div>
              {coverFee? <><div style={{display:'flex', justifyContent:'space-between', fontSize:'13px'}}><span>To beneficiary (100%)</span><b>{currency} {numAmount.toLocaleString()}</b></div><div style={{display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#64748b'}}><span>Platform fee (10% you cover)</span><span>{currency} {platformFee.toLocaleString()}</span></div><div style={{fontWeight:900, marginTop:'6px'}}>Total charged: {currency} {totalCharged.toLocaleString()}</div></> :
              <><div style={{display:'flex', justifyContent:'space-between', fontSize:'13px'}}><span>To beneficiary (90%)</span><b>{currency} {actuallyToBeneficiary.toLocaleString()}</b></div><div style={{display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#64748b'}}><span>Platform fee (10%)</span><span>{currency} {platformFee.toLocaleString()}</span></div><div style={{fontWeight:900, marginTop:'6px'}}>Total charged: {currency} {totalCharged.toLocaleString()}</div></>}
              <label style={{display:'flex', gap:'8px', marginTop:'10px', fontSize:'12px', fontWeight:700, background:'white', padding:'8px', borderRadius:'8px', border:'1px solid #e5e7eb', cursor:'pointer'}}><input type="checkbox" checked={coverFee} onChange={e=>setCoverFee(e.target.checked)}/>Cover the fee so beneficiary gets full {currency} {numAmount.toLocaleString()}</label>
            </div>
          )}
          <div style={{marginTop:'18px'}}>
            <label style={{fontSize:'12px', fontWeight:800}}>Your Name <span style={{fontWeight:400, color:'#94a3b8'}}>(optional - leave blank to donate anonymously)</span></label>
            <input value={donorName} onChange={e=>setDonorName(e.target.value)} placeholder="e.g. James or Anonymous" style={{width:'100%', marginTop:'6px', padding:'12px', borderRadius:'10px', border:'1px solid #e5e7eb', boxSizing:'border-box'}}/>
          </div>
          {/* RESTORED: Phone optional */}
          <div style={{marginTop:'12px'}}>
            <label style={{fontSize:'12px', fontWeight:800}}>Phone Number <span style={{fontWeight:400, color:'#94a3b8'}}>(optional)</span></label>
            <input value={donorPhone} onChange={e=>setDonorPhone(e.target.value)} placeholder="e.g. 2567..." style={{width:'100%', marginTop:'6px', padding:'12px', borderRadius:'10px', border:'1px solid #e5e7eb', boxSizing:'border-box'}}/>
          </div>
          <div style={{marginTop:'12px'}}>
            <label style={{fontSize:'12px', fontWeight:800}}>Message for beneficiary</label>
            <textarea value={message} onChange={e=>setMessage(e.target.value.slice(0,200))} placeholder="Good luck" rows={3} style={{width:'100%', marginTop:'6px', padding:'10px', borderRadius:'10px', border:'1px solid #e5e7eb', boxSizing:'border-box'}}/>
          </div>
          <div style={{marginTop:'12px'}}>
            <label style={{fontSize:'12px', fontWeight:800}}>Email for receipt</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" style={{width:'100%', marginTop:'6px', padding:'12px', borderRadius:'10px', border:'1px solid #e5e7eb', boxSizing:'border-box'}}/>
          </div>
          <button onClick={()=> numAmount>0? setShowConfirm(true): alert('Enter amount')} style={{width:'100%', marginTop:'18px', background:'#0BA469', color:'white', border:'none', borderRadius:'12px', padding:'14px', fontWeight:800, cursor:'pointer'}}>Support now • {currency} {totalCharged.toLocaleString()}</button>
        </div>
      </div>
      {showConfirm && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:99, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px'}}>
          <div style={{background:'white', borderRadius:'16px', padding:'20px', maxWidth:'380px', width:'100%'}}>
            <h3 style={{fontSize:'16px', fontWeight:900, margin:'0 0 8px'}}>Proceed to pay {currency} {totalCharged.toLocaleString()}?</h3>
            <p style={{fontSize:'12px', color:'#64748b'}}>Beneficiary gets {currency} {actuallyToBeneficiary.toLocaleString()} | Fee {currency} {platformFee.toLocaleString()}</p>
            <div style={{display:'flex', gap:'10px', marginTop:'14px'}}>
              <button onClick={()=>setShowConfirm(false)} style={{flex:1, padding:'12px', borderRadius:'10px', border:'1px solid #e5e7eb', background:'#f8fafc', fontWeight:700, cursor:'pointer'}}>Cancel</button>
              <button onClick={handlePay} disabled={isPaying} style={{flex:1, padding:'12px', borderRadius:'10px', border:'none', background:'#0BA469', color:'white', fontWeight:800, cursor:'pointer'}}>{isPaying?'Redirecting...':'Proceed to Pay'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}