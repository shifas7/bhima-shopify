class ProductVariantDropdown extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    this.updatePickupAvailability();
    this.updateVariantStatuses();
    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateVariantInput();
      this.renderProductInfo();
      if (document.querySelectorAll('.template-product').length && !this.closest('#content_quickview')) {
        this.updateURL();
      }
    }
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateMedia() {
    if (!this.currentVariant || !this.currentVariant?.featured_media) return;
    const newMedia = document.querySelector(
      `[data-media-id="${this.dataset.productId}-${this.currentVariant.featured_media.id}"]`
    );
    if (!newMedia) return;
    const parent = newMedia.parentElement;
    const itemact = document.querySelectorAll('.proFeaturedImage .item');
    for (var i = 0; i < itemact.length; i++) {
      itemact[i].classList.remove('act')
    }
    newMedia.classList.add('act');
    window.setTimeout(() => { parent.scroll(0, 0) });
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    window.history.replaceState({ }, '', `${this.dataset.productUrl}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.productId}`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));

    });
  }

  updateVariantStatuses() {
    const selectedOptionOneVariants = this.variantData.filter(variant => this.querySelector(':checked').value === variant.option1);
    const inputWrappers = [...this.querySelectorAll('fieldset')];
    inputWrappers.forEach((option, index) => {
      if (index === 0) return;
      const optionInputs = [...option.querySelectorAll('input[type="radio"], option')]
      const previousOptionSelected = inputWrappers[index - 1].querySelector(':checked').value;
      const availableOptionInputsValue = selectedOptionOneVariants.filter(variant => variant.available && variant[`option${ index }`] === previousOptionSelected).map(variantOption => variantOption[`option${ index + 1 }`]);
      this.setInputAvailability(optionInputs, availableOptionInputsValue)
    });
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach(input => {
      if (listOfAvailableOptions.includes(input.getAttribute('value'))) {
        input.innerText = input.getAttribute('value');
      } else {
        input.innerText = window.variantStrings.unavailable_with_option.replace('[value]', input.getAttribute('value'));
      }
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('available');
      pickUpAvailability.innerHTML = '';
    }
  }

  renderProductInfo() {
    const requestedVariantId = this.currentVariant.id;
    const sectionId = this.dataset.originalSection ? this.dataset.originalSection : this.dataset.productId;
    fetch(`${this.dataset.productUrl}?variant=${requestedVariantId}&section_id=${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.productId}`)
      .then((response) => response.text())
      .then((responseText) => {
        const id = `ProductPrice-${this.dataset.productId}`;
        const html = new DOMParser().parseFromString(responseText, 'text/html')
        const destination = document.getElementById(id);
        const source = html.getElementById(id);
        if (source && destination) destination.innerHTML = source.innerHTML;
        this.toggleAddButton(!this.currentVariant.available, window.variantStrings.notify_me);
        const variant_id = document.getElementById("variant_id").getAttribute('value');
        const sku = document.getElementById("productSelect").querySelector('[value="'+variant_id+'"]').getAttribute('data-sku');
        const variantSku = document.getElementById('variantSku');
        if (typeof variantSku !== 'undefined' && variantSku) {
          variantSku.innerHTML = sku;
        }
      });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(`product-form-${this.dataset.productId}`);
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > #AddToCartText');
    const addButtonParent = productForm.querySelector('.product-form__item--submit');
    const addButton2 = productForm.querySelector('.product-form__item--checkout');
    if (!addButton) return;

    if (disable) {
      if (text) addButtonParent.setAttribute('data-toggle', 'modal');
      if (text) addButtonParent.setAttribute('data-target', '#Form_newletter');
      if (text) addButtonParent.classList.add('soldout');
      if (text) addButtonText.textContent = text;
      if (!addButton2) return;
      addButton2.setAttribute('disabled', true);
    } else {
      const variant_id = document.getElementById("variant_id").getAttribute('value');
      const inventoryPolicy = document.getElementById("productSelect").querySelector('[value="'+variant_id+'"]').getAttribute('data-inventory_policy');
      const inventoryManagement = document.getElementById("productSelect").querySelector('[value="'+variant_id+'"]').getAttribute('data-inventory_management');
      if(inventoryPolicy == 'continue' && inventoryManagement == 'shopify' ) {
        addButtonText.textContent = window.variantStrings.preorder;
      } else {
        addButtonText.textContent = window.variantStrings.addToCart;
      }
      addButtonParent.classList.remove('soldout');
      addButtonParent.removeAttribute('data-toggle');
      addButtonParent.removeAttribute('data-target');
      if (!addButton2) return;
      addButton2.removeAttribute('disabled');
    }
    if (!modifyClass) return;
  }
  setUnavailable() {
    const addButton = document.getElementById(`product-form-${this.dataset.productId}`)?.querySelector('[name="add"]');
    const addButtonText = addButton.querySelector('#AddToCartText');
    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}
customElements.define('product-variant-dropdown', ProductVariantDropdown);

class ProductVariantSwatch extends ProductVariantDropdown {
  constructor() {
    super();
  }
  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach(input => {
      if (listOfAvailableOptions.includes(input.getAttribute('value'))) {
        input.classList.remove('disabled');
      } else {
        input.classList.add('disabled');
      }
    });
  }
  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
  }
}

