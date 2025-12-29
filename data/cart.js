export let cart = JSON.parse(localStorage.getItem('cart'));

function saveToStorage(){
  localStorage.setItem('cart',JSON.stringify(cart));
}

export function addToCart(productId){
  let matchingItem;

  cart.forEach( cartItem=> {
      if(matchingItem === cartItem.productId ){
        matchingItem == cartItem;
      }

      if(matchingItem){
        matchingItem += 1;     
      }

      else{
        cart.push({
          productId:productId,
          quantity:1
        })
      }
    

  });
  saveToStorage();
}  

export function removeItem(productId){
  const newCart = [];

  cart.forEach( cartItem => {
    if(cartItem.productId !== productId){
      newCart.push(cartItem);
    }
  })

  cart = newCart;

  saveToStorage();
}