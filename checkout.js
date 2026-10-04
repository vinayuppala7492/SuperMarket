document.addEventListener('DOMContentLoaded', () => {
    const checkoutItems = document.getElementById('checkout-items');
    const orderItems = document.getElementById('order-items');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const finalTotalElement = document.getElementById('final-total');
    const deliveryForm = document.getElementById('delivery-form');
    
    // Load cart items from localStorage
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const cartTotal = parseFloat(localStorage.getItem('cartTotal')) || 0;
    // Update delivery fee to Indian Rupees
    const deliveryFee = 40.00;
    
    function displayOrderSummary() {
        orderItems.innerHTML = '';
        const itemCounts = {};
        
        // Count quantities for each unique item
        cartItems.forEach(item => {
            if (itemCounts[item.name]) {
                itemCounts[item.name].quantity++;
                itemCounts[item.name].total += item.price;
            } else {
                itemCounts[item.name] = {
                    price: item.price,
                    quantity: 1,
                    total: item.price
                };
            }
        });
        
        // Display unique items with their quantities
        for (const [name, data] of Object.entries(itemCounts)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${name}</td>
                <td>${data.quantity}</td>
                <td>₹${data.price.toFixed(2)}</td>
                <td>₹${data.total.toFixed(2)}</td>
            `;
            orderItems.appendChild(row);
        }
        
        // Update totals
        const subtotal = Object.values(itemCounts).reduce((sum, item) => sum + item.total, 0);
        subtotalElement.textContent = subtotal.toFixed(2);
        totalElement.textContent = (subtotal + deliveryFee).toFixed(2);
    }

    // Handle form submission
    deliveryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Generate and print receipt
        const receipt = generateReceipt();
        printReceipt(receipt);
        
        // Alert and clear cart
        alert('Order placed successfully!');
        localStorage.removeItem('cartItems');
        localStorage.removeItem('cartTotal');
        
        // Redirect to home
        window.location.href = 'home.html';
    });

    function generateReceipt() {
        const name = document.getElementById('name').value;
        const address = document.getElementById('address').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const paymentMethod = document.getElementById('payment').value;
        const date = new Date().toLocaleString();
        const orderId = 'ORD' + Date.now();

        let receiptHTML = `
            <div class="receipt" style="padding: 20px; font-family: Arial;">
                <h2 style="text-align: center;">SuperMarket</h2>
                <p style="text-align: center;">Order Receipt</p>
                <hr>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Customer Details:</strong></p>
                <p>Name: ${name}</p>
                <p>Address: ${address}</p>
                <p>Phone: ${phone}</p>
                <p>Email: ${email}</p>
                <hr>
                <h3>Order Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 8px;">Item</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Qty</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
                    </tr>
                    ${generateOrderItemsHTML()}
                </table>
                <hr>
                <p style="text-align: right;"><strong>Subtotal:</strong> ₹${subtotalElement.textContent}</p>
                <p style="text-align: right;"><strong>Delivery Fee:</strong> ₹${deliveryFee.toFixed(2)}</p>
                <p style="text-align: right;"><strong>Total Amount:</strong> ₹${totalElement.textContent}</p>
                <hr>
                <p><strong>Payment Method:</strong> ${paymentMethod.toUpperCase()}</p>
                <p style="text-align: center; margin-top: 20px;">Thank you for shopping with us!</p>
            </div>
        `;
        return receiptHTML;
    }

    function generateOrderItemsHTML() {
        let html = '';
        const itemCounts = {};
        
        cartItems.forEach(item => {
            if (itemCounts[item.name]) {
                itemCounts[item.name].quantity++;
                itemCounts[item.name].total += item.price;
            } else {
                itemCounts[item.name] = {
                    price: item.price,
                    quantity: 1,
                    total: item.price
                };
            }
        });

        for (const [name, data] of Object.entries(itemCounts)) {
            html += `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${name}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${data.quantity}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">₹${data.price.toFixed(2)}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">₹${data.total.toFixed(2)}</td>
                </tr>
            `;
        }
        return html;
    }

    function printReceipt(receiptHTML) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(receiptHTML);
        printWindow.document.close();
        printWindow.print();
    }
    // Initialize the order summary
    displayOrderSummary();
    // Add this to your existing checkout.js
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    // Get the voice control button and payment select
    const voiceControlBtn = document.getElementById('payment-voice-control');
    const paymentSelect = document.getElementById('payment');
    
    // Voice control button click handler
    voiceControlBtn.addEventListener('click', () => {
        voiceControlBtn.classList.add('listening');
        recognition.start();
    });
    
    // Speech recognition results handler
    recognition.onresult = (event) => {
        const voiceResult = event.results[0][0].transcript.toLowerCase();
        
        // Map voice commands to payment options
        if (voiceResult.includes('credit') || voiceResult.includes('credit card')) {
            paymentSelect.value = 'credit';
        } else if (voiceResult.includes('debit') || voiceResult.includes('debit card')) {
            paymentSelect.value = 'debit';
        } else if (voiceResult.includes('upi') || voiceResult.includes('u p i')) {
            paymentSelect.value = 'upi';
        } else if (voiceResult.includes('cash') || voiceResult.includes('cash on delivery')) {
            paymentSelect.value = 'cash';
        }
        
        // Trigger the change event to show/hide payment details
        paymentSelect.dispatchEvent(new Event('change'));
        voiceControlBtn.classList.remove('listening');
    };
    
    // Error handling
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        voiceControlBtn.classList.remove('listening');
        alert('Voice recognition failed. Please try again or select manually.');
    };
    
    // Reset button state when recognition ends
    recognition.onend = () => {
        voiceControlBtn.classList.remove('listening');
    };
    document.getElementById('payment').addEventListener('change', function(e) {
        const cardDetails = document.getElementById('card-details');
        const upiDetails = document.getElementById('upi-details');
        
        // Hide all payment details first
        cardDetails.style.display = 'none';
        upiDetails.style.display = 'none';
        
        // Show relevant payment details based on selection
        switch(e.target.value) {
            case 'credit':
            case 'debit':
                cardDetails.style.display = 'block';
                break;
            case 'upi':
                upiDetails.style.display = 'block';
                break;
        }
    });
    // Add validation functions
    function validateName(name) {
        return name.length >= 3 && /^[a-zA-Z\s]+$/.test(name);
    }
    
    function validatePhone(phone) {
        return /^[6-9]\d{9}$/.test(phone); // Indian phone number format
    }
    
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    // Add input event listeners for real-time validation
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    
    nameInput.addEventListener('input', function() {
        if (!validateName(this.value)) {
            this.setCustomValidity('Please enter a valid name (minimum 3 characters, letters only)');
            this.classList.add('invalid');
        } else {
            this.setCustomValidity('');
            this.classList.remove('invalid');
        }
    });
    
    phoneInput.addEventListener('input', function() {
        if (!validatePhone(this.value)) {
            this.setCustomValidity('Please enter a valid 10-digit Indian mobile number');
            this.classList.add('invalid');
        } else {
            this.setCustomValidity('');
            this.classList.remove('invalid');
        }
    });
    
    emailInput.addEventListener('input', function() {
        if (!validateEmail(this.value)) {
            this.setCustomValidity('Please enter a valid email address');
            this.classList.add('invalid');
        } else {
            this.setCustomValidity('');
            this.classList.remove('invalid');
        }
    });
    
    // Add this CSS to your styles.css file
});