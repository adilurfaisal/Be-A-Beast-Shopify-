var ZBRangeSlider = function(id) { 
  var self = this;
  var startX = 0, x = 0;

  // retrieve touch button
  var slider = document.getElementById(id)
  var minInfo = document.querySelector('.price--min-info');
  var maxInfo = document.querySelector('.price--max-info');
  var touchLeft  = slider.querySelector('.slider-touch-left');
  var touchRight = slider.querySelector('.slider-touch-right');
  var totalSpan = slider.querySelector('.slider-line')
  var lineSpan   = slider.querySelector('.slider-line span');
  
  
  // get some properties
  var min   = parseInt(slider.getAttribute('se-min'));
  var max   = parseInt(slider.getAttribute('se-max'));
  
  // retrieve default values
  var defaultMinValue = min;
  if(slider.hasAttribute('se-min-value')) {
    defaultMinValue = parseInt(slider.getAttribute('se-min-value'));  
  }
  var defaultMaxValue = max;
  
  if(slider.hasAttribute('se-max-value'))
  {
    defaultMaxValue = parseInt(slider.getAttribute('se-max-value'));  
  }
  
  // check values are correct
  if(defaultMinValue < min)
  {
    defaultMinValue = min;
  }
  
  if(defaultMaxValue > max)
  {
    defaultMaxValue = max;
  }
  
  if(defaultMinValue > defaultMaxValue)
  {
    defaultMinValue = defaultMaxValue;
  }
  
  var step  = 0.0;
  
  if (slider.getAttribute('se-step'))
  {
    step  = Math.abs(parseInt(slider.getAttribute('se-step')));
  }
  
  // normalize flag
  var normalizeFact = 26;
  
  self.slider = slider;
  self.reset = function() {
    touchLeft.style.left = '0px';
    touchRight.style.left = (slider.offsetWidth - touchLeft.offsetWidth) + 'px';
    lineSpan.style.marginLeft = '0px';
    lineSpan.style.width = (slider.offsetWidth - touchLeft.offsetWidth) + 'px';
    startX = 0;
    x = 0;
  };
  
  self.setMinValue = function(minValue) {
    
    var ratio = ((minValue - min) / (max - min));
    touchLeft.style.left = Math.ceil(ratio * (slider.offsetWidth - (touchLeft.offsetWidth + normalizeFact))) + 'px';
    minInfo.style.left = Math.ceil(ratio * (slider.offsetWidth - (touchLeft.offsetWidth + normalizeFact))) + 'px';
    lineSpan.style.marginLeft = touchLeft.offsetLeft + 'px';
    lineSpan.style.width = (touchRight.offsetLeft - touchLeft.offsetLeft) + 'px';
    slider.setAttribute('se-min-value', minValue);
  }
  
  self.setMaxValue = function(maxValue)
  {
    var ratio = ((maxValue - min) / (max - min));
    touchRight.style.left = Math.ceil(ratio * (slider.offsetWidth - (touchLeft.offsetWidth + normalizeFact)) + normalizeFact) + 'px';
    maxInfo.style.right = (totalSpan.offsetWidth - Math.ceil(ratio * (slider.offsetWidth - (touchLeft.offsetWidth + normalizeFact)) + normalizeFact)) + 'px';
    lineSpan.style.marginLeft = touchLeft.offsetLeft + 'px';
    lineSpan.style.width = (touchRight.offsetLeft - touchLeft.offsetLeft) + 'px';
    slider.setAttribute('se-max-value', maxValue);
    
  }
  
  // initial reset
  self.reset();
  
  // usefull values, min, max, normalize fact is the width of both touch buttons
  var maxX = slider.offsetWidth - touchRight.offsetWidth;
  var selectedTouch = null;
  var initialValue = (lineSpan.offsetWidth - normalizeFact);

  // set defualt values
  self.setMinValue(defaultMinValue);
  self.setMaxValue(defaultMaxValue);
  
  // setup touch/click events
  function onStart(event) {
    
    // Prevent default dragging of selected content
    event.preventDefault();
    var eventTouch = event;

    if (event.touches)
    {
      eventTouch = event.touches[0];
    }
    
    if(this === touchLeft)
    {
      x = touchLeft.offsetLeft;
    }
    else
    {
      x = touchRight.offsetLeft;
    }

    startX = eventTouch.pageX - x;
    selectedTouch = this;
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onStop);
    document.addEventListener('touchmove', onMove);
    document.addEventListener('touchend', onStop);
    

  }
  
  function onMove(event) {
    var eventTouch = event;

    if (event.touches) {
      eventTouch = event.touches[0];
    }

    x = eventTouch.pageX - startX;
    
    if (selectedTouch === touchLeft) {
      if(x > (touchRight.offsetLeft - selectedTouch.offsetWidth + 10)) {
        x = (touchRight.offsetLeft - selectedTouch.offsetWidth + 10)
      }
      else if(x < 0) {
        x = 0;
      }
      selectedTouch.style.left = x + 'px';
      minInfo.style.left = x + 'px';
      if(slider.getAttribute('se-min-value') >= 10) {
        minInfo.style.transform = "translateX(-9px)";
      }
      else {
        minInfo.style.transform = "translateX(-4px)";
      }
    }
    else if (selectedTouch === touchRight) {
      if(x < (touchLeft.offsetLeft + touchLeft.offsetWidth - 10)) {
        x = (touchLeft.offsetLeft + touchLeft.offsetWidth - 10)
      }
      else if(x > maxX) {
        x = maxX;
      }
      selectedTouch.style.left = x + 'px';
      maxInfo.style.right = (totalSpan.offsetWidth - x) + 'px';
    }
    
    // update line span
    lineSpan.style.marginLeft = touchLeft.offsetLeft + 'px';
    lineSpan.style.width = (touchRight.offsetLeft - touchLeft.offsetLeft) + 'px';
    
    // write new value
    calculateValue();
    
    // call on change
    if(slider.getAttribute('on-change'))
    {
      var fn = new Function('min, max', slider.getAttribute('on-change'));
      fn(slider.getAttribute('se-min-value'), slider.getAttribute('se-max-value'));
    }
    
    if(self.onChange)
    {
      self.onChange(slider.getAttribute('se-min-value'), slider.getAttribute('se-max-value'));
    }
    
  }
  
  function onStop(event) {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onStop);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onStop);
    
    selectedTouch = null;

    // write new value
    calculateValue();
    
    // call did changed
    if(slider.getAttribute('did-changed'))
    {
      var fn = new Function('min, max', slider.getAttribute('did-changed'));
      fn(slider.getAttribute('se-min-value'), slider.getAttribute('se-max-value'));
    }
    
    if(self.didChanged)
    {
      self.didChanged(slider.getAttribute('se-min-value'), slider.getAttribute('se-max-value'));
    }
  }
  
  function calculateValue() {
    var newValue = (lineSpan.offsetWidth - normalizeFact) / initialValue;
    var minValue = lineSpan.offsetLeft / initialValue;
    var maxValue = minValue + newValue;

    var minValue = minValue * (max - min) + min;
    var maxValue = maxValue * (max - min) + min;
    
    if (step !== 0.0)
    {
      var multi = Math.floor((minValue / step));
      minValue = step * multi;
      
      multi = Math.floor((maxValue / step));
      maxValue = step * multi;
    }
    
    slider.setAttribute('se-min-value', minValue);
    slider.setAttribute('se-max-value', maxValue);
  }
  
  // link events
  touchLeft.addEventListener('mousedown', onStart);
  touchRight.addEventListener('mousedown', onStart);
  touchLeft.addEventListener('touchstart', onStart);
  touchRight.addEventListener('touchstart', onStart);
};

