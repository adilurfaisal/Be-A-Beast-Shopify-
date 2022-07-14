class ProductCardVariants extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    this.id = this.getAttribute('id')
    this.container = this.querySelector(`#wrapper-${ this.id }`)
    this.swatches = JSON.parse(this.querySelector('#swatchData').textContent)

    this.form = this.container.querySelector(`form#form--${ this.id }`)
    this.options = this.container.querySelectorAll('.option')
    this.stepBackButton = this.container.querySelector('.step--back-button')

    const dataElement = this.container.querySelector('[type="application/json"][data-variants]').textContent
    this.variants = JSON.parse(dataElement)

    this.option1 = null
    this.option2 = null
    this.option3 = null
    
    this.applySwatch()

    this.checkAvailability(1)
    this.toggleBackButton()

    this.form.addEventListener('change', this.handleChange.bind(this))
    this.stepBackButton.addEventListener('click', this.goBack.bind(this))
    this.classList.remove('visibility-hidden')
  }
  
  applySwatch() {
    const colorOption = this.container.querySelector('.option[data-option="color"]')
    if(colorOption) {
      const inputs = colorOption.querySelectorAll('label')
      inputs.forEach(input => {
        const name = input.dataset.value.trim()
        const swatch = this.swatches.find(item => item.color == name)
        if(swatch) {
          if(swatch.image) {
            input.classList.add('image--swatch')
            input.style.backgroundImage = `url(${swatch.image})`
            input.innerHTML = ""
          }
          else if(swatch.fallback_color) {
            input.classList.add('color--swatch')
            input.style.backgroundColor = swatch.fallback_color
            input.innerHTML = ""
          }
          else {}
        }
        else {
          input.classList.add('image--swatch', 'swatch-default')
          input.innerHTML = ""
        }
      })
    }
  }

  goBack(e) {
    this.showPrev()
    this.toggleBackButton()
  }

  toggleBackButton() {
    const activeElement = this.container.querySelector('.option.active')
    if(activeElement) {
      const position = activeElement.dataset.position
      if(position > 1) {
        if(!this.stepBackButton.classList.contains('show')) {
          this.stepBackButton.classList.add('show')
        }
      }
      else {
        if(this.stepBackButton.classList.contains('show')) {
          this.stepBackButton.classList.remove('show')
        }
      }
    }

  }

  handleChange(e) {
    const position = e.target.dataset.position

    if(position == 1) {
      this.option1 = e.target.value
      this.checkAvailability(2)
      this.toggleBackButton()
      if(!this.stepBackButton.classList.contains('show')) this.stepBackButton.classList.add('show')
        }
    if(position == 2) {
      this.option2 = e.target.value
      this.toggleBackButton()
      this.checkAvailability(3)
    }

    if(position == 3) {
      this.option3 = e.target.value
      this.toggleBackButton()
    }

    this.showNext()
    this.selected = this.filteredVariant()
    if(this.selected.length == 1) {
      const variant = this.selected[0]
      this.addToCart(variant)
      .then(data => {
        this.showAtcSuccess()
        this.renderCartBubble()
        this.reset()
      })
      .catch(error => console.log(error))
    }
  }

  filteredVariant() {
    if(this.option1 && !this.option2 && !this.option3) {
      return this.variants.filter(variant => {
        return variant.option1 == this.option1
      })
    }
    else if(this.option1 && this.option2 && !this.option3) {
      return this.variants.filter(variant => {
        return variant.option1 == this.option1 && variant.option2 == this.option2
      })
    }
    else {
      return this.variants.filter(variant => {
        return variant.option1 == this.option1 && variant.option2 == this.option2 && variant.option3 == this.option3
      })
    }

  }

  checkAvailability(option) {

    const available = []

    if(option == 1) {
      const options = this.container.querySelectorAll('[data-position="1"] fieldset input')

      this.variants.forEach(variant => {
        if(variant.available) {
          if(!available.includes(variant.option1)) available.push(variant.option1)
            }
      })
      options.forEach(option => {
        if(!available.includes(option.value)) {
          option.disabled = true
        }
        else {
          option.disabled = false
        }
      })
    }

    if(option == 2) {
      const options = this.container.querySelectorAll('[data-position="2"] fieldset input')
      const filteredVariant = this.variants.filter(variant => variant.option1 == this.option1)
      filteredVariant.forEach(variant => {
        if(variant.available) {
          if(!available.includes(variant.option2)) available.push(variant.option2)
            }
      })

      options.forEach(option => {
        if(!available.includes(option.value)) {
          option.disabled = true
        }
        else {
          if(option.disabled) option.disabled = false
            }
      })
    }

    if(option == 3) {
      const options = this.container.querySelectorAll('[data-position="3"] fieldset input')
      const filteredVariant = this.variants.filter(variant => (variant.option1 == this.option1) && (variant.option2 == this.option2))
      filteredVariant.forEach(variant => {
        if(variant.available) {
          if(!available.includes(variant.option3)) available.push(variant.option3)
            }
      })

      options.forEach(option => {
        if(!available.includes(option.value)) {
          option.disabled = true
        }
        else {
          if(option.disabled) option.disabled = false
            }
      })
    }
  }

  showNext() {
    const active = this.container.querySelector('.option.active')
    const position = active.dataset.position

    const nextPosition = parseInt(position) + 1
    const next = this.container.querySelector('.option[data-position="' + nextPosition + '"]')

    if(next) {
      active.classList.remove('active')
      next.classList.add('active')
    }
    this.toggleBackButton()
  }

  reset() {
    this.options.forEach(option => {
      const position = option.dataset.position
      const options = option.querySelectorAll('input[type="radio"]')
      options.forEach(item => {
        item.checked = false
      })
      if(position != 1) {
        if(option.classList.contains('active')) option.classList.remove('active')
          }
      else {
        if(!option.classList.contains('active')) option.classList.add('active')
          }
    })
    this.option1 = null
    this.option2 = null
    this.option3 = null
    this.toggleBackButton()
  }

  showPrev() {
    const active = this.container.querySelector('.option.active')
    const position = parseInt(active.dataset.position)

    const prevPosition = position > 1 ? position - 1 : 1
    const prev = this.container.querySelector('.option[data-position="' + prevPosition + '"]')
    if(position > 1 && prev) {
      active.classList.remove('active')
      prev.classList.add('active')
      
      const previousInputs = prev.querySelectorAll('input[type="radio"]')
      
      previousInputs.forEach(_input => {
        _input.checked = false
      })
    }
    this.toggleBackButton()
  }

  addToCart(variant) {
    return new Promise((resolve, reject) => {
      const url = window.Shopify.routes.root + 'cart/add.js'
      const data = {
        items: [
          {
            id: variant.id,
            quantity: 1
          }
        ]
      }
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(data => resolve(data))
      .catch(error => reject(error))
    })
  }

  showAtcSuccess() {
    const wrapper = this.container.querySelector('.success--notification')
    wrapper.classList.add('show')
    setTimeout(function() {
      wrapper.classList.remove('show')
    }, 2000)
  }

  getCart() {
    return new Promise((resolve, reject) => {
      const url = window.Shopify.routes.root + 'cart.js'
      fetch(url)
      .then(response => response.json())
      .then(data => resolve(data))
      .catch(error => reject(error))
    })
  }

  renderCartBubble(data) {
    let total = 0;

    if(document.querySelector("cart-all-item")){
      document.querySelectorAll("cart-all-item").forEach((el)=>{
        el.fetchRender();
      })
    }

    this.getCart().then(cart => {
      cart.items.forEach(item => {
        total = total + item.quantity
      })

      const cartWrapper = document.querySelector('.header__icon--cart')
      const hasBubble = cartWrapper.querySelector('.cart-count-bubble')

      if(hasBubble) {
        const itemElement = hasBubble.querySelector('span[aria-hidden="true"]')
        itemElement.innerHTML = total
      }
      else {
        const cartElement = document.createElement('div')
        cartElement.classList.add('cart-count-bubble')

        const countElement = document.createElement('span')
        countElement.setAttribute('aria-hidden', 'true')
        countElement.innerHTML = total

        const cartAlternate = document.createElement('span')
        cartAlternate.classList.add('visually-hidden')
        cartAlternate.innerHTML = total + ' item'

        cartElement.appendChild(countElement)
        cartElement.appendChild(cartAlternate)

        cartWrapper.appendChild(cartElement)
      }
    })
  }
}

