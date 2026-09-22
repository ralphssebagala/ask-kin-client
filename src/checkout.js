document.getElementById('checkout-btn').addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:5000/api/payment/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include your Authorization token header if required by verifyToken middleware:
                // 'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
                amount: 20,
                currency: 'USD', // or 'UGX' depending on choice
                campaignId: 'general-fund'
            })
        });

        const data = await response.json();

        if (data.status === 'success' && data.redirect_url) {
            // Redirect the donor to Pesapal's hosted payment page
            window.location.href = data.redirect_url;
        } else {
            console.error('Payment initialization failed:', data.error);
            alert('Could not initialize payment. Please try again.');
        }
    } catch (err) {
        console.error('Network or server error:', err);
        alert('An error occurred during checkout setup.');
    }
});