class ShopTheLook extends HTMLElement {
  constructor() {
    super()
    this.slider = this.querySelector('.main--slider-container')
    this.swiper = new Swiper(this.slider, {
      direction: 'horizontal',
      loop: false,
      draggable: true,
      slidesPerView: 'auto',
      spaceBetween: 20,
      slidesPerGroup: 1,
      breakpoints: {
        750: {
          spaceBetween: 0,
        }
      },
    })
    
    document.addEventListener('slide:change', this.disableSlider.bind(this))
    document.addEventListener('slider:close', this.enableSlider.bind(this))
  }
  
  disableSlider(e) {
    this.swiper.disable()
  }
  
  enableSlider(e) {
    this.swiper.enable()
  }
}
customElements.define('shop-the-look', ShopTheLook)

class ShopTheLookVerticalSlide extends HTMLElement {
  constructor() {
    super()
    this.slider = this.querySelector('.pin--product-slider')
    this.pins = this.querySelectorAll('.image--pin')
    this.pins.forEach(pin => {
      pin.addEventListener('click', this.slideToProduct.bind(this))
    })
    this.swiper = new Swiper(this.slider, {
      direction: 'vertical',
      loop: false,
      draggable: true,
      slidesPerView: 1,
      spaceBetween: 20
    })
  }
  
  slideToProduct(e) {
    if(window.innerWidth > 750) {
      const slide = e.currentTarget.dataset.slide
      this.swiper.slideTo(slide - 1)

      this.pins.forEach(pin => {
        if(pin.classList.contains('active')) pin.classList.remove('active')
      })
      e.currentTarget.classList.add('active')
    }
    else {
      const header = document.querySelector('.header-wrapper')
      const body = document.querySelector('body')
      if(!header.classList.contains('hide--to-top')) header.classList.add('hide--to-top')
      if(!body.classList.contains('overflow--hidden')) body.classList.add('overflow--hidden')
      
      
      const blockId = e.currentTarget.dataset.blockId
      const sectionWrapper = document.querySelector('.section-shop-the-look')
      
      const mainSlider = document.querySelector('.main--slider-container.swiper')
      const image_width = mainSlider.querySelector('.main--slide').offsetWidth
      const image = e.currentTarget.parentNode.querySelector('img')
      const screen_width = window.innerWidth
      const scale = 1/(image_width / screen_width) + 0.04
      const btn_position = image.getBoundingClientRect().top
      
      
      sectionWrapper.style.transform = 'translate3d(0, -' + (btn_position - 40) + 'px' + ', 0)'
      mainSlider.style.transform = 'translate3d(50px, 0, 0) scale(' + scale + ')'
      const wrapper = document.querySelector('.product--slider[data-ref="' + blockId + '"]')
      
      const event = new CustomEvent('slide:change', { detail: { slide: e.currentTarget.dataset.slide } })
      document.dispatchEvent(event)
      
      if(!wrapper.classList.contains('active')) wrapper.classList.add('active')
      
      this.pins.forEach(pin => {
        if(pin.classList.contains('active')) pin.classList.remove('active')
      })
      e.currentTarget.classList.add('active')
    }
  }
}
customElements.define('stl-vertical-slide', ShopTheLookVerticalSlide)

class ProductGuide extends HTMLElement {
  constructor() {
    super()
    const sliderWrapper = this.querySelector('.slider--wrapper')
    this.slider = new Swiper(sliderWrapper, {
      direction: 'horizontal',
      loop: false,
      draggable: true,
      slidesPerView: 1,
      noSwiping: false,
      spaceBetween: 20,
    })
    document.addEventListener('slide:change', this.slideChange.bind(this))
    
    const close = this.querySelector('.slider--close')
    close.addEventListener('click', this.sliderClose.bind(this))
  }
  
  slideChange(e) {
    const slide = e.detail.slide
    this.slider.slideTo(slide - 1)
  }
  
  sliderClose(e) {
    const header = document.querySelector('.header-wrapper')
    const body = document.querySelector('body')
    
    if(header.classList.contains('hide--to-top')) header.classList.remove('hide--to-top')
    if(body.classList.contains('overflow--hidden')) body.classList.remove('overflow--hidden')
    
    const event = new CustomEvent('slider:close')
    document.dispatchEvent(event)
    
    const slider = this.querySelector('.product--slider.active')
    slider.classList.remove('active')
    
    const mainSlider = document.querySelector('.main--slider-container.swiper')
    mainSlider.style.transform = 'translate3d(0, 0, 0) scale(1)'
    
    const sectionWrapper = document.querySelector('.section-shop-the-look')
    sectionWrapper.style.transform = 'translate3d(0, 0, 0)'
  }
  
}
customElements.define('product-guide', ProductGuide)