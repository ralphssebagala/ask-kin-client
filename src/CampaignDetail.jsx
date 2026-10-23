import React from 'react';

function getDaysLeft(createdAt, durationDays) {
  if (!createdAt ||!durationDays) return null;
  const created = new Date(createdAt);
  const end = new Date(created);
  end.setDate(created.getDate() + Number(durationDays));
  const diff = Math.ceil((end - new Date()) / (1000*60*60*24));
  return diff > 0? diff : 0;
}
function formatDate(d) { if (!d) return ''; return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
function getYoutubeId(url) { if (!url) return null; const m = url.match(/(?:youtube\.com.*v=|youtu\.be\/)([^&\s]+)/); return m? m[1] : null; }
const COUNTRY_MAP = { UG: 'Uganda', UGANDA: 'Uganda', RW: 'Rwanda', RWANDA: 'Rwanda', KE: 'Kenya', KENYA: 'Kenya', TZ: 'Tanzania', TANZANIA: 'Tanzania' };
function normalizeCountry(raw) { if (!raw) return 'Uganda'; const s = raw.toString().trim().toUpperCase(); if (COUNTRY_MAP[s]) return COUNTRY_MAP[s]; return raw; }
function get(c, ...keys){ for (const k of keys){ if (c[k] !== undefined && c[k] !== null && c[k] !== '') return c[k]; const up = k.toUpperCase(); if (c[up] !== undefined && c[up] !== null && c[up] !== '') return c[up]; } return undefined; }

export default function CampaignDetails({ campaign, onDonate, onBack }) {
  if (!campaign) return <div style={{ padding: '20px' }}>Loading...</div>;
  const createdAt = get(campaign, 'createdAt', 'CREATED_AT', 'created_at');
  const durationDays = Number(get(campaign, 'durationDays', 'DURATION_DAYS') || 30);
  const daysLeft = getDaysLeft(createdAt, durationDays);
  const title = get(campaign, 'title', 'TITLE') || 'Untitled';
  const goal = Number(get(campaign, 'goal', 'GOAL', 'GOAL_AMOUNT') || 0);
  const raised = Number(get(campaign, 'raised', 'RAISED') || 0);
  const progress = goal > 0? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  const city = get(campaign, 'townCity', 'TOWN_CITY', 'CITY') || 'Kampala';
  const country = normalizeCountry(get(campaign, 'payoutCountry', 'PAYOUT_COUNTRY', 'COUNTRY') || 'Uganda');
  const cover = get(campaign, 'coverImage', 'IMAGE', 'image') || '/placeholder.jpg';
  const story = get(campaign, 'story', 'DESCRIPTION', 'STORY') || '';
  const badgeStyle = { display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '6px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', background: '#f6f7f8', minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ border: 'none', background: '#f3f4f6', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer' }}>←</button>
        <div style={{ fontWeight: '800' }}>Campaign Details</div>
      </div>
      <div style={{ position: 'relative', background: 'white' }}>
        <img src={cover} alt={title} style={{ width: '100%', height: '320px', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{...badgeStyle, background: 'white' }}>📍 {city}, {country}</span>
          <span style={{...badgeStyle, background: '#eff6ff', borderColor: '#bfdbfe', color: '#1e40af' }}>⏳ {daysLeft!== null? `${daysLeft} days left` : ''}</span>
        </div>
      </div>
      <div style={{ background: 'white', padding: '16px', borderRadius: '16px 16px 0 0', marginTop: '-16px', position: 'relative' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '900', margin: '10px 0 6px', lineHeight: '1.2' }}>{title}</h1>
        <div style={{ background: '#f3f4f6', borderRadius: '12px', padding: '12px', marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <b>UGX {(raised||0).toLocaleString()} raised</b><span style={{ color: '#6b7280' }}>of UGX {(goal||0).toLocaleString()}</span>
          </div>
          <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '10px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${progress}%`, background: raised===0 ? '#e5e7eb' : '#0f4d3a', borderRadius: '10px' }} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: '#6b7280' }}><span>{progress}% funded</span><span>📍 {city}, {country}</span></div>
        </div>
        <div style={{ marginTop: '18px' }}><h3 style={{ fontSize: '15px', fontWeight: '800' }}>Story</h3><p style={{ fontSize: '14px', lineHeight: '1.6', color: '#374151', whiteSpace: 'pre-wrap', marginTop: '6px' }}>{story}</p></div>
        <button type="button" onClick={() => { if (onDonate) onDonate(campaign); }} style={{ width: '100%', marginTop: '20px', background: '#0BA469', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: '800', cursor: 'pointer' }}>Donate Now →</button>
        <div style={{ textAlign: 'center', fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>Secure payout • Threshold 50,000 UGX</div>
      </div>
    </div>
  );
}

