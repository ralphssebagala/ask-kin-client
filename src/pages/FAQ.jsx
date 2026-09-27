import { useState } from "react";
import { faqs } from "../data/faq.js";

const categories = [...new Set(faqs.map(f => f.category))];

export default function FAQ() {
  const [activeCat, setActiveCat] = useState(categories[0]);
  const [openIndex, setOpenIndex] = useState(0);
  const filtered = faqs.filter(f => f.category === activeCat);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 16px 80px' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 800, textAlign: 'center', letterSpacing: '-0.5px', color: '#0f172a' }}>Frequently Asked Questions</h1>
      <p style={{ textAlign: 'center', color: '#6b7280', marginTop: 8, fontSize: '14px' }}>
  Click on any question to reveal your answer.
</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', margin: '24px 0 28px' }}>
        {categories.map(cat => (
          <button key={cat}
            onClick={() => { setActiveCat(cat); setOpenIndex(0); }}
            style={{
              padding: '8px 16px', borderRadius: 999, border: '1px solid', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: activeCat === cat? '#0f4d3a' : '#fff',
              color: activeCat === cat? '#fff' : '#374151',
              borderColor: activeCat === cat? '#0f4d3a' : '#e5e7eb',
              transition: 'all 0.2s'
            }}>
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((item, i) => {
          const open = openIndex === i;
          return (
            <div key={i} style={{ background: '#fff', border: '1px solid #eef2f7', borderRadius: 16, overflow: 'hidden', boxShadow: open? '0 8px 24px -16px rgba(15,77,58,0.35)' : 'none' }}>
              <button onClick={() => setOpenIndex(open? null : i)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer' }}>
                <span style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>{item.q}</span>
                <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 999, background: open? '#0f4d3a' : '#f3f4f6', color: open? '#fff' : '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{open? '−' : '+'}</span>
              </button>
              {open && <div style={{ padding: '0 20px 18px', color: '#4b5563', lineHeight: 1.7, fontSize: 14 }}>{item.a}</div>}
            </div>
          );
        })}
      </div>

      <p style={{ textAlign: 'center', fontSize: 14, color: '#9ca3af', marginTop: 32 }}>
        Still need help? Contact support from your <span style={{ color: '#0f4d3a', fontWeight: 600 }}>Dashboard</span>.
      </p>
    </div>
  );
}