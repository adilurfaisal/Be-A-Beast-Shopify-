class CartRecommended extends HTMLElement {
  constructor() {
    super();
    this.fetchRender();
    this.cartRecoSwiper = null;

   this.mobileOpt = {
    count: this.getAttribute("data-mobile-count") ? this.getAttribute("data-mobile-count") : 2,
    control: this.getAttribute("data-mobile-control") ? this.getAttribute("data-mobile-control") : false,
   }
   this.desktopOpt = {
    count: this.getAttribute("data-desktop-count") ? this.getAttribute("data-desktop-count") : 2,
    control: this.getAttribute("data-desktop-control") ? this.getAttribute("data-desktop-control") : true,
   }

  }

  connectedCallback() {
    if(this.cartRecoSwiper==null){
      this.cartRecoSwiper = new Swiper(this.querySelector(".cart-recommended-swiper"), {
        slidesPerView: `${this.mobileOpt.count}`,
        spaceBetween: 20,
        freeMode: true,
        centeredSlides: false,
        grabCursor: true,
        keyboard: {
          enabled: true,
        },
        breakpoints: {
          990: {
            freeMode: false,
            slidesPerView: `${this.desktopOpt.count}`,
            slidesPerGroup: `${this.desktopOpt.count}`,
            spaceBetween: 25,
          }
        },
        navigation: {
          nextEl: ".slide-button-next",
          prevEl: ".slide-button-prev",
        }
      });
    }
  }

  fetchRender(){
    let self = this;
    let fetchUrl = `${window.Shopify.routes.root}cart/?view=metafields`;
    fetch(`${fetchUrl}`, { method: 'GET' })
    .then(response => {
      return response.text();
    })
    .then((html) => {
      document.querySelectorAll("cart-recommended").forEach((el)=>{
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, "text/html").querySelectorAll('div.shopify-section div.swiper-slide');
        el.render(doc);
      })

    }) 
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  render(doc){
    let self = this;
    self.querySelector(".cart-recommended-wrapper").innerHTML = "";
    doc.forEach((el)=>{
      self.querySelector(".cart-recommended-wrapper").appendChild(el);
    });
    if(self.cartRecoSwiper){
      self.cartRecoSwiper.update();
    }
  }
}

customElements.define('cart-recommended', CartRecommended);

let mobileCartactive = true;
window.addEventListener('resize', function(event){
  var newWidth = window.innerWidth;
  if(mobileCartactive==true && newWidth>989){
    mobileCartactive = false;
    document.querySelectorAll("cart-all-item").forEach((el)=>{
      el.render();
    })
  }else if(mobileCartactive==false && newWidth<990){
    mobileCartactive = true;
    document.querySelectorAll("cart-all-item").forEach((el)=>{
      el.render();
    })
  }
});

class CartRemoveBtn extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      this.closest('cart-items-alt').updateByBtnQty(0);
    });
  }
}
customElements.define('cart-remove-btn', CartRemoveBtn);

class CartItemsQty extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    let self = this;
    self.querySelector("button[name='minus']").addEventListener('click', (event) => {
      event.preventDefault();
      this.closest('cart-items-alt').updateByBtnQty('minus');
    });

    self.querySelector("button[name='plus']").addEventListener('click', (event) => {
      event.preventDefault();
      this.closest('cart-items-alt').updateByBtnQty('plus');
    });
  }
}
customElements.define('cart-item-quantity', CartItemsQty);

