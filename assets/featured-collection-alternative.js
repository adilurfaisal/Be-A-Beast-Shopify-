class FCSlider extends HTMLElement {
  constructor() {
    super()
  }
  
  connectedCallback() {
    this.container = this.querySelector('.swiper')
    this.btnNext = this.querySelector('.slide-button-next')
    this.btnPrev = this.querySelector('.slide-button-prev')
    const slideToShow = this.dataset.slideToShow ? parseInt(this.dataset.slideToShow) : 1
    
    
    this.swiper = new Swiper(this.container, {
      direction: 'horizontal',
      slidesPerView: 'auto',
      centeredSlides: true,
      loop: false,
      draggable: true,
      spaceBetween: 20,
      slidesPerGroup: slideToShow,
      breakpoints: {
        750: {
          slidesPerView: 2,
          spaceBetween: 30,
          centeredSlides: false,

        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 30,
          centeredSlides: false,
        },
        1440: {
          slidesPerView: 4,
          spaceBetween: 30,
          centeredSlides: false,
        },
      },
      navigation: {
        nextEl: this.btnNext,
        prevEl: this.btnPrev,
      },
    })
  }
}

customElements.define('fc-slider', FCSlider)