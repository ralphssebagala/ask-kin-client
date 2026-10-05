import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16 text-[15px] leading-7 text-gray-800">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Last updated: 03 October 2026 • Ask Kin • ask-kin.com • Version 1.1</p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <strong>Summary:</strong> Ask Kin is a crowdfunding technology platform, not a bank or charity. We connect organizers with donors. Funds are collected and held in segregated escrow by a Central Bank-licensed Financial Aggregator. We never store your Mobile Money PIN, card CVV, or password.
          </div>
        </div>

        <p className="mb-8"><strong>Ask Kin</strong> ("we", "us", "our") operates <strong>https://ask-kin.com</strong> and the Ask Kin mobile app. This policy explains how we collect, use, and protect your data under the Uganda Data Protection & Privacy Act 2019 and applicable laws in Kenya, Tanzania, Rwanda, and Zambia. Data Controller: Ask Kin, Kampala, Uganda. Contact: support@ask-kin.com</p>

        <h2 className="text-xl font-bold mt-10 mb-3">1. Data We Collect</h2>
        <ul className="list-disc ml-6 mb-6 space-y-2">
          <li><strong>Identity & Contact:</strong> Full name, phone number, email address, National ID / NIN / Passport / Refugee ID number, selfie/photo holding ID for KYC verification (required by law for payouts).</li>
          <li><strong>Financial (payout only):</strong> Mobile Money number & registered name, Bank account name/number/Bank name, payout currency (UGX/KES/TZS/RWF/ZMW), transaction history. <em>We do NOT store MoMo PINs, mobile banking passwords, card CVV, or CVV2. Payments are processed by PCI-DSS compliant licensed aggregator via api.ask-kin.com.</em></li>
          <li><strong>Campaign Content:</strong> Campaign title, story, photos, videos, funding goal, updates, comments.</li>
          <li><strong>Donor Data:</strong> Donor name (optional anonymous), email for receipt, donation amount. Donors may donate anonymously publicly but we retain receipt data for audit.</li>
          <li><strong>Technical:</strong> Device type, OS, IP address, browser, logs, cookies, approximate location for fraud prevention and analytics.</li>
        </ul>

        <h2 className="text-xl font-bold mt-10 mb-3">2. How and Why We Use Your Data</h2>
        <ul className="list-disc ml-6 mb-6 space-y-2">
          <li><strong>Identity verification & fraud prevention</strong> – Required to prevent fraud, money laundering, and to comply with financial regulations.</li>
          <li><strong>Provide the service</strong> – Create/manage campaigns, process donations via licensed aggregator, trigger automatic payouts every Monday 11:00 AM EAT when balance ≥ UGX 50,000 or equivalent.</li>
          <li><strong>Communications</strong> – SMS/email about donations, payouts, verification status, support replies. You can opt-out of marketing but not transactional messages.</li>
          <li><strong>Legal compliance</strong> – Retain records for tax/audit, respond to lawful requests.</li>
          <li><strong>Improvement</strong> – Analytics to improve UX, security monitoring.</li>
        </ul>

        <h2 className="text-xl font-bold mt-10 mb-3">3. Who We Share With</h2>
        <p className="mb-6">We never sell your data. We share only as strictly needed with:</p>
        <ul className="list-disc ml-6 mb-6 space-y-1">
          <li><strong>Licensed Financial Aggregator / Mobile Money / Banks</strong> – to process donations and payouts.</li>
          <li><strong>ID Verification Provider</strong> – to verify NIN/Passport.</li>
          <li><strong>Cloud hosting (Cloudflare, Oracle Cloud)</strong> – api.ask-kin.com is hosted via Cloudflare Tunnel to our secure backend.</li>
          <li><strong>Analytics / Crash reporting</strong> – anonymized where possible.</li>
          <li><strong>Law enforcement</strong> – only when legally required with valid order.</li>
        </ul>

        <h2 className="text-xl font-bold mt-10 mb-3">4. Retention</h2>
        <p className="mb-6">We keep account and transaction data for <strong>5 years</strong> after account closure for legal/audit obligations (Uganda Financial Laws). Campaign pages that received funds are retained as <strong>Closed (not Deleted)</strong> for donor transparency and audit. ID selfies are stored encrypted and access-restricted, deleted 1 year after verification failure if no transaction.</p>

        <h2 className="text-xl font-bold mt-10 mb-3">5. Your Rights & Data Deletion</h2>
        <p className="mb-4">Per Uganda DPA 2019, you may request:</p>
        <ul className="list-disc ml-6 mb-6 space-y-1">
          <li>Access to your data</li>
          <li>Correction of inaccurate data</li>
          <li>Deletion (where not conflicting with legal 5-year retention or where campaign received funds)</li>
          <li>Object to marketing</li>
        </ul>
        <p className="mb-6">To exercise rights or request account/data deletion, email <strong>support@ask-kin.com</strong> from your registered email with subject "Privacy Request" – we respond within 30 days. In-app: Settings &gt; Account &gt; Request Deletion. For Google Play data safety form: we declare collected data types as listed in Section 1.</p>

        <h2 className="text-xl font-bold mt-10 mb-3">6. Security</h2>
        <p className="mb-6">Data encrypted in transit (TLS 1.3 via Cloudflare) and at rest (AES-256). Oracle DB encrypted. ID documents stored in encrypted private bucket, access restricted to verified staff only. Aggregator holds all user funds in segregated escrow accounts – Ask Kin never touches donor funds directly. Despite safeguards, no system is 100% secure.</p>

        <h2 className="text-xl font-bold mt-10 mb-3">7. Cookies</h2>
        <p className="mb-6">We use essential cookies for login/session and analytics cookies for performance. Manage in browser settings. Mobile app uses device storage for session token.</p>

        <h2 className="text-xl font-bold mt-10 mb-3">8. Children</h2>
        <p className="mb-6">You must be <strong>18+</strong> to create an account and receive payouts. Campaigns for minors (<18) must be created and managed by parent/legal guardian with guardian ID. We do not knowingly collect data from children without guardian consent.</p>

        <h2 className="text-xl font-bold mt-10 mb-3">9. International Transfers</h2>
        <p className="mb-6">Data may be processed in Uganda and other countries where our aggregator/banks operate (KE, TZ, RW, ZM) under standard contractual safeguards.</p>

        <h2 className="text-xl font-bold mt-10 mb-3">10. Changes</h2>
        <p className="mb-6">We will notify material changes via email and in-app banner 14 days before effective. Continued use = acceptance.</p>

        <h2 className="text-xl font-bold mt-10 mb-3">11. Contact</h2>
        <p className="mb-2">Privacy requests & DPO: <strong>support@ask-kin.com</strong></p>
        <p className="mb-2">Website: https://ask-kin.com | Domain: api.ask-kin.com</p>
        <p className="mb-2">Address: Kampala, Uganda</p>
        <p className="mt-8 text-xs text-gray-500 border-t pt-4">This policy is accessible at https://ask-kin.com/privacy-policy and in mobile app at Settings &gt; Privacy Policy as required by Google Play. Data deletion instructions: email support@ask-kin.com. This version replaces all prior versions.</p>
      </div>
    </div>
  )
}