class CartItemsAlt extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    let self = this;
    if(this.itemDetails==undefined) return;

    let getChild_obj = (obj, keys, pr=0) => {
      if(keys[pr+1]){
        return getChild_obj(obj[keys[pr]], keys, pr+1);
      }else{
        return keys[pr].includes("price") && Number.isInteger(obj[keys[pr]]) ? (obj[keys[pr]]/100).toFixed(2) : obj[keys[pr]];
      }
    }

    let datasetele = this.querySelectorAll("[data-cart]");
    datasetele.forEach((el) => {
      let attrspl = el.getAttribute('data-cart').split(".");
      el.innerHTML = getChild_obj(self.itemDetails, attrspl);
    });

    const customPregRep = this.innerHTML.replace(/([${]+[a-zA-Z0-9._]+[}])/gi, (mat, grp) => {
      let grpspl = grp.replace("${","").replace("}","").split(".");
      return `${getChild_obj(self.itemDetails, grpspl)}`;
    });
    
    this.innerHTML = customPregRep;
    this.setAttribute("data-item-key", self.itemDetails.key);

    
    self.querySelector("input[name='updates[]']").addEventListener('change', this.updateQty);
  }

  updateQty(){
    this.closest('cart-items-alt').enableLoading();
    let cartAllItem = this.closest('cart-all-item');
    let cartItem = this.closest('cart-items-alt');
    let bodyData = {
      id: cartItem.itemDetails.key,
      quantity: parseInt(this.value),
      sections: ["template--16204178424037__cart-items", "cart-icon-bubble", "cart-live-region-text", "template--16204178456805__cart-footer"]
    };
    let fetchUrl = `${window.Shopify.routes.root}cart/change.js`;
    let fetchOption = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyData)
    }

    fetch(fetchUrl, fetchOption)
    .then(response => {
      return response.json();
    })
    .then((state) => {
      this.closest('cart-items-alt').disableLoading();
      if(cartAllItem.cardDetails.item_count==state.item_count){
        setTimeout(()=>{
          document.querySelectorAll(`cart-items-alt[data-item-key='${cartItem.itemDetails.key}'] .cart-item__error-text`).forEach((el)=> {
            el.innerHTML = window.cartStrings.quantityError.replace(
            '[quantity]',
            cartItem.itemDetails.quantity
            )
          })
        }, 100)
      }
      document.querySelectorAll("cart-all-item").forEach((el)=>{
        el.render(state);
      })
    }) 
    .catch((error) => {
      this.closest('cart-items-alt').disableLoading();
      console.error('Error:', error);
    });
  }

  updateByBtnQty(upte){
    let cartQty = this.querySelector("input[name='updates[]']");
    if(upte=='minus'){
      cartQty.value = parseInt(cartQty.value) - 1;
      cartQty.dispatchEvent(new Event('change'));
    }else if(upte=='plus'){
      cartQty.value = parseInt(cartQty.value) + 1;
      cartQty.dispatchEvent(new Event('change'));
    }else if(upte=='0'){
      cartQty.value = 0;
      cartQty.dispatchEvent(new Event('change'));
    }
  }

  
  enableLoading() {
    this.classList.add('cart__items--disabled');
    document.activeElement.blur();
  }

  disableLoading() {
    this.classList.remove('cart__items--disabled');
  }
}

customElements.define('cart-items-alt', CartItemsAlt);

class CartAllItem extends HTMLElement {
  constructor() {
    super();
    this.cardDetails = {};
  }

  connectedCallback() {
    let self = this;
    setTimeout(()=>{
      self.fetchRender();
    }, 1000);
  }
  
  fetchRender(){
    let self = this;

    let bodyData = {
      sections: ["template--16204178424037__cart-items", "cart-icon-bubble", "cart-live-region-text", "template--16204178456805__cart-footer"]
    };
    let fetchUrl = `${window.Shopify.routes.root}cart/update.js`;
    let fetchOption = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyData)
    }

    fetch(fetchUrl, fetchOption)
    .then(response => {
      return response.json();
    })
    .then((state) => {
      self.render(state);
    }) 
    .catch((error) => {
      console.error('Error:', error);
    });
  }
  
  getSectionsToRender() {
    return [
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section'
      },
      {
        id: 'cart-count--bubble',
        section: 'cart-icon-bubble',
        selector: '.cart-count-bubble'
      },
      {
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section'
      },
    ];
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  render(cartItems){
    let self = this;

    if(self.cardDetails.items==undefined || self.cardDetails.items.length!=cartItems.items.length){
      document.querySelector("cart-recommended").fetchRender();
    }

    self.cardDetails = (cartItems==null) ? self.cardDetails : cartItems;
      self.querySelector("#cart-item-loader").innerHTML = "";
      cartItems.items.forEach((d)=>{
        let cartmediaVal = (window.innerWidth>989) ? 'desktop' : 'mobile';
        let cartitemtemp = self.querySelector(`#cart-items-alt[media='${cartmediaVal}']`).cloneNode(true);
        cartitemtemp.classList.remove("cart-hidden");
        let cartitemalt = document.createElement("cart-items-alt");
        cartitemalt.itemDetails = d;
        cartitemtemp.querySelector("cart-item-quantity").qtyDetails = [d];

        cartitemtemp.querySelectorAll("cart-item-quantity input[name='updates[]']").forEach((el)=>{
          el.addEventListener('change', self.cartQtyChange);
        })

        cartitemalt.append(cartitemtemp);
        self.querySelector("#cart-item-loader").appendChild(cartitemalt);
      })

      
      self.getSectionsToRender().forEach((section => {
        let elementToReplace = null;
        if(document.querySelector(`#${section.id} ${section.selector}`)){
          elementToReplace = document.querySelectorAll(`#${section.id} ${section.selector}`);
        }else{
          elementToReplace = document.querySelectorAll(`#${section.id}`);
        }
        
        elementToReplace.forEach((el) => {
          el.innerHTML = self.getSectionInnerHTML(cartItems.sections[section.section], section.selector);
        })
      }));

      document.querySelectorAll('.cart--subTotalUSD').forEach((el)=>{
        el.innerHTML = `$${(cartItems.original_total_price/100).toFixed(2)}`;
      })
  }

  updateQty() {
    this.render();
  }

  cartQtyChange (){
    console.log('change')
  }
}

customElements.define('cart-all-item', CartAllItem);
