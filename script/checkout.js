import {cart,removeItem,updateDeliveryOption,clearCart} from '../data/cart.js';
import {priceCentsFixed,loadProductsFromAPI} from './marketPlace.js';
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import {deliveryOptions} from '../data/product.js';

async function initCheckout() {
  const productsData = await loadProductsFromAPI();
  
  if(productsData && productsData.length > 0){
    renderCheckoutPage(productsData);
  } else {
    document.querySelector('.js-order-summary').innerHTML = 'your cart is empty or server error.'
  }
}

initCheckout();

function renderCheckoutPage(dataProducts) {
  renderCart(dataProducts);
  renderPaymentSummary(dataProducts);
}


export function renderCart(dataProducts){
 
    let cartSummaryHTML = '';

    cart.forEach((cartItem) => {
      const productId = cartItem.productId;
    
      const matchingProduct = dataProducts.find(p => Number(p.id) === Number(productId));

      console.log('Cart Item ID:', productId);
      console.log('API Products:', dataProducts);

     
    if (!matchingProduct) {
      console.error(`Product with ID ${productId} not found in API.`);
      return; 
    }

      const deliveryOptionId = cartItem.deliveryOptionId || '1';

      let deliveryOption = deliveryOptions.find(opt => opt.id == deliveryOptionId);

      const today = dayjs();

      const deliveryDate = today.add(
        deliveryOption.deliveryDays,
        'days'
      );
      const dateString = deliveryDate.format(
        'dddd, MMMM D'
      );

    cartSummaryHTML +=
  `        
        <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
          <div class="delivery-date">
            Delivery date: ${dateString}
          </div>

          <div class="cart-item-details-grid">
            <img class="product-image"
              src="${matchingProduct.image}">

            <div class="cart-item-details">
              <div class="product-name">
                ${matchingProduct.title}
              </div>
              <div class="product-price">
                RM${priceCentsFixed(matchingProduct.price)}
              </div>
              <div class="product-quantity">
                <span>
                  Quantity: <span class="quantity-label">${cartItem.quantity}</span>
                </span>
                <span class="update-quantity-link link-primary">
                  Update
                </span>
                <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${matchingProduct.id}">
                  Delete
                </span>
              </div>
            </div>

            <div class="delivery-options">
              <div class="delivery-options-title">
                Choose a delivery option:
              </div>
                ${deliveryOptionsHTML(matchingProduct,cartItem)}
            </div>
          </div>
        </div>

        <div class="cart-item-container">
    
    `;
  });

  document.querySelector('.js-order-summary').innerHTML = cartSummaryHTML;

  setupEventListeners(dataProducts);
}

  function deliveryOptionsHTML(matchingProduct,cartItem){
    let html = '';

    deliveryOptions.forEach((deliveryOption) => {
      const today = dayjs();

      const deliveryDate = today.add(
        deliveryOption.deliveryDays,
        'days'
      );
      const dateString = deliveryDate.format(
        'dddd, MMMM D'
      );

      const priceString = deliveryOption.priceCents === 0
      ? 'FREE'
      :`RM${(deliveryOption.priceCents/100).toFixed(2)}-`;

      const isChecked = deliveryOption.id === (cartItem.deliveryOptionId || '1');

      html += 
      `
        <div class="delivery-option js-delivery-option" data-product-id="${matchingProduct.id}"
        data-delivery-option-id="${deliveryOption.id}">
                  <input type="radio"
                  ${isChecked ? 'checked' : ''}
                    class="delivery-option-input"
                    name="delivery-option-${matchingProduct.id}">
                  <div>
                    <div class="delivery-option-date">
                      ${dateString}
                    </div>
                    <div class="delivery-option-price">
                      ${priceString} Shipping
                    </div>
                  </div>
                </div>
      `
    });

    return html;
  }

 document.addEventListener('click', async (event) => {
  const placeOrderBtn = event.target.closest('.js-place-order');
  
  if (placeOrderBtn) {
    console.log('Order button triggered via js-place-order class');
    if (cart.length === 0) return alert('Cart Empty!');
  

    const orderData = {
      userId : 1000,
      items: cart.map(item => ({
        id: item.productId,
        quantity: item.quantity
      }))
    };

    try {
      const response = await fetch ('http://localhost:3000/api/checkout', {
        method : 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify(orderData)
      })

      const result = await response.json();

      if(result.success){
        clearCart();
        window.location.href = `success.html?orderId=${result.orderId}`; 
      } else {
        alert("Error:" + result.message);
      }


    } catch(err) {
        console.error("Checkout error:", err);
    }

  }

});

  function renderPaymentSummary(products) {
  let productPrice = 0;
  let shippingPriceCents = 0;

  cart.forEach((cartItem) => {
    const product = products.find(p => p.id == cartItem.productId);

    if (product) { //formatting back from string to number
      productPrice += (Number(product.price) * cartItem.quantity);
    }

    const deliveryOption = deliveryOptions.find(opt => opt.id === (cartItem.deliveryOptionId || '1'));
    shippingPriceCents += deliveryOption.price / 100;
  });

  const totalBeforeTaxCents = productPrice + shippingPriceCents;
  const taxCents = totalBeforeTaxCents * 0.1; 
  const totalCents = totalBeforeTaxCents + taxCents;

  const paymentSummaryHTML = `
    <div class="payment-summary-title">
      Order Summary
    </div>
    <div class="payment-summary-row">
      <div>
        Items: 
      </div>
      <div class="payment-summary-money">
        RM${priceCentsFixed(productPrice)}
      </div>
    </div>
    <div class="payment-summary-row">
      <div>
        Shipping & handling:
      </div>
      <div class="payment-summary-money">
        RM${(shippingPriceCents / 100).toFixed(2)}
      </div>
    </div>
    <div class="payment-summary-row subtotal-row">
      <div>
      Total before tax:
      </div>
      <div class="payment-summary-money">
      RM${(totalBeforeTaxCents / 100).toFixed(2)}
      </div>
    </div>
    <div class="payment-summary-row">
      <div>
        Estimated tax (10%):
      </div>
      <div class="payment-summary-money">
        RM${(taxCents / 100).toFixed(2)}
      </div>
    </div>
    <div class="payment-summary-row total-row">
      <div>
      Order total:
      </div>
      <div class="payment-summary-money">
        RM${(totalCents / 100).toFixed(2)}</div>
      </div>
    <button class="place-order-button js-place-order button-primary">Place your order</button>
  `;

  document.querySelector('.js-payment-summary').innerHTML = paymentSummaryHTML;
}

  function setupEventListeners(products) {
  // Combine all listener into one function
  document.querySelectorAll('.js-delete-link').forEach(link => {
    link.onclick = () => {
      removeItem(link.dataset.productId);
      renderCheckoutPage(products); 
    };
  });

  document.querySelectorAll('.js-delivery-option').forEach(element => {
    element.onclick = () => {
      const { productId, deliveryOptionId } = element.dataset;
      updateDeliveryOption(productId, deliveryOptionId);
      renderCheckoutPage(products); 
    };
  });
}