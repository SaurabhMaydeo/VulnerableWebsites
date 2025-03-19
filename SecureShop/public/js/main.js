document.addEventListener('DOMContentLoaded', () => {
  // Fetch all products when the page loads
  fetchProducts();

  // Check for search parameter in URL
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('q');
  if (searchQuery) {
    // VULNERABLE: Display search query from URL without sanitization
    document.getElementById('search-input').value = searchQuery;
    searchProducts(searchQuery);
  }

  // Add event listener for the search form
  const searchForm = document.getElementById('search-form');
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value;
    
    if (query) {
      // Update URL with search query
      window.history.pushState({}, '', '/?q=' + query);
      searchProducts(query);
    }
  });
});

async function fetchProducts() {
  try {
    const response = await fetch('/api/products');
    const products = await response.json();
    
    displayProducts(products, 'products-container');
  } catch (error) {
    console.error('Error fetching products:', error);
    showError('Failed to load products. Please try again later.');
  }
}

async function searchProducts(query) {
  try {
    // VULNERABLE: No encoding of query parameter
    const response = await fetch('/api/search?q=' + query);
    const data = await response.json();
    
    // VULNERABLE: Directly insert user input into HTML
    const searchQueryElement = document.getElementById('search-query');
    searchQueryElement.innerHTML = query;
    
    // Display search results with XSS vulnerability
    const searchResultsSection = document.getElementById('search-results');
    searchResultsSection.classList.remove('hidden');
    
    // VULNERABLE: Display results with potential XSS in product names
    const resultsContainer = document.getElementById('search-products');
    resultsContainer.innerHTML = '';
    
    if (data.results.length === 0) {
      // VULNERABLE: Display "no results" message with XSS
      resultsContainer.innerHTML = `<p>No results found for: ${query}</p>`;
    } else {
      data.results.forEach(product => {
        // VULNERABLE: Display product info with XSS
        resultsContainer.innerHTML += `
          <div class="product-card">
            <img src="https://via.placeholder.com/300x200?text=${product.name}" alt="${product.name}">
            <div class="product-info">
              <h3>${product.name}</h3>
              <div class="product-price">$${product.price}</div>
              <a href="/product/${product.id}" class="view-button">View Details</a>
            </div>
          </div>
        `;
      });
    }
    
    // Scroll to search results
    searchResultsSection.scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error('Error searching products:', error);
    // VULNERABLE: Display error with XSS
    document.getElementById('search-products').innerHTML = 
      `<p class="error">Error searching for: ${query}</p>`;
  }
}

function displayProducts(products, containerId) {
  const container = document.getElementById(containerId);
  container.textContent = ''; // Safely clear container
  
  if (products.length === 0) {
    const noProducts = document.createElement('p');
    noProducts.textContent = 'No products found.';
    container.appendChild(noProducts);
    return;
  }
  
  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    
    // Create and append elements safely
    const img = document.createElement('img');
    img.src = `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.name)}`;
    img.alt = product.name;
    
    const info = document.createElement('div');
    info.className = 'product-info';
    
    const name = document.createElement('h3');
    name.textContent = product.name;
    
    const price = document.createElement('div');
    price.className = 'product-price';
    price.textContent = `$${product.price.toFixed(2)}`;
    
    const link = document.createElement('a');
    link.href = `/product/${product.id}`;
    link.className = 'view-button';
    link.textContent = 'View Details';
    
    info.append(name, price, link);
    productCard.append(img, info);
    container.appendChild(productCard);
  });
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 5000);
}
