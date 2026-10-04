// Initialize cart variables
let cartItems = [];
let cartTotal = 0;

// Get DOM elements
const cartBtn = document.querySelector('.cart');
const cartPopup = document.getElementById('cart-popup');
const cartItemsList = document.getElementById('cart-items');
const cartCountElement = document.querySelector('.cart-count');
const cartSubtotalElement = document.getElementById('cart-subtotal');
const cartTotalElement = document.getElementById('cart-total');

// Add to cart functionality
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
        const itemCard = e.target.closest('.item-card');
        const name = itemCard.getAttribute('data-name');
        const price = parseFloat(itemCard.getAttribute('data-price'));
        
        // Add item to cart
        cartItems.push({ name, price });
        cartTotal += price;
        
        // Update cart count
        cartCountElement.textContent = cartItems.length;
        
        // Show feedback
        button.textContent = 'Added!';
        button.style.backgroundColor = '#45a049';
        setTimeout(() => {
            button.textContent = 'Add to Cart';
            button.style.backgroundColor = '#4CAF50';
        }, 1000);
        
        // Update cart popup
        updateCartPopup();
        
        // Save to localStorage
        saveCartToStorage();
    });
});

// Update cart popup content
function updateCartPopup() {
    cartItemsList.innerHTML = '';
    let subtotal = 0;
    
    cartItems.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.name}</span>
            <div class="item-price">
                <span>₹${item.price.toFixed(2)}</span>
                <button onclick="removeItem(${index})" class="remove-item">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        cartItemsList.appendChild(li);
        subtotal += item.price;
    });
    
    cartSubtotalElement.textContent = subtotal.toFixed(2);
    cartTotalElement.textContent = (subtotal + 40.00).toFixed(2); // Adding ₹40 delivery fee
}

// Remove item from cart
function removeItem(index) {
    cartTotal -= cartItems[index].price;
    cartItems.splice(index, 1);
    cartCountElement.textContent = cartItems.length;
    updateCartPopup();
    saveCartToStorage();
}

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    localStorage.setItem('cartTotal', cartTotal.toString());
}

// Load cart from localStorage
function loadCartFromStorage() {
    const savedItems = localStorage.getItem('cartItems');
    const savedTotal = localStorage.getItem('cartTotal');
    
    if (savedItems && savedTotal) {
        cartItems = JSON.parse(savedItems);
        cartTotal = parseFloat(savedTotal);
        cartCountElement.textContent = cartItems.length;
        updateCartPopup();
    }
}

// Toggle cart popup
cartBtn.addEventListener('click', () => {
    cartPopup.style.display = 'flex';
});

// Close cart popup
document.getElementById('close-cart').addEventListener('click', () => {
    cartPopup.style.display = 'none';
});

// Close cart when clicking outside
cartPopup.addEventListener('click', (e) => {
    if (e.target === cartPopup) {
        cartPopup.style.display = 'none';
    }
});

// Checkout button
document.getElementById('checkout-btn').addEventListener('click', () => {
    if (cartItems.length > 0) {
        window.location.href = 'checkout.html';
    } else {
        alert('Your cart is empty!');
    }
});

// Load cart on page load
document.addEventListener('DOMContentLoaded', loadCartFromStorage);


// Category toggle functionality
document.querySelectorAll('.category-card h3').forEach(header => {
  header.addEventListener('click', () => {
    const card = header.closest('.category-card');
    const itemsGrid = card.querySelector('.items-grid');
    
    // Toggle active class
    header.classList.toggle('active');
    card.classList.toggle('active');
    
    // Smooth height transition
    if (card.classList.contains('active')) {
      itemsGrid.style.display = 'grid';
    } else {
      itemsGrid.style.display = 'none';
    }
  });
});

// Voice Search Implementation
const voiceSearchBtn = document.getElementById('voice-search');
const searchInput = document.getElementById('search-input');

// Initialize speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.continuous = false;
recognition.interimResults = false;

// Voice search button click handler
voiceSearchBtn.addEventListener('click', () => {
    voiceSearchBtn.classList.add('listening');
    recognition.start();
});

// Speech recognition results handler
recognition.onresult = (event) => {
    const voiceResult = event.results[0][0].transcript.toLowerCase();
    searchInput.value = voiceResult;
    searchProducts(voiceResult);
    voiceSearchBtn.classList.remove('listening');
};

// Search products function
function searchProducts(query) {
    const items = document.querySelectorAll('.item-card');
    query = query.toLowerCase();

    items.forEach(item => {
        const name = item.getAttribute('data-name').toLowerCase();
        const category = item.closest('.category-card').querySelector('h3').textContent.toLowerCase();
        
        if (name.includes(query) || category.includes(query)) {
            item.style.display = 'block';
            item.closest('.category-card').classList.add('active');
        } else {
            item.style.display = 'none';
        }
    });
}

// Error handling
recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    voiceSearchBtn.classList.remove('listening');
    alert('Voice recognition failed. Please try again or type your search.');
};

// Reset search when recognition ends
recognition.onend = () => {
    voiceSearchBtn.classList.remove('listening');
};

// Text search input handler
searchInput.addEventListener('input', (e) => {
    searchProducts(e.target.value);
});
