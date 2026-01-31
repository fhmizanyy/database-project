document.querySelector('.sell-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    
    formData.append('productName', document.getElementById('title').value);
    formData.append('productDescription', document.getElementById('description').value);
    formData.append('productPrice', document.getElementById('price').value);
    formData.append('categoryId', document.getElementById('category').value);
    formData.append('condition', document.getElementById('condition').value);
    formData.append('quantity', document.getElementById('quantity').value);
    formData.append('sellerId', 1000); 

    const fileInput = document.getElementById('imageInput'); 
    if (fileInput.files.length > 0) {
        formData.append('productImage', fileInput.files[0]);
    }

    try {
        const response = await fetch('http://localhost:3000/api/add-product', {
            method: 'POST',
            body: formData 
        });

        const result = await response.json();
        if (result.success) {
            alert('Success! Item and Image have been registered.');
            window.location.href = 'marketPlace.html';
        } else {
            alert("Error: " + result.message);
        }

    } catch (error) {
        console.error("Error:", error);
        alert('Could not connect to server');
    }
});