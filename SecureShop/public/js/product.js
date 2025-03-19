document.addEventListener('DOMContentLoaded', () => {
  // Get product ID from URL
  const path = window.location.pathname;
  const productId = parseInt(path.split('/').pop());
  
  if (productId) {
    fetchProductDetails(productId);
    fetchProductReviews(productId);
  }
  
  // Add event listener for the review form
  const reviewForm = document.getElementById('review-form');
  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    submitReview(productId);
  });
  
  // Add event listener for the search form
  const searchForm = document.getElementById('search-form');
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();
    
    if (query) {
      searchProducts(query);
    }
  });
});

async function fetchProductDetails(productId) {
  try {
    const response = await fetch(`/api/products/${productId}`);
    const product = await response.json();
    
    if (response.ok) {
      displayProductDetails(product);
    } else {
      showError('Product not found!');
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Error fetching product details:', error);
    showError('Failed to load product details. Please try again later.');
  }
}

function displayProductDetails(product) {
  // Set page title safely
  document.title = `${DOMPurify.sanitize(product.name)} - SecureShop`;
  
  // Set product details safely using textContent
  document.getElementById('product-name').textContent = product.name;
  document.getElementById('product-price').textContent = product.price.toFixed(2);
  document.getElementById('product-description').textContent = product.description;
  
  // Set image safely
  const productImage = document.getElementById('product-image');
  productImage.src = `https://via.placeholder.com/500x400?text=${encodeURIComponent(product.name)}`;
  productImage.alt = product.name;
}

async function fetchProductReviews(productId) {
  try {
    const response = await fetch(`/api/products/${productId}/reviews`);
    const reviews = await response.json();
    
    displayReviews(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    showError('Failed to load reviews. Please try again later.');
  }
}

function displayReviews(reviews) {
  const reviewsContainer = document.getElementById('reviews-container');
  reviewsContainer.textContent = ''; // Safely clear container
  
  if (reviews.length === 0) {
    const noReviews = document.createElement('p');
    noReviews.textContent = 'No reviews yet. Be the first to review this product!';
    reviewsContainer.appendChild(noReviews);
    return;
  }
  
  reviews.forEach(review => {
    const reviewElement = document.createElement('div');
    reviewElement.className = 'review';
    
    // Create review header
    const header = document.createElement('div');
    header.className = 'review-header';
    
    const username = document.createElement('div');
    username.className = 'review-username';
    username.textContent = review.username;
    
    const rating = document.createElement('div');
    rating.className = 'review-rating';
    rating.textContent = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    
    header.append(username, rating);
    
    // Create review comment
    const comment = document.createElement('div');
    comment.className = 'review-comment';
    comment.textContent = review.comment;
    
    // Add timestamp if available
    if (review.createdAt) {
      const timestamp = document.createElement('div');
      timestamp.className = 'review-timestamp';
      timestamp.textContent = new Date(review.createdAt).toLocaleDateString();
      header.appendChild(timestamp);
    }
    
    reviewElement.append(header, comment);
    reviewsContainer.appendChild(reviewElement);
  });
}

async function submitReview(productId) {
  const username = document.getElementById('username').value.trim();
  const rating = document.getElementById('rating').value;
  const comment = document.getElementById('comment').value.trim();
  
  if (!username || !comment) {
    showError('Please fill in all fields');
    return;
  }
  
  try {
    const response = await fetch(`/api/products/${productId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        rating,
        comment
      })
    });
    
    if (response.ok) {
      // Refresh reviews after submission
      fetchProductReviews(productId);
      
      // Reset form
      document.getElementById('username').value = '';
      document.getElementById('rating').value = '5';
      document.getElementById('comment').value = '';
      
      showSuccess('Review submitted successfully!');
    } else {
      const error = await response.json();
      showError(error.message || 'Failed to submit review. Please try again.');
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    showError('Failed to submit review. Please try again.');
  }
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = message;
  
  document.body.appendChild(successDiv);
  setTimeout(() => successDiv.remove(), 5000);
}
