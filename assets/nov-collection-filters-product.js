class CollecttionFilterProduct extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    const facetForm = this.querySelector('form');
    facetForm.addEventListener('input', this.debouncedOnSubmit.bind(this));
    facetForm.addEventListener('change', this.debouncedOnSubmit.bind(this));
    const facetWrapper = this.querySelector('.CollecttionFilterWrapper');
    if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : CollecttionFilterProduct.searchParamsInitial;
      if (searchParams === CollecttionFilterProduct.searchParamsPrev) return;
      CollecttionFilterProduct.renderPage(searchParams, null, false);
    };
    window.addEventListener('popstate', onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    CollecttionFilterProduct.searchParamsPrev = searchParams;
    const sections = CollecttionFilterProduct.getSections();
    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = (element) => element.url === url;

      CollecttionFilterProduct.filterData.some(filterDataUrl)
        ? CollecttionFilterProduct.renderSectionFromCache(filterDataUrl, event)
        : CollecttionFilterProduct.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) CollecttionFilterProduct.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText;
        CollecttionFilterProduct.filterData = [...CollecttionFilterProduct.filterData, { html, url }];
        CollecttionFilterProduct.renderFilters(html, event);
        CollecttionFilterProduct.renderProductGridContainer(html);
      });

  }

  static renderSectionFromCache(filterDataUrl, event) {
    const html = CollecttionFilterProduct.filterData.find(filterDataUrl).html;
    CollecttionFilterProduct.renderFilters(html, event);
    CollecttionFilterProduct.renderProductGridContainer(html);
  }

  static renderProductGridContainer(html) {
    document.getElementById('CollectionProductContainer').innerHTML = new DOMParser().parseFromString(html, 'text/html').getElementById('CollectionProductContainer').innerHTML;
    $('.selector-wrapper-1').each(function(){
      if ($(this).hasClass('opt-color.hide')) {
        $(this).closest('.item-product__popup--variant').find('.btn-close-quick-add').hide();
      }
    })
    $('.btn-quick-add').click(function(){
        $('.item-product__popup--variant').removeClass('act');
        $(this).parent().find('.item-product__popup--variant').addClass('act');
        $(this).parents('.thumbnail-container').addClass('popup-act');
    });
    $('.btn-close-quick-add').click(function(){
        $(this).parent().removeClass('act');
        $(this).parents('.thumbnail-container').removeClass('popup-act')
    });
    var product_grid = $('.collection__grid-loadmore'),
        next_url = product_grid.data('next-url');
    if (next_url) {
      $('.collection__btn-loadmore').click(function(){
        CollectionLoadmoreFilter();
      });
    };
    function CollectionLoadmoreFilter() {
      $.ajax (
        {
          url: next_url,
          type: 'GET',
          dataType: 'html',
          beforeSend: function(){
            $('.scroll__infinityfilter').remove();
            $('.collection__btn-loadmore').addClass('loading');
          },
        }
      ).done(function(next_page) {
        var new_page = $(next_page).find('.collection__grid-loadmore'),
            new_url = new_page.data('next-url'),
            m = $('.pagination__bar').data('max');
        next_url = new_url;
        if (typeof next_url !== "undefined") {
          $('.collection__btn-loadmore').removeClass('loading');
        } else {
          $('.collection__btn-loadmore').remove();
        }
        product_grid.append(new_page.html());
        if (typeof next_url === "undefined") {
          $('.scroll__infinityfilter').remove();
        }
        var n = product_grid.find('.product--item').length;
        $('.pagination__count .count').text(n);
        $('.pagination__bar .progress').css('width',  n/m*100 + '%');
      })
    };
  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');

    const facetDetailsElements = parsedHTML.querySelectorAll(
      '#CollectionFiltersForm .js-filter'
    );
    const matchesIndex = (element) => {
      const jsFilter = event ? event.target.closest('.js-filter') : undefined;
      return jsFilter ? element.dataset.index === jsFilter.dataset.index : false;
    };
    const facetsToRender = Array.from(facetDetailsElements).filter((element) => !matchesIndex(element));
    const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);

    facetsToRender.forEach((element) => {
      document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;
    });

    CollecttionFilterProduct.renderActiveFacets(parsedHTML);

    if (countsToRender) CollecttionFilterProduct.renderCounts(countsToRender, event.target.closest('.js-filter'));
  }

  static renderActiveFacets(html) {
    const activeFacetElementSelectors = ['.facets-remove-all'];

    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
    });

    CollecttionFilterProduct.toggleActiveFacets(false);
  }

  static renderCounts(source, target) {
    const targetElement = target.querySelector('.facets__selected');
    const sourceElement = source.querySelector('.facets__selected');

    if (sourceElement && targetElement) {
      target.querySelector('.facets__selected').outerHTML = source.querySelector('.facets__selected').outerHTML;
    }
  }

  static updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      },
    ];
  }

  createSearchParams(form) {
    const formData = new FormData(form);
    return new URLSearchParams(formData).toString();
  }
  
  onSubmitForm(searchParams, event) {
    CollecttionFilterProduct.renderPage(searchParams, event);
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const sortFilterForms = document.querySelectorAll('collection-filter-product form');
      const searchParams = this.createSearchParams(event.target.closest('form'));
      this.onSubmitForm(searchParams, event);
      const forms = [];
      sortFilterForms.forEach((form) => {
        forms.push(this.createSearchParams(form));
      });
      this.onSubmitForm(forms.join('&'), event);
  }
  
  onSubmitHandlerSortBy(event, form){
    event.preventDefault();
    const formData = new FormData(form);
    const searchParams = new URLSearchParams(formData).toString();
    CollecttionFilterProduct.renderPage(searchParams, event);
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    CollecttionFilterProduct.toggleActiveFacets();
    const url =
      event.currentTarget.href.indexOf('?') == -1
        ? ''
        : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
    CollecttionFilterProduct.renderPage(url);
  }
}

