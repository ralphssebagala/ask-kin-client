import { useMemo, useState } from 'react';

function getVideoEmbed(url = '') {
  if (!url) return null;
  const clean = url.trim();
  if (clean.includes('youtube.com') || clean.includes('youtu.be') || clean.includes('shorts')) {
    const id = clean.match(/(?:v=|be\/|shorts\/)([^&?/]+)/)?.[1];
    if (id) return { type: 'youtube', src: `https://www.youtube-nocookie.com/embed/${id}` };
  }
  if (clean.includes('tiktok.com')) {
    const id = clean.match(/\/video\/(\d+)/)?.[1];
    if (id) return { type: 'tiktok', src: `https://www.tiktok.com/embed/${id}` };
    return { type: 'tiktok', src: clean };
  }
  return null;
}

function normalizePhone(phone) {
  if (!phone) return '';
  let p = String(phone).replace(/[\s+\-()]/g, '').replace(/^\+/, '').trim();
  if (p.startsWith('0')) p = p.substring(1);
  if (/^(256|254|255|250|257)\d{8,9}$/.test(p)) return p;
  if (/^7\d{8}$/.test(p)) return '256' + p;
  return p;
}
function isValidPhone(phone) {
  const p = normalizePhone(phone);
  return /^(2567\d{8}|2547\d{8}|2557\d{8}|2507\d{8}|257\d{8,9})$/.test(p);
}

function DonateModal({ campaign, onClose }) {
  const [amount, setAmount] = useState(20000);
  const [phone, setPhone] = useState('');
  const [coverFees, setCoverFees] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const firstName = campaign.title.includes(' for ')? campaign.title.split(' for ').pop() : campaign.title.split(' ')[0];
  const FEE_RATE = 0.10;
  const grossUp = Math.round(amount / (1 - FEE_RATE));
  const payAmount = coverFees? grossUp : amount;
  const finalNet = coverFees? amount : Math.round(amount * (1 - FEE_RATE));

  const handlePay = async () => {
    if (!phone) return alert('Enter mobile money number e.g. 07... or 257... for Burundi');
    if (!isValidPhone(phone)) {
      return alert(`Invalid number: ${phone}. Use 07XXXXXXXX or 2567XXXXXXXX, 257XXXXXXXX (Burundi), 2547... (Kenya), 2557... (TZ), 2507... (RW)`);
    }
    if (!amount || amount < 1000) return alert('Min UGX 1,000');

    const cleanPhone = normalizePhone(phone);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/donations/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign?.id,
          payAmount: payAmount,
          netToCampaign: finalNet,
          phone: cleanPhone,
          email: email || null,
          donorEmail: email || null,
          donorName: name || 'Anonymous',
          firstName: name || 'Donor',
          amount: payAmount,
          donorCurrency: campaign?.campaignCurrency || 'UGX',
          coverFees: coverFees
        })
      });
      const data = await res.json();
      console.log('Init response:', data);

      // --- DEV AUTO-COMPLETE FOR QA SANDBOX ---
      const donationIdForDev = data.donationId || data.id || data.orderTrackingId;
      if (donationIdForDev) {
        console.log("DEV MODE: Will auto-complete", donationIdForDev, "in 3s");
        setTimeout(async () => {
          try {
            const devRes = await fetch(`http://localhost:5000/api/donations/dev-complete/${donationIdForDev}`, { method: 'POST' });
            const devData = await devRes.json();
            console.log("DEV auto-complete:", devData);
            if (devData.success) {
              alert(`DEV: Donation completed! Campaign will now update.`);
              window.location.reload();
            }
          } catch (e) {
            console.error("Dev-complete failed", e);
          }
        }, 3000);
      }

      if (data.redirectUrl || data.redirect_url) {
        window.location.href = data.redirectUrl || data.redirect_url;
      } else if (data.orderTrackingId) {
        window.location.href = `https://pay.pesapal.com/pesapalv3/iframe?OrderTrackingId=${data.orderTrackingId}`;
      } else {
        alert(`Could not start payment. ${data.error || 'Please check details and try again.'}`);
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      alert('Error: ' + e.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: 'white', width: '100%', maxWidth: '480px', borderRadius: '16px 16px 0 0', padding: '16px', maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <b style={{ fontSize: '15px' }}>Support {firstName}</b>
          <button onClick={onClose} style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}>✕</button>
        </div>

        <label style={{ fontSize: '12px', fontWeight: '700' }}>Amount ({campaign?.campaignCurrency || 'UGX'})</label>
        <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value) || 0)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', margin: '6px 0 12px', fontWeight: '800', outline: 'none' }} />

        <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '10px', padding: '12px', fontSize: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span>You give:</span><b>UGX {payAmount.toLocaleString()}</b></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '2px' }}><span>Service fee (10%):</span><span>UGX {(payAmount - finalNet).toLocaleString()}</span></div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '8px' }}>Covers secure processing • platform upkeep • verification & payouts</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0BA469', fontWeight: '800', borderTop: '1px dashed #e2e8f0', paddingTop: '8px' }}><span>{firstName} receives:</span><span>UGX {finalNet.toLocaleString()}</span></div>
        </div>

        <label style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', marginBottom: '14px', background: '#f0fdf4', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={coverFees} onChange={e => setCoverFees(e.target.checked)} />
          <span>Cover fee so {firstName} gets full UGX {amount.toLocaleString()}</span>
        </label>

        <input placeholder="Your name (optional)" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '8px', outline: 'none' }} />
        <input placeholder="Your email (optional, for receipt)" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '8px', outline: 'none' }} />
        <input placeholder="07... or 257... (Burundi) or 254... (Kenya) - auto-fixed" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '8px', outline: 'none' }} />

        <div style={{ fontSize: '11px', color: '#0BA469', marginBottom: '12px' }}>
          ✅ Entered: {phone? normalizePhone(phone) : '---'} will be sent to payment service
        </div>

        <button onClick={handlePay} disabled={loading} style={{ width: '100%', background: '#0BA469', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '14px', opacity: loading? 0.7 : 1 }}>
          {loading? 'Processing...' : `Pay UGX ${payAmount.toLocaleString()} →`}
        </button>
        <div style={{ textAlign: 'center', fontSize: '10px', color: '#94a3b8', marginTop: '8px' }}>No account needed • Guest checkout • 100% Secure</div>
      </div>
    </div>
  );
}

