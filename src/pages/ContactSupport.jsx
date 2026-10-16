import SupportContact from '../components/SupportContact.jsx';

export default function ContactSupport() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f4d3a', marginBottom: 8 }}>Contact Support</h1>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
          Need help with Ask Kin Verified, payouts, bank account matching, KYC supporting documents, or campaign issues? Reach our human team directly. For AI help, visit Ask Kin Assistant.
        </p>

        {/* Reuses your already-tested SupportContact - same WhatsApp 256780792170 + Live Chat flow */}
        <SupportContact />

        <div style={{ marginTop: 20, background: '#f8fafc', borderRadius: 12, padding: 16, fontSize: 13, color: '#475569', border: '1px solid #e2e8f0' }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>How we help:</div>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li>Ask Kin Verified — campaign verification</li>
            <li>Payouts & bank account name matching</li>
            <li>KYC supporting documents (Photo ID & selfies)</li>
            <li>Campaign issues & account help</li>
          </ul>
          <div style={{ marginTop: 12, fontSize: 11, color: '#94a3b8' }}>
            WhatsApp fastest • Live chat during EAT working hours • Admin number private behind wa.me link
          </div>
        </div>
      </div>
    </div>
  );
}