CollecttionFilterProduct.filterData = [];
CollecttionFilterProduct.searchParamsInitial = window.location.search.slice(1);
CollecttionFilterProduct.searchParamsPrev = window.location.search.slice(1);
customElements.define('collection-filter-product', CollecttionFilterProduct);
CollecttionFilterProduct.setListeners();

class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll('.filter__price--input input').forEach(element => element.addEventListener('change', this.onRangeChange.bind(this)));
    this.setMinAndMaxValues();
    this.priceRangeSlider();
  }

  onRangeChange(event) {
    this.adjustToValidValues(event.currentTarget);
    this.setMinAndMaxValues();
  }

  setMinAndMaxValues() {
    const inputs = this.querySelectorAll('.filter__price--input input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    if (maxInput.value) minInput.setAttribute('max', maxInput.value);
    if (minInput.value) maxInput.setAttribute('min', minInput.value);
    if (minInput.value === '') maxInput.setAttribute('min', 0);
    if (maxInput.value === '') minInput.setAttribute('max', maxInput.getAttribute('max'));
  }

  adjustToValidValues(input) {
    const value = Number(input.value);
    const min = Number(input.getAttribute('min'));
    const max = Number(input.getAttribute('max'));

    if (value < min) input.value = min;
    if (value > max) input.value = max;
  }

  priceRangeSlider() {
    const rangeInput = document.querySelectorAll(".filter__price--range input"),
    priceInput = document.querySelectorAll(".filter__price--input input"),
    range = document.querySelector(".filter__price--bar .progress");
    let priceGap = 5;

    priceInput.forEach(input =>{
      input.addEventListener("input", e =>{
        let minPrice = parseInt(priceInput[0].value),
        maxPrice = parseInt(priceInput[1].value);
        if((maxPrice - minPrice >= priceGap) && maxPrice <= rangeInput[1].max){
          if (priceInput[0]) {
            rangeInput[0].value = minPrice;
            range.style.left = ((minPrice / rangeInput[0].max) * 100) + "%";
          }
          if (priceInput[1]) {
            rangeInput[1].value = maxPrice;
            range.style.right = 100 - (maxPrice / rangeInput[1].max) * 100 + "%";
          }
        }
        if (minPrice > rangeInput[1].max) {
          rangeInput[0].value = 0;
          range.style.left = 0;
        }
        if (maxPrice > rangeInput[1].max) {
          if (priceInput[1]) {
            rangeInput[1].value = rangeInput[1].max;
            range.style.right = 0;
          }
        }
      });
    });
    rangeInput.forEach(input =>{
      let minInput = parseInt(priceInput[0].value),
      maxInput = parseInt(priceInput[1].value);
      if (minInput > 0) {
        rangeInput[0].value = minInput;
        range.style.left = ((minInput / rangeInput[0].max) * 100) + "%";
      } else {
        rangeInput[0].value = 0;
        range.style.left = 0;
      }
      if (maxInput > 0) {
        rangeInput[1].value = maxInput;
        range.style.right = 100 - (maxInput / rangeInput[1].max) * 100 + "%";
      } else {
        rangeInput[1].value = rangeInput[0].max;
        range.style.right = 100 - (maxInput / rangeInput[1].max) * 100 + "%";
      }
      input.addEventListener("input", e =>{
        let minVal = parseInt(rangeInput[0].value),
        maxVal = parseInt(rangeInput[1].value);
        if((maxVal - minVal) < priceGap){
          if(e.target.className === "field__range--min"){
            rangeInput[0].value = maxVal - priceGap
          }else{
            rangeInput[1].value = minVal + priceGap;
          }
        }else{
          priceInput[0].value = minVal;
          priceInput[1].value = maxVal;
          range.style.left = ((minVal / rangeInput[0].max) * 100) + "%";
          range.style.right = 100 - (maxVal / rangeInput[1].max) * 100 + "%";
        }
      });
    });
  }
}
customElements.define('price-range', PriceRange);

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    this.querySelector('a').addEventListener('click', (event) => {
      event.preventDefault();
      const form = this.closest('collection-filter-product') || document.querySelector('collection-filter-product');
      form.onActiveFilterClick(event);
    });
  }
}
customElements.define('facet-remove', FacetRemove);