export default function CampaignDetail({ campaign, onDonate }) {
  const [showDonate, setShowDonate] = useState(false);
  const c = {
    id: campaign?.id || 'C9014184C4744228A8E4046559B4AD9A',
    title: campaign?.title || 'Wheelchair for Okello',
    raised: campaign?.raised || 3800000,
    goal: campaign?.goal || 4000000,
    donors: campaign?.donors || 12,
    daysLeft: campaign?.daysLeft || 2,
    location: campaign?.location || 'Kampala, UG',
    category: campaign?.category || 'Accessibility',
    description: campaign?.description || 'Okello is a bright student in Lira who needs a wheelchair to get to school.',
    images: campaign?.images || [campaign?.image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800'],
    videoUrl: campaign?.videoUrl || '',
    organizer: campaign?.organizer || { name: 'Verified Organizer', place: 'Kampala, UG' },
    campaignCurrency: campaign?.campaignCurrency || 'UGX',
  };
  const pct = Math.min(100, Math.round((c.raised / c.goal) * 100));
  const mainImg = c.images?.[0];
  const extraImgs = useMemo(() => (c.images || []).slice(1, 3), [c.images]);
  const video = getVideoEmbed(c.videoUrl || '');
  const isTikTok = video?.type === 'tiktok';

  return (
    <div style={{ background: '#f6f7f8', minHeight: '100vh', paddingBottom: '84px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', background: 'white', overflow: 'hidden', borderRadius: '0 0 16px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ position: 'relative', height: '360px', background: '#f3f4f6' }}>
          <img src={mainImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255,255,255,0.96)', borderRadius: '999px', padding: '4px 10px', fontSize: '11px', fontWeight: '700', color: '#166534' }}>{c.category}</div>
        </div>
        <div style={{ padding: '16px' }}>
          <h1 style={{ textAlign: 'center', fontSize: '22px', fontWeight: '900', margin: '0 0 8px' }}>{c.title}</h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', fontSize: '11px', color: '#64748b', marginBottom: '16px' }}>
            <span>{c.donors} donors</span><span>{c.daysLeft} days left</span><span>{c.location}</span>
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 6px' }}>About This Cause</h3>
          <p style={{ fontSize: '13.5px', lineHeight: '1.65', color: '#334155', whiteSpace: 'pre-wrap', margin: '0 0 16px' }}>{c.description}</p>
          {extraImgs.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              {extraImgs.map((img, i) => <img key={i} src={img} alt="" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '12px' }} />)}
            </div>
          )}
          {video && (
            <div style={{ marginBottom: '18px' }}>
              <div style={{ position: 'relative', paddingBottom: isTikTok? '125%' : '56.25%', height: 0, borderRadius: '14px', overflow: 'hidden', background: 'black' }}>
                <iframe src={video.src} title="video" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} allowFullScreen />
              </div>
            </div>
          )}
          <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '14px', padding: '14px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div><b>UGX {Number(c.raised).toLocaleString()}</b><span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '6px' }}>of UGX {Number(c.goal).toLocaleString()}</span></div>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#0BA469' }}>{pct}%</span>
            </div>
            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '999px' }}><div style={{ width: `${pct}%`, height: '100%', background: '#0BA469', borderRadius: '999px' }} /></div>
          </div>
          <button onClick={() => { if (onDonate) onDonate(); setShowDonate(true); }} style={{ width: '100%', background: '#0BA469', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', marginBottom: '14px' }}>Support now →</button>
        </div>
      </div>
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #e2e8f0', padding: '10px 12px', display: 'flex', gap: '8px', zIndex: 50 }}>
        <button onClick={() => setShowDonate(true)} style={{ flex: 1, background: '#0BA469', color: 'white', border: 'none', borderRadius: '12px', padding: '13px', fontWeight: '800', cursor: 'pointer' }}>Support now • UGX {Number(c.raised).toLocaleString()}</button>
      </div>
      {showDonate && <DonateModal campaign={c} onClose={() => setShowDonate(false)} />}
    </div>
  );
}