import React from 'react';

export default function Terms(){
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-sm leading-6 text-gray-800">
      <h1 className="text-2xl font-bold mb-2">Terms & Conditions</h1>
      <p className="text-gray-500 mb-6">Last updated: 03 Oct 2026 | Ask Kin - ask-kin.com</p>

      <h2 className="font-bold mt-6 mb-2">1. What Ask Kin Is</h2>
      <p className="mb-4">Ask Kin via ask-kin.com is a technology platform connecting fundraisers with donors across Uganda, Kenya, Tanzania, Rwanda, Zambia. We do not guarantee fundraising success. We are not a charity or bank. Funds collected by licensed Financial Aggregator in escrow.</p>

      <h2 className="font-bold mt-6 mb-2">2. Eligibility</h2>
      <p className="mb-4">18+ years, valid Government ID (NIN/Passport/Refugee ID), Mobile Money/Bank account in same name as ID. Countries for payout V1: Uganda, Kenya, Tanzania, Rwanda, Zambia. Country chosen at creation cannot be changed after publishing.</p>

      <h2 className="font-bold mt-6 mb-2">3. Campaigns</h2>
      <ul className="list-disc ml-5 mb-4">
        <li>Must be truthful, lawful, and belong to allowed categories: Medical, Education, Family, Burials, Happy Moments, Business, Community, Emergencies</li>
        <li>Prohibited: fraud, money laundering, terrorism, weapons/drugs, gambling, pyramid, hate, sexual exploitation, doxxing, fundraising without consent (except minors/incapacitated by guardian)</li>
        <li>We may reject, suspend, or remove campaigns that violate policy</li>
        <li>Owner can edit story/photo/goal but not country, currency, or payout account after first donation without support verification</li>
      </ul>

      <h2 className="font-bold mt-6 mb-2">4. Donations & Fees</h2>
      <p className="mb-4">Minimum UGX 1,000. No maximum (large donations &gt;UGX 10M may need verification). One fee: 10% per donation deducted automatically to cover aggregator, MoMo/bank, and platform costs. Example: 100k donated → 90k to organizer. No listing or withdrawal fees. International cards may incur bank FX fees. Donations final, refunds only for proven fraud or double-charge within 48h with transaction ID.</p>

      <h2 className="font-bold mt-6 mb-2">5. Payouts</h2>
      <p className="mb-4">Automatic every Monday 11:00 AM EAT if balance ≥ UGX 50,000 (or equivalent). MoMo within 2 hours, Bank 24-48h. Less than 50k rolls to next Monday. Name on payout account must match ID. All payouts via api.ask-kin.com through licensed aggregator.</p>

      <h2 className="font-bold mt-6 mb-2">6. Your Responsibilities</h2>
      <ul className="list-disc ml-5 mb-4">
        <li>Provide accurate info and use funds as described</li>
        <li>Post updates and be accountable to donors</li>
        <li>Do not misuse platform. Fraud may lead to account closure and legal action</li>
      </ul>

      <h2 className="font-bold mt-6 mb-2">7. Liability</h2>
      <p className="mb-4">Platform provided as-is. Not liable for donor actions, campaign outcomes, or delays by banks/MoMo/aggregator. Maximum liability limited to fees received in last 3 months.</p>

      <h2 className="font-bold mt-6 mb-2">8. Termination</h2>
      <p className="mb-4">You may close account. Campaigns with funds must be Closed not Deleted for audit. We may suspend for violations.</p>

      <h2 className="font-bold mt-6 mb-2">9. Governing Law</h2>
      <p className="mb-4">Laws of Uganda. Disputes via negotiation then courts of Uganda.</p>

      <h2 className="font-bold mt-6 mb-2">10. Contact & Agreement</h2>
      <p>Support: support@ask-kin.com | Website: https://ask-kin.com<br/>By creating account or donating, you agree to these Terms and our Privacy Policy at https://ask-kin.com/privacy-policy</p>
    </div>
  )
}

