// Intentionally vulnerable to XSS
function displaySearchResults(results) {
    const container = document.getElementById('searchResults');
    container.innerHTML = results; // Vulnerable to XSS
}

// Example of unsafe direct DOM manipulation
function updateProfile(data) {
    document.getElementById('userProfile').innerHTML = data; // Vulnerable to XSS
}
