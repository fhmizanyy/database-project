const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('orderId');

async function loadReceipt() {
    const container = document.querySelector('.js-receipt-details');
    
    try {
        // Point ke PORT 3000
        const response = await fetch(`http://localhost:3000/api/receipt/${orderId}`);
        
        // Cek jika response ok sebelum parse JSON
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            const data = result.data;
            container.innerHTML = `
                <p>Order ID: #${data.orderId}</p>
                <p>Customer: ${data.buyer}</p>
                <hr>
                ${data.items.map(item => `
                    <p>${item.productName} (x${item.qty}) - RM${item.price.toFixed(2)}</p>
                `).join('')}
                <hr>
                <h3>Total: RM${data.grandTotal.toFixed(2)}</h3>
            `;
        }
    } catch (err) {
        console.error("Error loading receipt:", err);
        container.innerHTML = `<p style="color:red">Failed to load receipt details.</p>`;
    }
}

if (orderId) {
    loadReceipt();
}