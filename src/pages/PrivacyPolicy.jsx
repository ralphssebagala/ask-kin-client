import React from 'react';

export default function PrivacyPolicy(){
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-sm leading-6 text-gray-800">
      <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-gray-500 mb-6">Last updated: 03 Oct 2026 | Ask Kin</p>

      <p className="mb-4"><strong>Ask Kin</strong> ("we") operates <strong>ask-kin.com</strong>. We are a crowdfunding technology platform connecting organizers with donors. We are not a bank or charity. Funds are collected and held by a Central Bank-licensed Financial Aggregator in segregated escrow.</p>

      <h2 className="font-bold mt-6 mb-2">1. Data We Collect</h2>
      <ul className="list-disc ml-5 mb-4">
        <li><strong>Identity:</strong> Name, phone, email, National ID / NIN / Passport / Refugee ID (for verification), selfie/photo holding ID</li>
        <li><strong>Financial:</strong> Mobile Money number & registered name, Bank account name/number, payout currency, transaction history. We do NOT store MoMo PINs, card CVV, or passwords. Payments processed by PCI-DSS compliant aggregator.</li>
        <li><strong>Campaign Content:</strong> Title, story, photos, videos, goal, updates</li>
        <li><strong>Technical:</strong> Device, IP, logs, cookies for fraud prevention</li>
      </ul>

      <h2 className="font-bold mt-6 mb-2">2. Why We Use It</h2>
      <ul className="list-disc ml-5 mb-4">
        <li>Verify identity and prevent fraud</li>
        <li>Create and manage campaigns and payouts (Mon 11:00 AM EAT if ≥ UGX 50,000)</li>
        <li>Process donations via licensed aggregator</li>
        <li>Support and communications (SMS/email about donations/payouts)</li>
        <li>Legal compliance (Uganda Data Protection & Privacy Act 2019 and regional laws)</li>
      </ul>

      <h2 className="font-bold mt-6 mb-2">3. Sharing</h2>
      <p className="mb-4">We share only as needed with: licensed financial aggregator / MoMo / banks for payouts, ID verification provider, hosting/analytics providers. We never sell your data.</p>

      <h2 className="font-bold mt-6 mb-2">4. Retention</h2>
      <p className="mb-4">We keep account and transaction data for 5 years for audit/legal obligations after account closure. Campaign pages that received funds are retained as Closed for transparency.</p>

      <h2 className="font-bold mt-6 mb-2">5. Your Rights</h2>
      <p className="mb-4">You may request access, correction, or deletion (where not conflicting with legal retention) via support@ask-kin.com. You can manage cookies in browser settings.</p>

      <h2 className="font-bold mt-6 mb-2">6. Security</h2>
      <p className="mb-4">Data encrypted in transit and at rest. Access restricted. Aggregator holds funds in segregated escrow, not Ask Kin. ID documents stored in encrypted storage.</p>

      <h2 className="font-bold mt-6 mb-2">7. Children</h2>
      <p className="mb-4">You must be 18+ to create account. Campaigns for minors must be created by parent/guardian.</p>

      <h2 className="font-bold mt-6 mb-2">8. Contact</h2>
      <p className="mb-4">Email: support@ask-kin.com | Domain: https://ask-kin.com | Address: Kampala, Uganda</p>

      <p className="mt-8 text-xs text-gray-500">This policy is accessible at https://ask-kin.com/privacy-policy and inside the app at Settings &gt; Privacy Policy as required by Google Play. Contact for privacy requests: support@ask-kin.com</p>
    </div>
  )
}