customElements.define('product-card-variants', ProductCardVariants)

class Wishlist extends HTMLElement {
  constructor() {
    super()
  }
  
  connectedCallback() {
    this.handle = this.querySelector('[data-product-handle]').dataset.productHandle
    this.addToWishlistElement = this.querySelector('.wishlist-icon')
    this.icon = this.querySelector('.wishlist-icon svg use')
    this.addToWishlistElement.addEventListener('click', this.addToWishlist.bind(this))
    
    const list = JSON.parse(localStorage.getItem('wishlist'))
    if(list) {
      if(list.includes(this.handle)) {
        if(this.icon) this.icon.setAttribute('href', '#heart--fill')
      }
    }
  }
  
  addToWishlist(e) {
    e.preventDefault()
    e.stopPropagation()
    let list = JSON.parse(localStorage.getItem('wishlist'))
    if(!list) list = []
    if(!list.includes(this.handle)) {
      list.push(this.handle)
      localStorage.setItem('wishlist', JSON.stringify(list))
      if(this.icon) this.icon.setAttribute('href', '#heart--fill')
      this.updateWishlistBubble(list.length)
    }
    else {
      list = list.filter(e => e !== this.handle)
      localStorage.setItem('wishlist', JSON.stringify(list))
      if(this.icon) this.icon.setAttribute('href', '#heart')
      this.updateWishlistBubble(list.length)
    }
  }
  
  updateWishlistBubble(count) {
    const bubble = document.querySelector('.wishlist--bubble')
    
    if(count > 0) {
      bubble.innerHTML = count
      if(bubble.classList.contains('hidden')) bubble.classList.remove('hidden')
    } else {
      if(!bubble.classList.contains('hidden')) bubble.classList.add('hidden')
    }
    
  }
}

customElements.define('component-wishlist', Wishlist)


document.addEventListener('DOMContentLoaded', e => {
  const bubble = document.querySelector('.wishlist--bubble')
  const list = JSON.parse(localStorage.getItem('wishlist'))
  if(list && list.length > 0) {
    bubble.innerHTML = list.length
    if(bubble.classList.contains('hidden')) bubble.classList.remove('hidden')
  }
})