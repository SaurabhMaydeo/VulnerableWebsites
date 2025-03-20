// Main JavaScript file for ToyVerse

document.addEventListener('DOMContentLoaded', function() {
    // Update navigation based on login status
    updateNavigation();
    
    // Load featured products on homepage
    if (document.getElementById('featured-products')) {
        loadFeaturedProducts();
    }
});

// Function to update navigation based on login status
function updateNavigation() {
    const loginStatus = document.getElementById('login-status');
    if (!loginStatus) return;
    
    const userId = getCookie('user_id');
    const username = getCookie('username');
    
    if (userId) {
        loginStatus.textContent = username || 'Dashboard';
        loginStatus.href = '/dashboard';
    } else {
        loginStatus.textContent = 'Login';
        loginStatus.href = '/login';
    }
}

// Function to load featured products on homepage
function loadFeaturedProducts() {
    const featuredContainer = document.getElementById('featured-products');
    
    fetch('/api/products')
        .then(response => response.json())
        .then(products => {
            // Get random 4 products for featured section
            const featuredProducts = products.sort(() => 0.5 - Math.random()).slice(0, 4);
            
            featuredContainer.innerHTML = '';
            
            featuredProducts.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                
                productCard.innerHTML = `
                    <div class="product-image">
                        <img src="/images/${product.image}" alt="${product.name}" onerror="this.src='/images/placeholder.jpg'">
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="product-category">${product.category}</p>
                        <p class="product-price">$${product.price.toFixed(2)}</p>
                        <button class="btn btn-primary add-to-cart" data-id="${product.id}">Add to Cart</button>
                    </div>
                `;
                
                featuredContainer.appendChild(productCard);
            });
            
            // Add event listeners to Add to Cart buttons
            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', function() {
                    const userId = getCookie('user_id');
                    if (!userId) {
                        window.location.href = '/login';
                    } else {
                        alert('Product added to cart!');
                    }
                });
            });
        })
        .catch(error => {
            console.error('Error loading featured products:', error);
            featuredContainer.innerHTML = '<p class="error">Failed to load featured products. Please try again later.</p>';
        });
}

// Helper function to get cookie value
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Helper function to set cookie
function setCookie(name, value, days) {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${value}${expires}; path=/`;
}

// Helper function to validate form inputs
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// Helper function to show error messages
function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}