class CollectionFilter extends HTMLElement {
  constructor() {
    super()
    this.form = this.querySelector('#CollectionFilter')
    this.form.addEventListener('change', this.onFilterChange.bind(this))
    this.closeBtn = this.querySelector('.filter--close-trigger')
    this.initEndlessScroll()
//     this.handlePriceRange()

    document.addEventListener('filter:remove', this.handleFilterRemove.bind(this))
    this.closeBtn.addEventListener('click', this.closeFilter.bind(this))

    this.container = document.querySelector('#CollectionFiltersContainer')
    this.container.addEventListener('mouseenter', this.triggerFilterOpen.bind(this))
    this.container.addEventListener('mouseleave', this.triggerFilterClose.bind(this))

    this.container.addEventListener('click', this.triggerFilterOpen.bind(this))
    
    var newRangeSlider = new ZBRangeSlider('price-slider');

    newRangeSlider.onChange = function(min, max) {
      const minInfo = document.querySelector('.price--min-info')
      const maxInfo = document.querySelector('.price--max-info')
      minInfo.innerHTML = "$" + parseFloat(min).toFixed(2)
      maxInfo.innerHTML = "$" + parseFloat(max).toFixed(2)
    }

    newRangeSlider.didChanged = function(min, max) {
      document.querySelector('[name="filter.v.price.gte"]').value = min
      document.querySelector('[name="filter.v.price.lte"]').value = max

      const element = document.querySelector('#CollectionFilter')
      var event = new Event('change', { bubbles: true });
      element.dispatchEvent(event);
    }
  }
  