customElements.define('product-variant-swatch', ProductVariantSwatch);

class ProductVariantSelectsStick extends ProductVariantDropdown {
  constructor() {
    super();
  }
  updateVariantInput() {
    const productForms = document.querySelectorAll(`#product-form-sticky-${this.dataset.productId}`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }
  renderProductInfo() {
    fetch(`${this.dataset.productUrl}?variant=${this.currentVariant.id}&section_id=${this.dataset.productId}`)
      .then((response) => response.text())
      .then((responseText) => {
        const id = `ProductPriceStick-${this.dataset.productId}`;
        const html = new DOMParser().parseFromString(responseText, 'text/html')
        const destination = document.getElementById(id);
        const source = html.getElementById(id);
        if (source && destination) destination.innerHTML = source.innerHTML;
        this.toggleAddButton(!this.currentVariant.available, window.variantStrings.notify_me);
      });
  }
  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(`product-form-sticky-${this.dataset.productId}`);
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > #AddToCartText');
    const addButtonParent = productForm.querySelector('.product-form__item--submit');
    const addButton2 = productForm.querySelector('.product-form__item--checkout');
    if (!addButton) return;

    if (disable) {
      if (text) addButtonParent.setAttribute('data-toggle', 'modal');
      if (text) addButtonParent.setAttribute('data-target', '#Form_newletter');
      if (text) addButtonParent.classList.add('soldout');
      if (text) addButtonText.textContent = text;
      if (!addButton2) return;
      addButton2.setAttribute('disabled', true);
    } else {
      const variant_id = document.getElementById("variant_id").getAttribute('value');
      const inventoryPolicy = document.getElementById("productSelect").querySelector('[value="'+variant_id+'"]').getAttribute('data-inventory_policy');
      const inventoryManagement = document.getElementById("productSelect").querySelector('[value="'+variant_id+'"]').getAttribute('data-inventory_management');
      if(inventoryPolicy == 'continue' && inventoryManagement == 'shopify' ) {
        addButtonText.textContent = window.variantStrings.preorder;
      } else {
        addButtonText.textContent = window.variantStrings.addTobag;
      }
      addButtonParent.classList.remove('soldout');
      addButtonParent.removeAttribute('data-toggle');
      addButtonParent.removeAttribute('data-target');
      if (!addButton2) return;
      addButton2.removeAttribute('disabled');
    }
    if (!modifyClass) return;
  }
  setUnavailable() {
    const addButton = document.getElementById(`product-form-sticky-${this.dataset.productId}`)?.querySelector('[name="add"]');
    const addButtonText = addButton.querySelector('#AddToCartText');
    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;
  }
}

customElements.define('product-variant-selects-stick', ProductVariantSelectsStick);
