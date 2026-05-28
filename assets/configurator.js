// LumiBrace Premium Shopify Configurator Script
(function () {
  'use strict';
  const product = window.__product;
  if (!product) return;

  const form = document.querySelector('[data-product-form]');
  if (!form) return;

  const variantInput = form.querySelector('[data-variant-id]');
  const priceEl = document.querySelector('[data-price]');
  const compareEl = document.querySelector('[data-compare-price]');
  const discountBadge = document.querySelector('[data-discount-badge]');
  const productImage = document.getElementById('product-image');
  const errorEl = form.querySelector('[data-form-error]');
  const submitBtn = form.querySelector('[data-add-to-cart]');
  
  // Custom groupings
  const pairOnlySection = document.querySelector('[data-pair-only]');
  const pairColorsSection = document.querySelector('[data-pair-colors-selector]');
  const whatsappBanner = document.querySelector('[data-whatsapp-info-banner]');
  const uploadGroup1 = document.querySelector('[data-upload-group="1"]');
  const uploadGroup2 = document.querySelector('[data-upload-group="2"]');

  // Projection Previews
  const projectionPreview = document.querySelector('[data-projection-preview]');
  const projectionPlaceholder = document.querySelector('[data-projection-placeholder]');

  // Upsell Modal Elements
  const upsellModal = document.querySelector('[data-upsell-modal]');

  // State
  let selectedUploadMethod = 'upload'; // 'upload' or 'whatsapp'
  let hasShownUpsell = false;

  // Formatting utility
  function formatMoney(cents) {
    return '₪' + (cents / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // Gallery tabs switching (The Bracelet / The Projection)
  const tabs = document.querySelectorAll('[data-gallery-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      const target = tab.getAttribute('data-gallery-tab');
      document.querySelectorAll('[data-gallery-content]').forEach(content => {
        content.classList.toggle('hidden', content.getAttribute('data-gallery-content') !== target);
      });
    });
  });

  // Thumbnail clicks
  const thumbs = document.querySelectorAll('[data-thumb-index]');
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('is-active'));
      thumb.classList.add('is-active');
      
      const imgUrl = thumb.getAttribute('data-image-url');
      if (imgUrl && productImage) {
        productImage.src = imgUrl;
      }
      
      // Auto-switch back to product view tab
      const productTab = document.querySelector('[data-gallery-tab="product"]');
      if (productTab) productTab.click();
    });
  });

  // Retrieve current active radio/select options
  function getSelectedOptions() {
    const out = [];
    product.options.forEach((opt, idx) => {
      const checked = form.querySelector(`input[name="options[${opt}]"]:checked`);
      out[idx] = checked ? checked.value : null;
    });
    return out;
  }

  // Find Shopify variant that matches selected options
  function findVariant(selected) {
    return product.variants.find(v =>
      v.options.every((o, i) => o === selected[i])
    );
  }

  // Sync Option Pill classes
  function updateActivePills() {
    form.querySelectorAll('[data-option-input]').forEach(input => {
      const pill = input.closest('.option-pill');
      if (!pill) return;
      pill.classList.toggle('is-active', input.checked);
    });
  }

  // Intelligently map custom Bundle + Individual colors to Shopify's variants
  function updateVariant() {
    updateActivePills();
    const selected = getSelectedOptions();

    // Check if the bundle selected is "זוג" (Pair) or "בודד" (Single)
    // Supports Hebrew and English option value names
    const bundleOptionIndex = product.options.findIndex(o => o === 'חבילה' || o === 'Bundle' || o === 'כמות');
    let isPair = false;
    if (bundleOptionIndex !== -1 && selected[bundleOptionIndex]) {
      const val = selected[bundleOptionIndex];
      isPair = val.indexOf('זוג') !== -1 || /pair/i.test(val);
    }

    // Toggle Sizing section and Multi-bracelet customization
    if (pairOnlySection) pairOnlySection.classList.toggle('hidden', !isPair || selectedUploadMethod !== 'upload');
    if (pairColorsSection) pairColorsSection.classList.toggle('hidden', !isPair);

    // If it's a pair, dynamically read the colors chosen for Bracelet 1 and Bracelet 2
    // and map them to Shopify's Option 2 (Color): "זהב", "כסף", or "מעורב"
    if (isPair && pairColorsSection) {
      const color1Input = form.querySelector('input[name="pair-color-1"]:checked');
      const color2Input = form.querySelector('input[name="pair-color-2"]:checked');
      if (color1Input && color2Input) {
        const c1 = color1Input.value;
        const c2 = color2Input.value;
        let mappedColor = 'מעורב';
        if (c1 === 'זהב' && c2 === 'זהב') mappedColor = 'זהב';
        if (c1 === 'כסף' && c2 === 'כסף') mappedColor = 'כסף';

        // Find the color option position in product.options
        const colorOptionIndex = product.options.findIndex(o => o.indexOf('צבע') !== -1 || o.indexOf('Color') !== -1);
        if (colorOptionIndex !== -1) {
          // Find the exact option value matching our mapped color
          const optionName = product.options[colorOptionIndex];
          const radioToSelect = form.querySelector(`input[name="options[${optionName}]"][value*="${mappedColor}"]`);
          if (radioToSelect) {
            radioToSelect.checked = true;
            // Update active pill styling for Shopify color pills
            updateActivePills();
            selected[colorOptionIndex] = radioToSelect.value;
          }
        }
      }
    }

    const variant = findVariant(selected);
    if (!variant) {
      submitBtn.disabled = true;
      submitBtn.querySelector('span').textContent = 'שילוב אינו זמין';
      return;
    }

    variantInput.value = variant.id;
    submitBtn.disabled = !variant.available;
    submitBtn.querySelector('span').textContent = variant.available ? 'קנו עכשיו ב-50% הנחה' : 'אזל מהמלאי';
    
    if (priceEl) priceEl.textContent = formatMoney(variant.price);
    if (compareEl) {
      if (variant.compare_at_price && variant.compare_at_price > variant.price) {
        compareEl.textContent = formatMoney(variant.compare_at_price);
        compareEl.style.display = '';
        if (discountBadge) {
          const discountPct = Math.round((1 - (variant.price / variant.compare_at_price)) * 100);
          discountBadge.textContent = `${discountPct}% הנחה`;
          discountBadge.style.display = '';
        }
      } else {
        compareEl.style.display = 'none';
        if (discountBadge) discountBadge.style.display = 'none';
      }
    }

    // Swaps main product gallery image to matching variant image if available
    if (variant.featured_image && productImage) {
      productImage.src = variant.featured_image.src;
    }
  }

  // Handle option changes
  form.addEventListener('change', (e) => {
    if (e.target.matches('[data-option-input]') || e.target.matches('[data-pair-color-input]')) {
      updateVariant();
    }
  });

  // Pair color customizer styling sync on click
  form.querySelectorAll('[data-pair-color-input]').forEach(input => {
    input.addEventListener('change', () => {
      const groupName = input.getAttribute('name');
      form.querySelectorAll(`input[name="${groupName}"]`).forEach(inp => {
        const pill = inp.closest('.option-pill');
        if (pill) pill.classList.toggle('is-active', inp.checked);
      });
    });
  });

  // Setup Image upload zones
  function setupUpload(zoneId) {
    const zone = document.querySelector(`[data-upload-zone="${zoneId}"]`);
    if (!zone) return;

    const input = zone.querySelector(`[data-upload-input="${zoneId}"]`);
    const previewContainer = zone.querySelector(`[data-preview-container="${zoneId}"]`);
    const preview = zone.querySelector(`[data-upload-preview="${zoneId}"]`);
    const label = zone.querySelector(`[data-upload-label="${zoneId}"]`);
    const removeBtn = zone.querySelector(`[data-upload-remove="${zoneId}"]`);

    function handleFile(file) {
      if (!file) return;

      // Limit file size to 15MB
      if (file.size > 15 * 1024 * 1024) {
        alert('הקובץ גדול מדי! גודל תמונה מקסימלי הוא 15MB.');
        input.value = '';
        return;
      }

      const fileUrl = URL.createObjectURL(file);
      
      // Update preview inside the upload zone
      preview.src = fileUrl;
      previewContainer.classList.remove('hidden');
      if (label) label.style.display = 'none';
      
      // If this is the main bracelet image, duplicate preview in the "projection" circle simulator!
      if (zoneId === 1) {
        if (projectionPreview) {
          projectionPreview.src = fileUrl;
          projectionPreview.classList.remove('hidden');
        }
        if (projectionPlaceholder) {
          projectionPlaceholder.classList.add('hidden');
        }
      }
    }

    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      handleFile(file);
    });

    removeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      input.value = '';
      previewContainer.classList.add('hidden');
      preview.src = '';
      if (label) label.style.display = '';

      if (zoneId === 1) {
        if (projectionPreview) {
          projectionPreview.src = '';
          projectionPreview.classList.add('hidden');
        }
        if (projectionPlaceholder) {
          projectionPlaceholder.classList.remove('hidden');
        }
      }
    });

    // Drag & Drop
    ['dragover', 'dragenter'].forEach(ev =>
      zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add('is-drag'); })
    );
    ['dragleave', 'drop'].forEach(ev =>
      zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove('is-drag'); })
    );
    zone.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files[0];
      if (file) {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        handleFile(file);
      }
    });
  }

  setupUpload(1);
  setupUpload(2);

  // Upload Method toggling (Upload now vs Send on WhatsApp later)
  const methodInputs = form.querySelectorAll('[data-method-input]');
  methodInputs.forEach(input => {
    input.addEventListener('change', () => {
      methodInputs.forEach(inp => {
        const pill = inp.closest('.option-pill');
        if (pill) pill.classList.toggle('is-active', inp.checked);
      });

      selectedUploadMethod = input.getAttribute('data-method-input');
      const isUpload = selectedUploadMethod === 'upload';

      // Toggle form sections visibility
      if (uploadGroup1) uploadGroup1.classList.toggle('hidden', !isUpload);
      if (uploadGroup2) {
        const selected = getSelectedOptions();
        const bundleOptionIndex = product.options.findIndex(o => o === 'חבילה' || o === 'Bundle' || o === 'כמות');
        let isPair = false;
        if (bundleOptionIndex !== -1 && selected[bundleOptionIndex]) {
          isPair = selected[bundleOptionIndex].indexOf('זוג') !== -1 || /pair/i.test(selected[bundleOptionIndex]);
        }
        uploadGroup2.classList.toggle('hidden', !isUpload || !isPair);
      }

      if (whatsappBanner) whatsappBanner.classList.toggle('hidden', isUpload);

      // Sizing guide titles updates
      const uploadTitle1 = document.querySelector('[data-upload-title-1]');
      if (uploadTitle1) {
        const selected = getSelectedOptions();
        const bundleOptionIndex = product.options.findIndex(o => o === 'חבילה' || o === 'Bundle' || o === 'כמות');
        let isPair = false;
        if (bundleOptionIndex !== -1 && selected[bundleOptionIndex]) {
          isPair = selected[bundleOptionIndex].indexOf('זוג') !== -1 || /pair/i.test(selected[bundleOptionIndex]);
        }
        uploadTitle1.textContent = isPair ? 'תמונה לצמיד ראשון' : 'תמונה לצמיד שלכם';
      }
    });
  });

  // Interactive Sizing and Tips accordion headers
  const detailsList = document.querySelectorAll('.details-acc');
  detailsList.forEach(det => {
    const summary = det.querySelector('.details-acc__summary');
    const icon = det.querySelector('.details-acc__icon');
    summary.addEventListener('click', (e) => {
      // Toggle custom plus/minus icon
      setTimeout(() => {
        if (icon) icon.textContent = det.hasAttribute('open') ? '−' : '+';
      }, 50);
    });
  });

  // Form submit intercepting (AI checkout redirect + conversion boosters)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorEl) errorEl.classList.add('hidden');

    // 1. Validations
    if (selectedUploadMethod === 'upload') {
      const file1Input = form.querySelector('input[name="properties[תמונה לצמיד 1]"]');
      if (file1Input && (!file1Input.files || file1Input.files.length === 0)) {
        alert('אנא העלו תמונה לצמיד, או בחרו באפשרות "שליחה בוואטסאפ לאחר הרכישה".');
        file1Input.focus();
        return;
      }
    }

    // 2. Trigger Upsell Modal if single bracelet bundle is chosen and we haven't offered it yet
    const selected = getSelectedOptions();
    const bundleOptionIndex = product.options.findIndex(o => o === 'חבילה' || o === 'Bundle' || o === 'כמות');
    let isSingle = true;
    if (bundleOptionIndex !== -1 && selected[bundleOptionIndex]) {
      const val = selected[bundleOptionIndex];
      isSingle = val.indexOf('בודד') !== -1 || /single/i.test(val);
    }

    if (isSingle && !hasShownUpsell && upsellModal) {
      hasShownUpsell = true;
      upsellModal.classList.remove('hidden');
      return;
    }

    // 3. Actually add to cart
    await submitForm();
  });

  // Submit cart via AJAX Multi-part form data
  async function submitForm() {
    submitBtn.disabled = true;
    const btnSpan = submitBtn.querySelector('span');
    const originalText = btnSpan.textContent;
    btnSpan.textContent = 'מעבד הזמנה...';

    try {
      // AJax submit via native FormData (works with files flawlessly!)
      const cartResult = await window.LumiCart.add(form);
      
      // Emit native TikTok pixel AddToCart event if user has native pixel enabled 
      // (This will also happen natively in checkout, but nice as double safety)
      if (window.ttq) {
        const variant = product.variants.find(v => v.id == variantInput.value);
        window.ttq.track('AddToCart', {
          contents: [{
            content_id: String(variantInput.value),
            content_name: product.title,
            quantity: 1,
            price: (variant?.price || 0) / 100
          }],
          value: (variant?.price || 0) / 100,
          currency: 'ILS'
        });
      }

      // Redirect directly to Checkout in same window (Safari popups friendly)
      window.LumiCart.goToCheckout();
    } catch (err) {
      console.error(err);
      if (errorEl) {
        errorEl.textContent = err.message || 'אירעה שגיאה. אנא נסו שוב.';
        errorEl.classList.remove('hidden');
      }
      submitBtn.disabled = false;
      btnSpan.textContent = originalText;
    }
  }

  // Handle Upsell Decline
  document.querySelectorAll('[data-upsell-decline]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (upsellModal) upsellModal.classList.add('hidden');
      // Continue submitting the single bracelet
      await submitForm();
    });
  });

  // Handle Upsell Accept
  const upsellAcceptBtn = document.querySelector('[data-upsell-accept]');
  if (upsellAcceptBtn) {
    upsellAcceptBtn.addEventListener('click', async () => {
      if (upsellModal) upsellModal.classList.add('hidden');

      // Programmatically switch option to "זוג" (Pair)
      const bundleOptionIndex = product.options.findIndex(o => o === 'חבילה' || o === 'Bundle' || o === 'כמות');
      if (bundleOptionIndex !== -1) {
        const optionName = product.options[bundleOptionIndex];
        const pairRadio = form.querySelector(`input[name="options[${optionName}]"][value*="זוג"], input[name="options[${optionName}]"][value*="Pair"]`);
        if (pairRadio) {
          pairRadio.checked = true;
          // Trigger form update
          updateVariant();
        }
      }

      // Continue submitting
      await submitForm();
    });
  });

  // Init variables
  updateVariant();
})();
