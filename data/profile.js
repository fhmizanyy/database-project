import {loadProductsFromAPI,sidebarJS,priceCentsFixed} from '../script/marketPlace.js'

sidebarJS();

let products = [];

async function initSelfProducts(){
  const productsData = await loadProductsFromAPI();

  if(productsData && productsData.length > 0){
    renderProductsUser(productsData);
    
  } else {
    document.querySelector('.product-update-container').innerHTML = 'The Product has fail to load.';
  }  

}

initSelfProducts();

// FIX: Missing variable declaration keyword (let/const/var)
const productsHTML = document.querySelector('.js-container-update-product');

function renderProductsUser(productsData){

  if(!productsHTML) return;

  // FIX: Variable name mismatch - should be 'productsHTML' instead of 'productsData'
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

                // FIX: Missing closing quote in class attribute
                <div class="product-quantity>
                    ${dataItem.quantity}
                </div>

                <div class="update-profile">
                    <button class="update-button js-update-product" data-product-id="${dataItem.id}">Update Item</button>
                </div>
        
                <div class="product-cart">
                  <button class="delete-product-button js-delete-product" data-product-id="${dataItem.id}">Delete Item</button>
                </div>
              </div>
        
      `

    productsHTML.insertAdjacentHTML('beforeend',productHTML);
  })

}








