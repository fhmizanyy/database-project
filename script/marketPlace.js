import {cart,addToCart} from '../data/cart.js';

export let products = [];


export async function loadProductsFromAPI() {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/products');
    products = await response.json();
    return products;
  } catch (error) {
    console.error('Failed to load products',error);
    const productsHTML = document.querySelector('.js-container-grid');
    if(productsHTML) productsHTML.innerHTML = 'Failed to store product';
  }
}

const productsGrid = document.querySelector('.js-container-grid');
if(productsGrid) {
  loadProductsFromAPI().then((data) => {
    renderProducts(data);
    updateCartQuantity();
  });
}


  const sidebar = document.querySelector('.side-navigation');
  const menuBtn = document.querySelector('.js-menu-btn');
  const closeBtn = document.querySelector('.js-close-btn');
  const header = document.querySelector('.market-header');
  const body = document.body;

if(closeBtn){
  closeBtn.addEventListener('click', closeNav);
}

if(menuBtn){
  menuBtn.addEventListener('click',openNav);
}

function closeNav() {
  if (sidebar) {
    sidebar.style.width = '0';
    body.style.marginLeft = "0";
    header.style.marginLeft = "0";
  }
};

function openNav() {
  if (sidebar){ 
    sidebar.style.width = '250px';
    body.style.marginLeft = "250px";
    header.style.marginLeft = "250px";
  
  }
};

 
const productsHTML = document.querySelector('.js-container-grid');

if(productsHTML){
    renderProducts(products);
    
    const checkoutBtn = document.querySelector('.checkout-button')
    if(checkoutBtn){
      checkoutBtn.addEventListener('click',() => {
        window.location.href = 'checkout.html';
      });
    }

    const sellItemBtn = document.querySelector('.js-sell-button')
    if(sellItemBtn){
      sellItemBtn.addEventListener('click', () => {
        window.location.href = 'sellProducts.html';
      })
    }


}

export function renderProducts(products){
  if (!productsHTML) return;
  productsHTML.innerHTML = '';

  products.forEach((product) => {
  const productHTML =
`
    <div class="product-container js-container-grid">
        <div class="image-container">
          <img class="image-products" src=${product.image}>
        </div>
        <div class="category-name">
          ${product.category}
        </div>
        
        <div class="product-name">
          ${product.title}
        </div>
        <div class="seller-info">
          <div class="seller-name">
            ${product.seller}
          </div>
          <div  class="seller-rating">
            ${product.rating ? '⭐' + Number(product.rating).toFixed(1) : '0.0'}
          </div>
        </div>
        
        <div class="product-mahallah">
            ${product.mahallah}
        </div>
        <div class="product-price">
          RM${priceCentsFixed(product.price)}
        </div>

        <div class="product-cart">
          <button class="cart-button js-add-to-cart" data-product-id="${product.id}">Add To Cart</button>
        </div>
      </div>

      `;

      productsHTML.insertAdjacentHTML('beforeend',productHTML); 

  });
  
  attachCartEventListeners();
}

function attachCartEventListeners() {
    document.querySelectorAll('.js-add-to-cart').forEach(button => {
        button.onclick = () => { 
            const productId = button.dataset.productId;
            addToCart(productId);
            updateCartQuantity();
        };
    });
}


export function priceCentsFixed(price){
  return Number(price).toFixed(2);
}

const categoryBtns = document.querySelectorAll('.category');


categoryBtns.forEach(button => {
  button.addEventListener('click',() => {
    const selectedCategory = button.dataset.category;
    
    if(selectedCategory === 'All'){
      renderProducts(products);
    }
    else {
      const filtered = products.filter(
        product => product.category === selectedCategory
      );
      renderProducts(filtered);
    }
  
    setActiveButton(button);
   });
});

function setActiveButton(activeBtn){
  categoryBtns.forEach(button => button.classList.remove('active'));
  activeBtn.classList.add('active');
}


function updateCartQuantity() {
    const qtyElement = document.querySelector('.js-cart-qty');

    if(!qtyElement) return;

    let cartQuantity = 0;

    cart.forEach((cartItem) => {
      cartQuantity += cartItem.quantity;
    });

    qtyElement.innerHTML = cartQuantity;
}