  connectedCallback() {
    const swatchElement = this.querySelector('[data-swatch-repo]')
    if(swatchElement) {
      const swatchData = JSON.parse(swatchElement.textContent)
      const labels = this.querySelectorAll('[data-color-selector] label')
      
      labels.forEach(label => {
        const name = label.dataset.value.trim()
        const swatch = swatchData.find(item => item.color == name)
        if(swatch) {
          if(swatch.image) {
            label.classList.add('swatch', 'image--swatch')
            label.style.backgroundImage = `url(${swatch.image})`
            label.innerHTML = ""
          }
          else if(swatch.fallback_color) {
            label.classList.add('swatch', 'color--swatch')
            label.style.backgroundColor = swatch.fallback_color
            label.innerHTML = ""
          }
          else {}
        }
        else {
          label.classList.add('swatch', 'swatch-default')
          label.innerHTML = ""
        }
      })
    }
  }

  triggerFilterOpen(e) {
    const target = this.container
    if(!target.classList.contains('active')) target.classList.add('active')
  }

  triggerFilterClose(e) {
    const target = this.container
    if(target.classList.contains('active')) target.classList.remove('active')
  }

  handleFilterRemove(e) {
    const searchParams = e.detail.split('?')[1]

    const products = this.getProducts(searchParams)
    this.updateURLHash(searchParams)
  }

  closeFilter(e) {
    e.stopImmediatePropagation()
    e.stopPropagation()
    this.triggerFilterClose()
  }

  /*
  handlePriceRange() {
    const rangeInput = this.form.querySelectorAll(".range--input input")
    rangeInput.forEach(function(input) {
      const range = document.querySelector(".price--slider .slider--progress");
      const width = document.querySelector(".price--slider").clientWidth;

      input.addEventListener('input', function(e) {
        const isMin = e.currentTarget.classList.contains('range-min')
        const isMax = e.currentTarget.classList.contains('range-max')
        const tooltipMin = document.querySelector('.price--min-info')
        const tooltipMax = document.querySelector('.price--max-info')

        let rangeMax = document.querySelector('input.range-max')
        let rangeMin = document.querySelector('input.range-min')
        let min = parseInt(rangeMin.value)
        let max = parseInt(rangeMax.value)
        let gap = 10

        if(max - min >= 0 && max <= rangeMax.max) {
          if(e.target.className === 'range-min') {
            const _position = ((min / rangeMin.max) * 100)
            
            range.style.left = _position + "%"
            

            tooltipMin.style.left = _position + "%"
            
            if(_position > 60) {
              tooltipMin.style.transform = "translateX(-60%)"
            }
            else if(_position > 40) {
              tooltipMin.style.transform = "translateX(-55%)"
            }
            else if(_position > 20) {
              tooltipMin.style.transform = "translateX(-48%)"
            }
            else {
              tooltipMin.style.transform = "translateX(-35%)"
            }
            
            tooltipMin.innerHTML = "$" + parseFloat(rangeMin.value).toFixed(2)
          }
          else {
            const _position = 100 - ((max / rangeMax.max) * 100)
            range.style.right = (width * (100 - ((max / rangeMax.max) * 100))) / 100 + "px"

            tooltipMax.style.right = _position + "%"
            
            if(_position > 60) {
              tooltipMax.style.transform = "translateX(60%)"
            }
            else if(_position > 40) {
              tooltipMax.style.transform = "translateX(55%)"
            }
            else if(_position > 20) {
              tooltipMax.style.transform = "translateX(48%)"
            }
            else {
              tooltipMax.style.transform = "translateX(35%)"
            }
            tooltipMax.innerHTML = "$" + parseFloat(rangeMax.value).toFixed(2)
          }
        }
      })
    })
  } */

