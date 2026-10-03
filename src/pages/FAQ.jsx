
import { useState, useMemo } from "react";
import { faqs } from "../data/faq.js";
import SupportContact from "../components/SupportContact.jsx";

const categories = [...new Set(faqs.map(f => f.category))];

export default function FAQ() {
  const [activeCat, setActiveCat] = useState(categories[0]);
  const [openIndex, setOpenIndex] = useState(0);
  const [search, setSearch] = useState("");

  const filtered = useMemo(()=>{
    let list = faqs;
    if(search.trim()){
      const s = search.toLowerCase();
      list = faqs.filter(f => 
        f.q.toLowerCase().includes(s) || 
        f.a.toLowerCase().includes(s) || 
        (f.keywords||[]).some(k=>k.toLowerCase().includes(s)) ||
        f.category.toLowerCase().includes(s)
      );
    } else {
      list = faqs.filter(f => f.category === activeCat);
    }
    return list;
  }, [activeCat, search]);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 16px 80px' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 800, textAlign: 'center', letterSpacing: '-0.5px', color: '#0f172a' }}>Frequently Asked Questions</h1>
      <p style={{ textAlign: 'center', color: '#6b7280', marginTop: 10, fontSize: '14px', lineHeight:1.6, maxWidth:600, marginLeft:'auto', marginRight:'auto' }}>
        Browse by category or use search to find answers instantly. Click any question to expand the answer.
      </p>

      <div style={{ maxWidth: 520, margin: '20px auto 0', position:'relative' }}>
        <input 
          value={search} 
          onChange={e=>{setSearch(e.target.value); setOpenIndex(0);}} 
          placeholder="Search: fees, payout, anonymous, diaspora, refund..."
          style={{ width:'100%', padding:'12px 16px 12px 40px', borderRadius:999, border:'1px solid #e5e7eb', fontSize:14, outline:'none' }}
        />
        <span style={{ position:'absolute', left:14, top:12, color:'#9ca3af' }}>🔍</span>
        {search && <button onClick={()=>setSearch("")} style={{ position:'absolute', right:12, top:8, background:'#f3f4f6', border:'none', borderRadius:999, width:28, height:28, cursor:'pointer' }}>×</button>}
      </div>

      {!search && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', margin: '24px 0 28px' }}>
          {categories.map(cat => (
            <button key={cat}
              onClick={() => { setActiveCat(cat); setOpenIndex(0); }}
              style={{
                padding: '8px 16px', borderRadius: 999, border: '1px solid', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: activeCat === cat? '#0f4d3a' : '#fff',
                color: activeCat === cat? '#fff' : '#374151',
                borderColor: activeCat === cat? '#0f4d3a' : '#e5e7eb',
              }}>
              {cat}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length===0 && <div style={{ textAlign:'center', padding:40, color:'#6b7280' }}>No results for "{search}". Try: fees, payout, anonymous, refund, verification.</div>}
        {filtered.map((item, i) => {
          const open = openIndex === i;
          return (
            <div key={i} style={{ background: '#fff', border: '1px solid #eef2f7', borderRadius: 16, overflow: 'hidden' }}>
              <button onClick={() => setOpenIndex(open? null : i)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer' }}>
                <span style={{ fontWeight: 600, fontSize: 15, color: '#111827', paddingRight:12 }}>{item.q}</span>
                <span style={{ width: 28, height: 28, borderRadius: 999, background: open? '#0f4d3a' : '#f3f4f6', color: open? '#fff' : '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink:0 }}>{open? '−' : '+'}</span>
              </button>
              {open && <div style={{ padding: '0 20px 18px', color: '#4b563', lineHeight: 1.7, fontSize: 14, whiteSpace:'pre-wrap' }}>
                {item.a}
                <div style={{ marginTop:8, fontSize:11, color:'#9ca3af' }}>{item.category}</div>
              </div>}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '48px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a' }}>Still need help?</div>
          <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }}>
            Contact our support team directly. For AI help, visit <a href="/assistant" style={{color:'#0f4d3a', fontWeight:700, textDecoration:'none'}}>Ask Kin Assistant</a>.
          </div>
        </div>
        <SupportContact />
      </div>
    </div>
  );
}

