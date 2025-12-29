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

const productsHTML = document.querySelector('.js-container-grid');

renderProducts(products);

export function renderProducts(products){
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
          ${product.name}
        </div>
        <div class="seller-info">
          <div class="seller-name">
            ${product.seller}
          </div>
          <div  class="seller-rating">
            ${product.rating.count.toFixed(1)}
          </div>
        </div>
        
        <div class="product-mahallah">
            ${product.mahallah}
        </div>
        <div class="product-price">
          RM${priceCentsFixed(product.priceCents)}
        </div>

        <div class="product-cart">
          <button class="cart-button">Add To Cart</button>
        </div>
      </div>

      `;

      productsHTML.insertAdjacentHTML('beforeend',productHTML); 
  });
}

export function priceCentsFixed(priceCents){
  const price = (priceCents / 100).toFixed(2);
  return price;
}

const categoryBtns = document.querySelectorAll('.category');


categoryBtns.forEach(button => {
  button.addEventListener('click',() => {
    const selectedCategory = button.dataset.category;
    
    if(selectedCategory === 'all'){
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






