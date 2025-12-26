import {products} from '../data/product.js';
  const sidebar = document.querySelector('.side-navigation');
  const menuBtn = document.querySelector('.js-menu-btn');
  const closeBtn = document.querySelector('.js-close-btn');

export function openNav() {
  sidebar.style.width = '250px'

};

export function closeNav() {
    sidebar.style.width = '0'
  };

closeBtn.addEventListener('click',closeNav);
 menuBtn.addEventListener('click',openNav);

const cart = [];

let productsHTML = '';

products.forEach((product) => {
  productsHTML += 
`
    <div class="product-container js-container-grid">
        <div class="image-container">
          <img class="image-products" src=${product.image}>
        </div>
        <div class="category-name">
          ${product.category}
        </div>
        
        <div class="product-name">
          ${product.name}
        </div>
        <div class="seller-info">
          <div class="seller-name">
            ${product.seller}
          </div>
          <div  class="seller-rating">
            ${(product.rating.count).toFixed(1)}
          </div>
        </div>
        
        <div class="product-mahallah">
            ${product.mahallah}
        </div>
        <div class="product-price">
          RM${priceCentsFixed(product.priceCents)}
        </div>
          
      </div>

`;
});

document.querySelector('.js-container-grid').innerHTML = productsHTML;

function addToCart(){
  
}

export function priceCentsFixed(priceCents){
  const price = (priceCents / 100).toFixed(2);
  return price;
}

const categoryBtn = document.querySelectorAll('.category');
const listProducts = document.querySelectorAll('.product-container');

function filterProducts(category){

  products.forEach(product => {
    const productCategory = button.dataset.category;
    
    if(category === 'all' || productCategory === product.category){
      product.style.display = 'inline-block';
    }
    else {
      product.style.display = 'none';
    }
  });
}

categoryBtn.forEach(button => {
  button.addEventListener('click',() => {
    const selectedCategory = button.dataset.Category;
    filterProducts(selectedCategory);
    setActiveButton(button);
  });

});

function setActiveButton(activeBtn){
  categoryButtons.forEach(button => button.classList.remove('active'));
  activeBtn.classList.add('active');
}






