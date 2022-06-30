class CartItemsAlt extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    let self = this;
    console.log('connectedCallback');
    console.log(this.itemDetails);
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
  }
}

customElements.define('cart-items-alt', CartItemsAlt);

class CartAllItem extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    let self = this;
    setTimeout(()=>{  
      fetch('/cart.js', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      })
      .then(response => {
        return response.json();
      })
      .then((state) => {
        const parsedState = (state);
        parsedState.items.forEach((d)=>{
          let cartitemtemp = this.querySelector("#cart-items-alt").cloneNode(true);
          cartitemtemp.classList.remove("cart-hidden");
          let cartitemalt = document.createElement("cart-items-alt");
          cartitemalt.itemDetails = d;
          cartitemalt.append(cartitemtemp);
          this.appendChild(cartitemalt);
        })
      }) 
      .catch((error) => {
        console.error('Error:', error);
      });


    }, 3000);
  }
}

customElements.define('cart-all-item', CartAllItem);

class CartRemoveButtonAlter extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      this.closest('cart-items').updateQuantity(this.dataset.index, 0);
    });
  }
}

customElements.define('cart-remove-button-alter', CartRemoveButtonAlter);

class CartItemsAlter extends HTMLElement {
  constructor() {
    super();

    this.lineItemStatusElement = document.getElementById('shopping-cart-line-item-status');

    this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
      .reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);

    this.debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, 300);

    this.addEventListener('change', this.debouncedOnChange.bind(this));
  }

  onChange(event) {
    this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'));
  }

  getSectionsToRender() {
    return [
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items').dataset.id,
        selector: '.js-contents',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section'
      },
      {
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section'
      },
      {
        id: 'main-cart-footer',
        section: document.getElementById('main-cart-footer').dataset.id,
        selector: '.js-contents',
      }
    ];
  }

  updateQuantity(line, quantity, name) {
    this.enableLoading(line);

    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname
    });

    fetch(`${routes.cart_change_url}`, {...fetchConfig(), ...{ body }})
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        this.classList.toggle('is-empty', parsedState.item_count === 0);
        const cartFooter = document.getElementById('main-cart-footer');

        if (cartFooter) cartFooter.classList.toggle('is-empty', parsedState.item_count === 0);

        this.getSectionsToRender().forEach((section => {
          const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);

          elementToReplace.innerHTML =
            this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
        }));

        this.updateLiveRegions(line, parsedState.item_count);
        const lineItem =  document.getElementById(`CartItem-${line}`);
        if (lineItem && lineItem.querySelector(`[name="${name}"]`)) lineItem.querySelector(`[name="${name}"]`).focus();
        this.disableLoading();
      }).catch(() => {
        this.querySelectorAll('.loading-overlay').forEach((overlay) => overlay.classList.add('hidden'));
        document.getElementById('cart-errors').textContent = window.cartStrings.error;
        this.disableLoading();
      });
  }

  updateLiveRegions(line, itemCount) {
    if (this.currentItemCount === itemCount) {
      document.getElementById(`Line-item-error-${line}`)
        .querySelector('.cart-item__error-text')
        .innerHTML = window.cartStrings.quantityError.replace(
          '[quantity]',
          document.getElementById(`Quantity-${line}`).value
        );
    }

    this.currentItemCount = itemCount;
    this.lineItemStatusElement.setAttribute('aria-hidden', true);

    const cartStatus = document.getElementById('cart-live-region-text');
    cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      cartStatus.setAttribute('aria-hidden', true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  enableLoading(line) {
    document.getElementById('main-cart-items').classList.add('cart__items--disabled');
    this.querySelectorAll(`#CartItem-${line} .loading-overlay`).forEach((overlay) => overlay.classList.remove('hidden'));
    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute('aria-hidden', false);
  }

  disableLoading() {
    document.getElementById('main-cart-items').classList.remove('cart__items--disabled');
  }
}



customElements.define('cart-items-alter', CartItemsAlter);
