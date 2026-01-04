export let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveToStorage(){
  localStorage.setItem('cart',JSON.stringify(cart));
}

export function addToCart(productId){
  let matchingItem = null;

  cart.forEach( cartItem=> {
      if(cartItem.productId === productId ){
        matchingItem = cartItem;
      }
  });

      if(matchingItem){
        matchingItem.quantity += 1;     
      }

      else{
        cart.push({
          productId:productId,
          quantity:1,
          deliveryOption: '1'
        });
      }
    

  
  saveToStorage();
}  

export function removeItem(productId){
  const newCart = cart.filter(cartItem => cartItem.productId !== productId);

  cart = newCart;

  saveToStorage();
}

export function updateDeliveryOption(productId, deliveryOptionId) {
  let matchingItem;

  cart.forEach((cartItem) => {
    if (productId === cartItem.productId) {
      matchingItem = cartItem;
    }
  });

  if (matchingItem) {
    matchingItem.deliveryOptionId = deliveryOptionId;
    saveToStorage();
  }
}
