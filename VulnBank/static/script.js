/**
 * VulnBank - Client-side JavaScript
 * This file contains code for the VulnBank web application.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Format credit card input
    const cardNumberInput = document.getElementById('card_number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 16) {
                value = value.substr(0, 16);
            }
            
            // Format with spaces every 4 digits
            let formattedValue = '';
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }
            
            e.target.value = formattedValue;
        });
    }
    
    // Format expiry date
    const expiryDateInput = document.getElementById('expiry_date');
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 4) {
                value = value.substr(0, 4);
            }
            
            if (value.length > 2) {
                value = value.substr(0, 2) + '/' + value.substr(2);
            }
            
            e.target.value = value;
        });
    }
    
    // Format CVV
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 3) {
                value = value.substr(0, 3);
            }
            
            e.target.value = value;
        });
    }
    
    // Store card data in local storage for convenience
    const rememberCheckbox = document.getElementById('save_card');
    const paymentForm = document.getElementById('paymentForm');
    
    if (paymentForm && rememberCheckbox) {
        // Load saved card details if they exist
        if (localStorage.getItem('card_details')) {
            const savedDetails = JSON.parse(localStorage.getItem('card_details'));
            document.getElementById('card_number').value = savedDetails.card_number || '';
            document.getElementById('card_holder').value = savedDetails.card_holder || '';
            document.getElementById('expiry_date').value = savedDetails.expiry_date || '';
            document.getElementById('cvv').value = savedDetails.cvv || '';
            document.getElementById('save_card').checked = true;
        }
        
        // Save card details if checkbox is checked
        paymentForm.addEventListener('submit', function() {
            if (rememberCheckbox.checked) {
                const cardDetails = {
                    card_number: document.getElementById('card_number').value,
                    card_holder: document.getElementById('card_holder').value,
                    expiry_date: document.getElementById('expiry_date').value,
                    cvv: document.getElementById('cvv').value
                };
                
                // Save card details for later use
                localStorage.setItem('card_details', JSON.stringify(cardDetails));
            }
        });
    }
    
    // Load account data via API
    function loadAccountData() {
        // API call without encryption or token-based authentication
        fetch('/api/account-details')
            .then(response => response.json())
            .then(data => {
                console.log('Account data loaded:', data);
                // Do something with the data
            })
            .catch(error => {
                console.error('Error loading account data:', error);
            });
    }
    
    // Call loadAccountData periodically to keep the dashboard updated
    if (document.getElementById('dashboard-container')) {
        loadAccountData();
        // Refresh data every 30 seconds
        setInterval(loadAccountData, 30000);
    }
});