  initEndlessScroll() {
    this.endlessScroll = new Ajaxinate({
      container: '#ProductGrid',
      pagination: '#Pagination',
      method: 'scroll',
      offset: 700,
      loadingText: 'Load More'
    });
  }

  onFilterChange(e) {
    const searchParams = this.getQueryParams()
    const products = this.getProducts(searchParams)
    this.updateURLHash(searchParams)
  }

  getQueryParams() {
    const formData = new FormData(this.form);
    const searchParams = new URLSearchParams(formData).toString();
    console.log(searchParams)

    const inputs = this.form.querySelectorAll('input:checked')
    const queries = []
    const keys = []
    inputs.forEach(input => {
      keys.push(input.name)
      queries.push(`${input.name}=${input.value.replaceAll(' ', '+')}`)
    })
    const priceInput = this.form.querySelectorAll('input.price-input[type="hidden"]')
    priceInput.forEach(input => {
      keys.push(input.name)
      queries.push(`${input.name}=${input.value}`)
    })
    if(!keys.includes('sort_by')) queries.push('sort_by=title-ascending')
    return queries.join('&')
  }

  updateURLHash(searchParams) {
    if(searchParams) {
      history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
    }
    else {
      history.pushState({ searchParams: '' }, '', `${window.location.pathname}`);
    }
  }

  getProducts(searchParams) {

    let url = `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`
    if(!searchParams) url = window.location.pathname
    fetch(url)
    .then(response => response.text())
    .then(html => {
      this.renderProductGridContainer(html)
      this.renderFilter(html)
    })
  }

  renderProductGridContainer(html) {
    document.getElementById('CollectionGridContainer').innerHTML = new DOMParser().parseFromString(html, 'text/html').getElementById('CollectionGridContainer').innerHTML

  }

  renderFilter(html) {
    document.getElementById('CollectionFiltersContainer').innerHTML = new DOMParser().parseFromString(html, 'text/html').getElementById('CollectionFiltersContainer').innerHTML
  }
}

customElements.define('collection-filter', CollectionFilter)

class RemoveFilter extends HTMLElement {
  constructor() {
    super()

    this.wrapper = this.querySelector('[data-url-to-remove]')
    this.url = this.wrapper.dataset.urlToRemove
    this.wrapper.addEventListener('click', this.handleClick.bind(this))
  }

  handleClick(e) {
    const event = new CustomEvent('filter:remove', { detail: this.url });
    document.dispatchEvent(event)
  }
}

customElements.define('remove-filter', RemoveFilter)



// -------------------
// How to use? 
// var newRangeSlider = new ZBRangeSlider('price-slider');

// newRangeSlider.onChange = function(min, max)
// {
  
// //   console.log(min, max, this);
  
// //   document.getElementById('result').innerHTML = 'Min: ' + min + ' Max: ' + max;
// }

// newRangeSlider.didChanged = function(min, max)
// {
//   document.querySelector('[name="filter.v.price.gte"]').value = min
//   document.querySelector('[name="filter.v.price.lte"]').value = max
    
//   const element = document.querySelector('#CollectionFilter')
//   var event = new Event('change', { bubbles: true });
//   element.dispatchEvent(event);
// }

// call reset if needed
// newRangeSlider.reset();