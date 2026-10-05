import React from 'react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16 text-[15px] leading-7 text-gray-800">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Terms & Conditions</h1>
          <p className="text-sm text-gray-500">Last updated: 03 October 2026 • Ask Kin • ask-kin.com • Governing Law: Uganda</p>
        </div>

        <h2 className="text-xl font-bold mt-8 mb-3">1. What Ask Kin Is</h2>
        <p className="mb-6"><strong>Ask Kin via ask-kin.com</strong> is a crowdfunding technology platform connecting fundraisers (organizers) with donors across Uganda, Kenya, Tanzania, Rwanda, Zambia (V1). We are <strong>not a charity, bank, or payment processor</strong>. We do not guarantee fundraising success. All funds are collected and held in segregated escrow by a Central Bank-licensed Financial Aggregator. Payouts are executed via <strong>api.ask-kin.com</strong> through that aggregator.</p>

        <h2 className="text-xl font-bold mt-8 mb-3">2. Eligibility & KYC</h2>
        <p className="mb-6">You must be 18+ years with valid Government ID (NIN / National ID / Passport / Refugee ID) and Mobile Money or Bank account in <strong>same name as ID</strong>. One person, one verified account. Countries for payout V1: Uganda, Kenya, Tanzania, Rwanda, Zambia. Country and currency chosen at campaign creation cannot be changed after publishing or after first donation. We may require selfie with ID and proof of MoMo ownership.</p>

        <h2 className="text-xl font-bold mt-8 mb-3">3. Campaign Rules</h2>
        <ul className="list-disc ml-6 mb-6 space-y-2">
          <li><strong>Allowed categories:</strong> Medical, Education, Family, Burials/Funerals, Happy Moments (Weddings/Birthdays), Business, Community Development, Emergencies/Disasters.</li>
          <li>Campaign must be truthful, lawful, and you must be beneficiary or have written consent (except minors/incapacitated persons by parent/guardian).</li>
          <li><strong>Prohibited:</strong> Fraud, money laundering, terrorism financing, weapons/drugs/alcohol, gambling/betting, pyramid schemes, hate speech, sexual exploitation, child exploitation, doxxing, impersonation, fundraising without consent.</li>
          <li>We may reject, suspend, remove, or limit visibility of any campaign violating policy, at our discretion.</li>
          <li>Owner may edit story/photos/goal but NOT country, currency, or payout account after first donation without support verification via support@ask-kin.com.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">4. Donations & Fees – 10% Flat</h2>
        <div className="bg-gray-50 border rounded-lg p-4 mb-6">
          <p className="mb-2"><strong>Minimum:</strong> UGX 1,000 (or equivalent KES/TZS/RWF/ZMW). No maximum – large donations &gt;UGX 10M or equivalent may require source-of-funds verification (24-48h hold).</p>
          <p className="mb-2"><strong>One fee, no hidden fees:</strong> 10% per donation deducted automatically to cover aggregator charges, MoMo/bank transaction costs, and platform maintenance.</p>
          <p className="mb-2"><strong>Example:</strong> Donor gives 100,000 UGX → Organizer receives 90,000 UGX in available balance. Donor receipt shows full 100k, organizer sees 90k net.</p>
          <p className="mb-2">No listing fee. No withdrawal fee. International cards may incur additional FX fees by donor bank (not by us).</p>
          <p>Donations are final and non-refundable, except proven fraud or verifiable double-charge reported within 48h with transaction ID to support@ask-kin.com.</p>
        </div>

        <h2 className="text-xl font-bold mt-8 mb-3">5. Payouts – Automatic Mondays</h2>
        <p className="mb-6">Payouts are <strong>automatic every Monday 11:00 AM EAT</strong> if available balance ≥ <strong>UGX 50,000 or equivalent</strong> (KES 1,500 / TZS 30,000 / RWF 15,000 / ZMW 500 approx, FX-adjusted). Mobile Money: within 2 hours of batch, Bank: 24-48h business hours. Balance below threshold rolls to next Monday. Name on MoMo/Bank must exactly match verified ID – mismatched payouts will fail and bounce back to balance. All payouts via api.ask-kin.com through licensed aggregator.</p>

        <h2 className="text-xl font-bold mt-8 mb-3">6. Organizer Responsibilities</h2>
        <ul className="list-disc ml-6 mb-6 space-y-1">
          <li>Provide accurate, truthful information and use funds as described in campaign.</li>
          <li>Post at least one update within 14 days of receiving first donation and be accountable to donors.</li>
          <li>Not misuse platform. Fraud, fake documents, or misuse of funds may lead to account closure, forfeiture of balance, and legal action/report to authorities.</li>
          <li>Pay any personal tax obligations on received funds – we do not withhold income tax.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">7. Donor Responsibilities</h2>
        <p className="mb-6">Donors must use lawful funds and understand donations support organizer as described, not a charitable tax deduction. Ask Kin does not guarantee how organizer uses funds, but we provide reporting tools and may intervene for fraud.</p>

        <h2 className="text-xl font-bold mt-8 mb-3">8. Content & IP</h2>
        <p className="mb-6">You retain ownership of campaign content but grant Ask Kin non-exclusive license to host, display, and promote it on ask-kin.com and socials. Do not upload copyrighted material without permission.</p>

        <h2 className="text-xl font-bold mt-8 mb-3">9. Liability & Disclaimers</h2>
        <p className="mb-6">Platform provided "as-is" without warranty. We are not liable for donor actions, campaign outcomes, organizer misuse, or delays/failures by banks, MoMo, or aggregator. To maximum extent permitted by law, our aggregate liability is limited to fees we received from your campaign in last 3 months. Nothing excludes liability for gross negligence or willful misconduct.</p>

        <h2 className="text-xl font-bold mt-8 mb-3">10. Account Closure & Campaign Status</h2>
        <p className="mb-6">You may close account via Settings. Campaigns that received funds must be <strong>Closed, not Deleted</strong>, for audit/transparency – balance (if any) still pays out Mondays. We may suspend/terminate accounts for violations, fraud, or legal request.</p>

        <h2 className="text-xl font-bold mt-8 mb-3">11. Governing Law & Disputes</h2>
        <p className="mb-6">These Terms governed by laws of Uganda. Disputes first via negotiation with support@ask-kin.com (30 days), then courts of Uganda, Kampala jurisdiction. For users in KE/TZ/RW/ZM, local consumer laws also apply where mandatory.</p>

        <h2 className="text-xl font-bold mt-8 mb-3">12. Contact & Agreement</h2>
        <p className="mb-2">Support: <strong>support@ask-kin.com</strong></p>
        <p className="mb-2">Website: https://ask-kin.com • API: https://api.ask-kin.com • Frontend: https://www.ask-kin.com</p>
        <p className="mt-6">By creating an account, publishing a campaign, or donating, you agree to these Terms and our Privacy Policy at https://ask-kin.com/privacy-policy</p>

        <p className="mt-10 text-xs text-gray-500 border-t pt-4">This policy includes fee disclosure (10%), payout schedule (Monday 11AM EAT, 50k min), and prohibited categories as required by Google Play Payments & Financial Services policy. Previous versions superseded.</p>
      </div>
    </div>
  )
}

