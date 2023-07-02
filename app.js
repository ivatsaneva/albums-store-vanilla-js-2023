const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

let cart = [];

//btns
let buttonsDOM = [];

//getting the products
class Products {
  async getProducts() {
    try {


      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const img = item.fields.image.fields.file.url;
        return { title, price, id, img };
      });
      return products;
    } catch (err) {
      console.log(err);
    }
  }
}

class UI {
  displayProducts(products) {
    let result = " ";
    products.forEach((product) => {
      result += `
            <div class="product">
          <div class="img-container">
            <img
              src="${product.img}"
              alt="Products"
              class="product-img"
            />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i> add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </div>
            `;
    });
    productsDOM.innerHTML = result;
  }

  getBagButtons() {
    const btns = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = btns;
    btns.forEach((btn) => {
      let id = btn.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        btn.innerHTML = "In Cart";
        btn.disabled = true;
      } else {
        btn.addEventListener("click", (event) => {
          event.target.innerHTML = "In Cart";
          event.target.disabled = true;
          let cartItem = { ...Storage.getProduct(id), amount: 1 };
          cart = [...cart, cartItem];
          Storage.saveCart(cart);
          this.setCartValues(cart);
          this.addCartItem(cartItem);
          this.showCart();
        });
      }
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
    console.log(cartTotal, cartItems);
  }

  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img
              src=${item.img}
              alt="Product image"
            />
            <div>
              <h4>${item.title}</h4>
              <h5>$${item.price}</h5>
              <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
    
    `;

    cartContent.appendChild(div);
  }

  showCart() {
    cartOverlay.classList.add("transp-background");
    cartDOM.classList.add("showCart");
  }

  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }

  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }

  hideCart() {
    cartOverlay.classList.remove("transp-background");
    cartDOM.classList.remove("showCart");
  }

  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });

    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        }
      } else {
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      }
    });
  }

  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let btn = this.getSingleButton(id);
    btn.disabled = false;
    btn.innerHTML = `<i class 'fas fa-shopping-cart'></i>add to cart`;
  }

  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {

  const startAnimation = () => {
    TweenMax.from('.logo', 1, {
      delay: 1.2,
      opacity: 0,
      x: -20,
      ease: Expo.easeInOut
    })

    TweenMax.staggerFrom('.menu-links ul li', 1, {
      delay: 1.2,
      opacity: 0,
      x: -20,
      ease: Power4.easeInOut
    }, 0.08)

    TweenMax.from('.search', 1, {
      delay: 1.6,
      opacity: 0,
      x: -20,
      ease: Expo.easeInOut
    })

    TweenMax.from('.cart', 1, {
      delay: 1.8,
      opacity: 0,
      x: -20,
      ease: Expo.easeInOut
    })

    TweenMax.to('.border-bottom', 1, {
      delay: 1.4,
      width: '100%',
      ease: Expo.easeInOut
    })

    TweenMax.from('.subtitle', 1, {
      delay: 2.8,
      opacity: 0,
      x: -20,
      ease: Expo.easeInOut
    })

    TweenMax.to('.title', 1, {
      delay: 2.2,
      width: '100%',
      ease: Expo.easeInOut
    })

    TweenMax.from('.desc', 1, {
      delay: 2.8,
      opacity: 0,
      x: -20,
      ease: Expo.easeInOut
    })

    TweenMax.from('.readmore', 1, {
      delay: 2.8,
      opacity: 0,
      x: -20,
      ease: Expo.easeInOut
    })

    TweenMax.to('.slider', 1, {
      delay: 3,
      opacity: 1,
      ease: Expo.easeInOut
    })

    TweenMax.to('.img-1', 1, {
      delay: 2.2,
      width: '450px',
      ease: Expo.easeInOut
    })

    TweenMax.to('.img-2', 1, {
      delay: 2.2,
      width: '300px',
      ease: Expo.easeInOut
    })

    TweenMax.to('.img-3', 1, {
      delay: 2.2,
      width: '300px',
      ease: Expo.easeInOut
    })

    TweenMax.to('.first', 1.5, {
      delay: .2,
      left: '-100%',
      ease: Expo.easeInOut
    })

    TweenMax.to('.second', 1.5, {
      delay: .4,
      left: '-100%',
      ease: Expo.easeInOut
    })

    TweenMax.to('.third', 1.5, {
      delay: .6,
      left: '-100%',
      ease: Expo.easeInOut
    })
  }
  startAnimation();

  const ui = new UI();
  const products = new Products();
  ui.setupApp();

  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
