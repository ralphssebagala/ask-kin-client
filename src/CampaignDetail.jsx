import React from 'react';

function getDaysLeft(createdAt, durationDays) {
  if (!createdAt ||!durationDays) return null;
  const created = new Date(createdAt);
  const end = new Date(created);
  end.setDate(created.getDate() + Number(durationDays));
  const diff = Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24));
  return diff > 0? diff : 0;
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function getYoutubeId(url) {
  if (!url) return null;
  const reg = /(?:youtube\.com.*v=|youtu\.be\/)([^&\s]+)/;
  const m = url.match(reg);
  return m? m[1] : null;
}

const COUNTRY_MAP = {
  UG: 'Uganda',
  UGANDA: 'Uganda',
  RW: 'Rwanda',
  RWANDA: 'Rwanda',
  KE: 'Kenya',
  KENYA: 'Kenya',
  TZ: 'Tanzania',
  TANZANIA: 'Tanzania',
  BI: 'Burundi',
  BURUNDI: 'Burundi',
  SS: 'South Sudan',
  'SOUTH SUDAN': 'South Sudan',
  CD: 'DR Congo',
  DRC: 'DR Congo'
};

function normalizeCountry(raw) {
  if (!raw) return 'Uganda';
  const s = raw.toString().trim();
  const upper = s.toUpperCase();
  if (COUNTRY_MAP[upper]) return COUNTRY_MAP[upper];
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export default function CampaignDetails({ campaign, onDonate, onBack }) {
  if (!campaign) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  const daysLeft = getDaysLeft(campaign.createdAt, campaign.durationDays);
  const progress = campaign.goal > 0? Math.min(100, Math.round((campaign.raised / campaign.goal) * 100)) : 0;
  const youtubeId = getYoutubeId(campaign.youtubeUrl);
  const isBank = (campaign.payoutMethod || '').toLowerCase().includes('bank');

  // Location: Wakiso, Uganda | Kigali, Rwanda
  const city = campaign.townCity || campaign.TOWN_CITY || campaign.location || campaign.LOCATION || campaign.TOWN || 'Kampala';
  const rawCountry = campaign.payoutCountry || campaign.PAYOUT_COUNTRY || campaign.country || campaign.COUNTRY || 'Uganda';
  const country = normalizeCountry(rawCountry);
  const locationStr = `${city}, ${country}`;

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#166534',
    padding: '6px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700'
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', background: '#f6f7f8', minHeight: '100vh', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
        <button
          onClick={onBack}
          style={{ border: 'none', background: '#f3f4f6', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer' }}
        >
          ←
        </button>
        <div style={{ fontWeight: '800' }}>Campaign Details</div>
      </div>

      {/* Cover Image */}
      <div style={{ position: 'relative', background: 'white' }}>
        <img
          src={campaign.coverImage || campaign.image}
          alt={campaign.title}
          style={{ width: '100%', height: '320px', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{...badgeStyle, background: 'white' }}>📍 {locationStr}</span>
          {campaign.durationLabel && (
            <span style={{...badgeStyle, background: '#eff6ff', borderColor: '#bfdbfe', color: '#1e40af' }}>
              ⏳ {campaign.durationLabel} • {daysLeft!== null? `${daysLeft} days left` : ''}
            </span>
          )}
        </div>
      </div>

      {/* Main Card */}
      <div style={{ background: 'white', padding: '16px', borderRadius: '16px 16px 0 0', marginTop: '-16px', position: 'relative' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#0f4d3a', background: '#dcfce7', padding: '4px 10px', borderRadius: '20px' }}>
            {campaign.category}
          </span>
          <span style={{ fontSize: '11px', color: '#6b7280' }}>
            Created {formatDate(campaign.createdAt)}
          </span>
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: '900', margin: '10px 0 6px', lineHeight: '1.2' }}>
          {campaign.title}
        </h1>

        <div style={{ margin: '10px 0', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {isBank? (
            <span style={badgeStyle}>
              🏦 Payout: Bank • {campaign.bankName || 'Bank'} {campaign.bankAccountNumber? `• ${campaign.bankAccountNumber}` : ''} {campaign.bankAccountName? `- ${campaign.bankAccountName}` : ''}
            </span>
          ) : (
            <span style={badgeStyle}>
              📱 Payout: MoMo • {campaign.payoutProvider || 'MTN'} • {campaign.payoutMomoNumber || ''} {campaign.payoutName? `- ${campaign.payoutName}` : ''}
            </span>
          )}
          <span style={{...badgeStyle, background: '#fffbeb', borderColor: '#fde68a', color: '#92400e' }}>
            Threshold {campaign.campaignCurrency || 'UGX'} {(campaign.campaignCurrency === 'UGX'? 50000 : 500).toLocaleString()} • Monday 10am
          </span>
        </div>

        {/* Progress */}
        <div style={{ background: '#f3f4f6', borderRadius: '12px', padding: '12px', marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <b>{campaign.campaignCurrency || 'UGX'} {(campaign.raised || 0).toLocaleString()} raised</b>
            <span style={{ color: '#6b7280' }}>of {campaign.campaignCurrency} {(campaign.goal || 0).toLocaleString()}</span>
          </div>
          <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: '#0f4d3a', borderRadius: '10px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: '#6b7280' }}>
            <span>{progress}% funded</span>
            <span>📍 {locationStr}</span>
          </div>
        </div>

        {/* Story */}
        <div style={{ marginTop: '18px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800' }}>Story</h3>
          <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#374151', whiteSpace: 'pre-wrap', marginTop: '6px' }}>
            {campaign.story || campaign.description}
          </p>
        </div>

        {/* Videos */}
        {(campaign.youtubeUrl || campaign.tiktokUrl) && (
          <div style={{ marginTop: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '10px' }}>🎥 Campaign Videos (Trust)</h4>
            {youtubeId && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '10px' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                    allowFullScreen
                    title="YouTube video"
                  />
                </div>
                <a href={campaign.youtubeUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', marginTop: '8px', fontSize: '12px', fontWeight: '700', color: '#dc2626', textDecoration: 'none' }}>
                  ▶️ Watch on YouTube
                </a>
              </div>
            )}
            {!youtubeId && campaign.youtubeUrl && (
              <a href={campaign.youtubeUrl} target="_blank" rel="noreferrer" style={{ display: 'block', background: 'white', border: '1px solid #e5e7eb', padding: '10px', borderRadius: '8px', fontSize: '13px', color: '#dc2626', textDecoration: 'none', marginBottom: '8px' }}>
                ▶️ {campaign.youtubeUrl}
              </a>
            )}
            {campaign.tiktokUrl && (
              <a href={campaign.tiktokUrl} target="_blank" rel="noreferrer" style={{ display: 'block', background: 'black', color: 'white', padding: '10px', borderRadius: '8px', fontSize: '13px', textDecoration: 'none', fontWeight: '700' }}>
                🎵 Watch on TikTok - {campaign.tiktokUrl}
              </a>
            )}
          </div>
        )}

        <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', background: '#f3f4f6', padding: '6px 10px', borderRadius: '20px' }}>📍 {locationStr}</span>
          <span style={{ fontSize: '12px', background: '#f3f4f6', padding: '6px 10px', borderRadius: '20px' }}>⏳ {campaign.durationLabel || `${campaign.durationDays || 30} days`} • {daysLeft} days left</span>
          <span style={{ fontSize: '12px', background: '#f3f4f6', padding: '6px 10px', borderRadius: '20px' }}>📅 Ends {formatDate(new Date(new Date(campaign.createdAt).getTime() + (campaign.durationDays || 30) * 24 * 60 * 60 * 1000))}</span>
        </div>

        {/* DONATE BUTTON - FIXED REACTIVE */}
        <button
          type="button"
          onClick={() => {
            console.log("Donate Now clicked:", campaign);
            if (onDonate) {
              onDonate(campaign);
            } else {
              // fallback if prop not wired
              window.scrollTo({ top: 0, behavior: 'smooth' });
              alert("onDonate is not wired in App.jsx");
            }
          }}
          style={{
            width: '100%',
            marginTop: '20px',
            background: '#0BA469',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '14px',
            fontSize: '15px',
            fontWeight: '800',
            cursor: 'pointer'
          }}
        >
          Donate Now →
        </button>

        <div style={{ textAlign: 'center', fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>
          Secure payout • Threshold 50,000 UGX • Verified {campaign.payoutMethod}
        </div>
      </div>
    </div>
  );
}