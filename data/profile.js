import {loadProductsFromAPI,priceCentsFixed} from '../script/marketPlace.js'


  const sidebar = document.querySelector('.side-navigation');
  const menuBtn = document.querySelector('.js-menu-btn');
  const closeBtn = document.querySelector('.js-close-btn');
  const popup = document.getElementById('updatePopup');
  const productsHTML = document.querySelector('.js-container-update-product');

if(closeBtn){
  closeBtn.addEventListener('click', closeNav);
}

if(menuBtn){
  menuBtn.addEventListener('click', openNav);
}

function closeNav() {
  if (sidebar) sidebar.style.width = '0'
};

function openNav() {
  if (sidebar) sidebar.style.width = '250px'
};

async function initSelfProducts(){
  
  try {
    const productsData = await loadProductsFromAPI();
    if(productsData){
      renderProductsUser(productsData);
      attachUpdateListeners(productsData);
    
    } else {
    if(productsHTML) 
      productsHTML.innerHTML = 'The Product has fail to load.';
    }  
  } catch(error){
    console.error('Initialization error:', error);
  }
}



function renderProductsUser(productsData){
  if(!productsHTML) return;
    productsHTML.innerHTML = '';

  productsData.forEach((dataItem) => {
    const productHTML = 
      `
        <div class="product-container js-container-grid">
                <div class="image-container">
                  <img class="image-products" src=${dataItem.image}>
                </div>
                <div class="category-name">
                  ${dataItem.category}
                </div>
                
                <div class="product-name">
                  ${dataItem.title}
                </div>
                
                <div class="product-mahallah">
                    ${dataItem.mahallah}
                </div>
                <div class="product-price">
                  RM${priceCentsFixed(dataItem.price)}
                </div>
                <div class="product-quantity">
                    ${dataItem.quantity}
                </div>

                <div class="update-user">
                    <button class="update-button js-update-product" data-product-id="${dataItem.id}">Update Item</button>
                </div>
        
                <div class="product-delete">
                  <button class="delete-product-button js-delete-product" data-product-id="${dataItem.id}">Delete Item</button>
                </div>
              </div>
        
      `

    productsHTML.insertAdjacentHTML('beforeend',productHTML);
  })
}
 

async function handleUpdate() {
    const productId = document.getElementById('update-product-id').value;
    const title = document.getElementById('update-title').value;
    const quantity = document.getElementById('update-quantity').value;
    const price = document.getElementById('update-price').value;

    if (!title || !quantity || !price) {
        alert("Please fill in at least one fields");
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:3000/api/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,price,quantity
            })
        });

        const result = await response.json();
        if (result.success) {
            alert('Updated!');
            location.reload(); 
        }
    } catch (error) {
        console.error('Update failed:', error);
        alert('failed to connect to server. Check if node.js is running');
    }
}

function openUpdateModal(product) {
    if(!popup) return;
    
    document.getElementById('update-product-id').value = product.id;
    document.getElementById('update-title').value = product.title;
    document.getElementById('update-quantity').value = product.quantity;
    document.getElementById('update-price').value = product.price;
    
    
    popup.style.display = 'flex';

}

function attachUpdateListeners(productsData) {
    document.querySelectorAll('.js-update-product').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId;
            const product = productsData.find (p => p.id == productId);
            if (product) openUpdateModal(product);
        });
    });

    document.querySelectorAll('.js-delete-product').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId;
            handleDelete(productId);
        });
    });


}

async function handleDelete(productId) {
    const confirmation = confirm("Do you want to delete this item ? 🥺");
    
    if (!confirmation) return;

    try {
        const response = await fetch(`http://127.0.0.1:3000/api/products/${productId}`, {
            method: 'DELETE', 
        });

        const result = await response.json();

        if (result.success) {
            alert('Products have been deleted !✨');
            location.reload(); 
        } else {
            alert('Failed to deleted ' + result.message);
        }
    } catch (error) {
        console.error('Delete failed:', error);
        alert('Error duriing deleting items');
    }
}

document.getElementById('closePopup')?.addEventListener('click' , () => {
  popup.style.display = 'none';
});

document.getElementById('saveUpdate')?.addEventListener('click', () => {handleUpdate()});

initSelfProducts();





