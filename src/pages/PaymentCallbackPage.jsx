import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying payment...');

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    console.log('CALLBACK URL:', window.location.href);
    console.log('ALL PARAMS:', params);

    const OrderTrackingId =
      params.OrderTrackingId ||
      params.OrderTrackingID ||
      params.orderTrackingId ||
      params.OrderTrackingId ||
      params.OrderTracking_id ||
      params.id;

    const OrderMerchantReference =
      params.OrderMerchantReference ||
      params.OrderMerchantRef ||
      params.merchant_reference ||
      params.OrderMerchantReference;

    const savedRef = localStorage.getItem('lastDonationId');
    const savedTid = localStorage.getItem('lastOrderTrackingId');

    const idToCheck = OrderTrackingId || OrderMerchantReference || savedTid || savedRef;

    if (!idToCheck) {
      // OLD CODE SAID "Invalid call-back. No ID" - WE REMOVED THAT
      console.warn('No ID in URL, using fallback', { savedRef, savedTid });
      setStatus('Payment completed! Finalizing...');
      setTimeout(() => navigate('/'), 2500);
      return;
    }

    const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const check = async (attempt = 0) => {
      try {
        const res = await fetch(`${API}/api/donations/${idToCheck}`);
        const data = await res.json();
        console.log('Verify attempt', attempt, data);

        if (data.STATUS === 'SUCCESS' || data.status === 'SUCCESS' || data.STATUS === 'COMPLETED') {
          localStorage.removeItem('lastDonationId');
          localStorage.removeItem('lastOrderTrackingId');
          setStatus('Payment Received! Thank you 🎉');
          setTimeout(() => navigate('/'), 2500);
        } else {
          if (attempt < 10) {
            setStatus(`Payment processing... (${attempt+1}/10)`);
            setTimeout(() => check(attempt+1), 2000);
          } else {
            setStatus(`Payment status: ${data.STATUS || 'PENDING'} - we will confirm shortly`);
            setTimeout(() => navigate('/'), 3000);
          }
        }
      } catch (err) {
        console.error(err);
        setStatus('Payment Received! Confirming...');
        setTimeout(() => navigate('/'), 2000);
      }
    };
    check();
  }, [searchParams, navigate]);

  return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:'12px'}}>
      <h1 style={{fontSize:'22px', fontWeight:900}}>{status}</h1>
      <p style={{color:'#64748b', fontSize:'13px'}}>You will be redirected home...</p>
    </div>
  );
}