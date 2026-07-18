/**
 * Phantom Core Data Bridge v2.0
 * Fetches data from Phantom Core REST API and injects into DOM.
 * Built for Layout-02-Kids-Collection frontend.
 */
(function () {
  'use strict';

  const apiBase = '/index.php?rest_route=/phantom/v1';
  const cache = {};

  function fetchJSON(path, timeout) {
    if (cache[path]) return Promise.resolve(cache[path]);
    timeout = timeout || 10000;
    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, timeout);
    const qIdx = path.indexOf('?');
    let url;
    if (qIdx === -1) {
      url = apiBase + path;
    } else {
      url = apiBase + path.substring(0, qIdx) + '&' + path.substring(qIdx + 1);
    }
    return fetch(url, { signal: controller.signal }).then(function (r) {
      clearTimeout(timer);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (data) {
      cache[path] = data;
      return data;
    }).catch(function (err) {
      clearTimeout(timer);
      throw err;
    });
  }

  // ─── SETTINGS ────────────────────────────────────────────

  function injectSettings(settings) {
    if (!settings) return;

    // data-phantom="key" — replaces textContent (or src for IMG)
    document.querySelectorAll('[data-phantom]').forEach(function (el) {
      const key = el.getAttribute('data-phantom');
      if (settings[key] === undefined || settings[key] === null) return;
      let val = String(settings[key]);
      if (el.tagName === 'IMG' || el.tagName === 'SOURCE') {
        // Prepend assets/images/ for relative paths that don't have it
        if (val.indexOf('/') !== 0 && val.indexOf('http') !== 0 && val.indexOf('assets/') !== 0) {
          val = 'assets/images/' + val;
        }
        el.setAttribute('src', val);
      } else if (el.tagName === 'A' && el.hasAttribute('href')) {
        el.setAttribute('href', val);
      } else {
        el.innerHTML = escapeHtml(val).replace(/\n/g, '<br>');
      }
    });

    // data-phantom-bg="key" — sets background-image
    document.querySelectorAll('[data-phantom-bg]').forEach(function (el) {
      const key = el.getAttribute('data-phantom-bg');
      if (settings[key]) el.style.backgroundImage = 'url(' + settings[key] + ')';
    });
  }

  // ─── MENUS ───────────────────────────────────────────────

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function sanitizeUrl(url) {
    if (!url) return '#';
    url = url.trim();
    if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(url)) return url;
    return '#';
  }

  function buildMenuHTML(items) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const hasChildren = item.children && item.children.length > 0;
      const li = document.createElement('li');
      li.className = 'nav-item' + (hasChildren ? ' dropdown' : '');
      if (hasChildren) {
        const a = document.createElement('a');
        a.className = 'nav-link dropdown-toggle dropdown-color navbar-text-color';
        a.href = sanitizeUrl(item.url);
        a.setAttribute('role', 'button');
        a.setAttribute('data-toggle', 'dropdown');
        a.setAttribute('aria-haspopup', 'true');
        a.setAttribute('aria-expanded', 'false');
        a.textContent = item.title;
        li.appendChild(a);
        const div = document.createElement('div');
        div.className = 'dropdown-menu drop-down-content';
        const ul = document.createElement('ul');
        ul.className = 'list-unstyled drop-down-pages';
        for (let j = 0; j < item.children.length; j++) {
          const child = item.children[j];
          const childLi = document.createElement('li');
          childLi.className = 'nav-item';
          const childA = document.createElement('a');
          childA.className = 'dropdown-item nav-link';
          childA.href = sanitizeUrl(child.url);
          childA.textContent = child.title;
          childLi.appendChild(childA);
          ul.appendChild(childLi);
        }
        div.appendChild(ul);
        li.appendChild(div);
      } else {
        const a = document.createElement('a');
        a.className = 'nav-link';
        a.href = sanitizeUrl(item.url);
        a.textContent = item.title;
        li.appendChild(a);
      }
      frag.appendChild(li);
    }
    const wrapper = document.createElement('div');
    wrapper.appendChild(frag);
    return wrapper.innerHTML;
  }

  function injectMenus(menus) {
    if (!menus) return;
    document.querySelectorAll('[data-phantom-menu]').forEach(function (el) {
      const location = el.getAttribute('data-phantom-menu');
      const menu = menus[location];
      const items = (menu && menu.items) || [];
      if (!items.length) return;
      el.innerHTML = buildMenuHTML(items);
      const path = window.location.pathname;
      const origin = window.location.origin;
      el.querySelectorAll('a.nav-link').forEach(function (a) {
        const href = a.getAttribute('href');
        // Match by pathname (relative) or full URL (absolute)
        if (href === path || href === origin + path) {
          a.classList.add('active');
        }
      });
      el.querySelectorAll('.dropdown-toggle').forEach(function (toggle) {
        if (typeof $ !== 'undefined' && $.fn.dropdown) {
          $(toggle).dropdown();
        }
      });
    });
  }

  // ─── PRODUCTS ────────────────────────────────────────────

  function buildProductCard(p, showSaleBadge, saleBadgeText) {
    const imgSrc = p.image || '';
    const priceHtml = p.price_html || '$' + (p.price || '0');
    const detailUrl = '/product/?product_id=' + (p.id || '');
    const isSale = p.on_sale;
    const isFeatured = p.is_featured;
    const salePrice = p.sale_price || '';
    const regPrice = p.regular_price || p.price || '';

    const outer = document.createElement('div');
    outer.className = 'col-xl-4 col-lg-6 col-md-6 col-sm-6 d-flex';
    const sellerBox = document.createElement('div');
    sellerBox.className = 'seller-box w-100';
    const imgBox = document.createElement('div');
    imgBox.className = 'seller_image_box position-relative';
    if (isSale && showSaleBadge) {
      const saleTag = document.createElement('span');
      saleTag.className = 'd-inline-block position-absolute sale-tag background-primary text-white';
      saleTag.textContent = saleBadgeText;
      imgBox.appendChild(saleTag);
    }
    if (isFeatured) {
      const featTag = document.createElement('span');
      featTag.className = 'd-inline-block position-absolute featured-tag';
      featTag.textContent = 'Featured';
      featTag.style.top = isSale ? '48px' : '20px';
      imgBox.appendChild(featTag);
    }
    const figure = document.createElement('figure');
    figure.className = 'mb-0';
    const figLink = document.createElement('a');
    figLink.href = detailUrl;
    const prodImg = document.createElement('img');
    prodImg.src = imgSrc;
    prodImg.alt = p.name || '';
    prodImg.className = 'img-fluid';
    prodImg.loading = 'lazy';
    figLink.appendChild(prodImg);
    figure.appendChild(figLink);
    imgBox.appendChild(figure);
    const ul = document.createElement('ul');
    ul.className = 'list-unstyled mb-0';
    const cartLi = document.createElement('li');
    cartLi.className = 'icon';
    const cartLink = document.createElement('a');
    cartLink.href = detailUrl;
    cartLink.className = 'add-to-cart-trigger';
    cartLink.setAttribute('data-product_id', p.id || '');
    cartLink.setAttribute('data-product_sku', p.sku || '');
    const cartImg = document.createElement('img');
    cartImg.src = resolveUrl('assets/images/feature-cart.png');
    cartImg.alt = 'cart';
    cartImg.className = 'img-fluid';
    cartLink.appendChild(cartImg);
    cartLi.appendChild(cartLink);
    ul.appendChild(cartLi);
    const heartLi = document.createElement('li');
    heartLi.className = 'icon';
    const heartLink = document.createElement('a');
    heartLink.href = detailUrl;
    const heartImg = document.createElement('img');
    heartImg.src = resolveUrl('assets/images/feature-heart.png');
    heartImg.alt = 'wishlist';
    heartImg.className = 'img-fluid';
    heartLink.appendChild(heartImg);
    heartLi.appendChild(heartLink);
    ul.appendChild(heartLi);
    const eyeLi = document.createElement('li');
    eyeLi.className = 'icon';
    const eyeLink = document.createElement('a');
    eyeLink.href = detailUrl;
    const eyeImg = document.createElement('img');
    eyeImg.src = resolveUrl('assets/images/feature-eye.png');
    eyeImg.alt = 'quickview';
    eyeImg.className = 'img-fluid';
    eyeLink.appendChild(eyeImg);
    eyeLi.appendChild(eyeLink);
    ul.appendChild(eyeLi);
    imgBox.appendChild(ul);
    sellerBox.appendChild(imgBox);
    const content = document.createElement('div');
    content.className = 'seller_box_content';
    const textWrapper = document.createElement('div');
    textWrapper.className = 'text_wrapper position-relative';
    const ratingVal = Math.round(parseFloat(p.rating) || 0);
    const rating = document.createElement('div');
    rating.className = 'rating d-flex align-items-center justify-content-center';
    for (let s = 0; s < 5; s++) {
      const star = document.createElement('i');
      star.className = s < ratingVal ? 'fa-solid fa-star' : 'fa-regular fa-star';
      star.style.color = s < ratingVal ? '#fcd668' : '#ccc';
      rating.appendChild(star);
    }
    const ratingSpan = document.createElement('span');
    ratingSpan.className = 'd-inline-block';
    ratingSpan.textContent = '(' + (p.rating || '0') + '/5)';
    rating.appendChild(ratingSpan);
    textWrapper.appendChild(rating);
    const h6 = document.createElement('h6');
    h6.className = 'heading6 archivo-font';
    const nameLink = document.createElement('a');
    nameLink.href = detailUrl;
    nameLink.textContent = p.name || '';
    h6.appendChild(nameLink);
    textWrapper.appendChild(h6);
    const priceDiv = document.createElement('div');
    priceDiv.className = 'objct-price';
    if (isSale) {
      const saleSpan = document.createElement('span');
      saleSpan.className = 'd-inline-block';
      saleSpan.textContent = '$' + salePrice;
      priceDiv.appendChild(saleSpan);
      priceDiv.appendChild(document.createTextNode(' '));
      const delSpan = document.createElement('span');
      delSpan.className = 'd-inline-block';
      const del = document.createElement('del');
      del.textContent = '$' + regPrice;
      delSpan.appendChild(del);
      priceDiv.appendChild(delSpan);
    } else {
      priceDiv.innerHTML = priceHtml;
    }
    textWrapper.appendChild(priceDiv);
    content.appendChild(textWrapper);
    sellerBox.appendChild(content);
    outer.appendChild(sellerBox);
    return outer;
  }

  function injectProducts(products, settings, allPageData) {
    if (!products) return;
    const showSaleBadge = settings ? !!+settings.card_sale_badge : true;
    const saleBadgeText = (settings && settings.card_sale_badge_text) || 'Sale!';
    document.querySelectorAll('[data-phantom-products]').forEach(function (container) {
      const count = parseInt(container.getAttribute('data-phantom-products'), 10) || products.length;
      if (products.length < count) {
        // Fetch more products from API
        fetchJSON('/products?per_page=' + count + '&page=1').then(function(data) {
          if (!data || !data.products) return;
          container.innerHTML = '';
          data.products.slice(0, count).forEach(function(p) {
            container.appendChild(buildProductCard(p, showSaleBadge, saleBadgeText));
          });
        });
        return;
      }
      container.innerHTML = '';
      products.slice(0, count).forEach(function(p) {
        container.appendChild(buildProductCard(p, showSaleBadge, saleBadgeText));
      });
    });
  }

  // ─── SINGLE PRODUCT ──────────────────────────────────────

  function renderProduct(p) {
    if (!p || p.code) return;
    const el = document.querySelector('[data-phantom-product]');
    if (!el) el = document.body;

    document.title = (p.name || 'Product') + ' | Claudia';

    // Name
    const nameEl = el.querySelector('.heading4.archivo-font');
    if (nameEl) nameEl.textContent = p.name || '';

    // Price
    const priceEl = el.querySelector('.types_content .price');
    if (priceEl) {
      if (p.on_sale) {
        priceEl.innerHTML = '$' + (p.sale_price || p.price) + ' <span class="d-inline-block strike">$' + (p.regular_price || p.price) + '</span>';
      } else {
        priceEl.innerHTML = p.price_html || '$' + (p.price || '0');
      }
    }

    // Description
    const descEl = el.querySelector('.types_content p.text-size-16');
    if (descEl) {
      descEl.textContent = p.short_description ? p.short_description.replace(/<[^>]+>/g, '') : (p.description ? p.description.replace(/<[^>]+>/g, '') : '');
    }

    // Main image (first tab pane)
    const mainImg = el.querySelector('#myTabContent .tab-pane.active.show figure.auction-img img, #myTabContent .tab-pane:first-child figure.auction-img img');
    if (mainImg) mainImg.src = p.image || '';

    // Gallery thumbnails
    const thumbs = el.querySelectorAll('#myTab ul.nav-tabs li.nav-item a.nav-link figure.auction-img img');
    const gallery = p.gallery || [];
    if (thumbs.length && p.image) {
      thumbs[0].src = p.image;
      for (let gi = 1; gi < thumbs.length && gi <= gallery.length; gi++) {
        thumbs[gi].src = gallery[gi - 1] || p.image;
      }
    }
    // Also update tab pane images for gallery
    const panes = el.querySelectorAll('#myTabContent .tab-pane figure.auction-img img');
    if (panes.length && p.image) {
      panes[0].src = p.image;
      for (let pi = 1; pi < panes.length && pi <= gallery.length; pi++) {
        panes[pi].src = gallery[pi - 1] || p.image;
      }
    }

    // Stock status
    const stockEl = el.querySelector('.in-stock');
    if (stockEl) stockEl.textContent = p.in_stock ? 'In stock' : 'Out of stock';

    // SKU, Categories, Tags
    const skuEl = el.querySelector('.guranted-safe-checkout .safe-types div:nth-child(1) .d-inline-block.font-weight-600');
    if (skuEl) skuEl.textContent = p.sku || 'N/A';

    const catEl = el.querySelector('.guranted-safe-checkout .safe-types div:nth-child(2) .d-inline-block.font-weight-600');
    if (catEl) catEl.textContent = (p.categories || []).join(', ') || 'N/A';

    // Add to cart button
    const atcBtn = el.querySelector('.quatity_button_wrapper a.primary_btn');
    if (atcBtn) {
      atcBtn.setAttribute('data-product_id', p.id || '');
      atcBtn.setAttribute('data-product_sku', p.sku || '');
    }

    // Rating
    const ratingEl = el.querySelector('.types_content .rating span.d-inline-block');
    if (ratingEl) ratingEl.textContent = '(' + (p.rating || '0') + '/5)';

    // Product video
    const vidThumb = el.querySelector('.nav-video-thumb');
    const vidContainer = el.querySelector('#video-tab-pane .product-video-container');
    if (vidThumb && vidContainer && p.video_url) {
      vidThumb.style.display = '';
      let html = '';
      const url = p.video_url;
      if (url.indexOf('youtube.com/watch') !== -1 || url.indexOf('youtu.be') !== -1) {
        const vid = url.match(/(?:v=|\/)([\w-]{11})/);
        if (vid) html = '<iframe width="100%" height="450" src="https://www.youtube.com/embed/' + vid[1] + '" frameborder="0" allowfullscreen></iframe>';
      } else if (url.indexOf('vimeo.com') !== -1) {
        const vim = url.match(/(\d+)/);
        if (vim) html = '<iframe width="100%" height="450" src="https://player.vimeo.com/video/' + vim[1] + '" frameborder="0" allowfullscreen></iframe>';
      } else {
        html = '<video width="100%" height="450" controls><source src="' + url + '" type="video/mp4"></video>';
      }
      vidContainer.innerHTML = html;
    }

    // 360 product viewer
    const threeSixtyThumb = el.querySelector('.nav-360-thumb');
    const canvas = el.querySelector('#product-360-canvas');
    if (threeSixtyThumb && canvas && p.images_360 && p.images_360.length >= 3) {
      threeSixtyThumb.style.display = '';
      init360Viewer(canvas, p.images_360);
    }
  }

  function init360Viewer(canvas, images) {
    const ctx = canvas.getContext('2d');
    const loaded = [];
    let loadedCount = 0;
    let current = 0;
    let isDown = false;
    let startX = 0;

    function preload(idx) {
      if (loaded[idx]) return;
      const img = new Image();
      img.onload = function () {
        loaded[idx] = img;
        loadedCount++;
        if (loadedCount === 1) drawFrame(0);
      };
      img.src = images[idx];
    }

    function drawFrame(idx) {
      const img = loaded[idx];
      if (!img) return;
      current = idx;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    }

    images.forEach(function (_, i) { preload(i); });

    canvas.addEventListener('mousedown', function (e) {
      isDown = true;
      startX = e.clientX;
    });
    canvas.addEventListener('mousemove', function (e) {
      if (!isDown || loadedCount < images.length) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 20) {
        const dir = dx > 0 ? 1 : -1;
        const next = (current + dir + images.length) % images.length;
        drawFrame(next);
        startX = e.clientX;
      }
    });
    canvas.addEventListener('mouseup', function () { isDown = false; });
    canvas.addEventListener('mouseleave', function () { isDown = false; });
  }

  function injectSingleProduct() {
    const hasProductEl = document.querySelector('[data-phantom-product]') !== null;
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('product_id');
    const slugMatch = window.location.pathname.match(/\/product\/([^\/]+)/);
    const slug = slugMatch ? slugMatch[1] : null;
    if (!hasProductEl && !productId && !slug) return;

    if (slug) {
      fetchJSON('/products?per_page=100').then(function (resp) {
        const allProducts = Array.isArray(resp) ? resp : (resp.products || []);
        const p = allProducts.find(function (pr) { return pr.slug === slug; });
        if (p) renderProduct(p);
      }).catch(function (err) {
        console.error('[PhantomCore] Product slug lookup error:', err);
      });
    } else {
      let id = productId;
      if (!id) {
        const el = document.querySelector('[data-phantom-product]');
        id = el ? el.getAttribute('data-product-id') : null;
      }
      if (!id) return;
      fetchJSON('/products/' + id).then(function (resp) {
        const p = resp && resp.product ? resp.product : (Array.isArray(resp) ? resp[0] : resp);
        renderProduct(p);
      }).catch(function (err) {
        console.error('[PhantomCore] Product detail error:', err);
      });
    }
  }

  // ─── CART ────────────────────────────────────────────────

  function injectCart() {
    const cartInfo = document.querySelector('.shopping-cart .shopping-cart-info');
    if (!cartInfo) return;

    fetchJSON('/cart').then(function (data) {
      const items = data.items || [];
      cartInfo.innerHTML = '';

      items.forEach(function (item) {
        const div = document.createElement('div');
        div.className = 'product d-sm-flex d-block align-items-center';

        const prodDetails = document.createElement('div');
        prodDetails.className = 'product-details';

        const imgBox = document.createElement('div');
        imgBox.className = 'product-image box1';
        const fig = document.createElement('figure');
        fig.className = 'mb-0';
        const img = document.createElement('img');
        img.src = item.image || '';
        img.alt = item.name || '';
        img.className = 'img-fluid';
        fig.appendChild(img);
        imgBox.appendChild(fig);
        prodDetails.appendChild(imgBox);

        const prodContent = document.createElement('div');
        prodContent.className = 'product-content';
        const titleSpan = document.createElement('span');
        titleSpan.className = 'product-title';
        const titleLink = document.createElement('a');
        titleLink.href = '/product/?product_id=' + (item.id || '');
        titleLink.textContent = item.name || '';
        titleSpan.appendChild(titleLink);
        prodContent.appendChild(titleSpan);
        prodDetails.appendChild(prodContent);
        div.appendChild(prodDetails);

        const priceDiv = document.createElement('div');
        priceDiv.className = 'product-price';
        const priceSpan = document.createElement('span');
        priceSpan.textContent = item.price || '';
        priceDiv.appendChild(priceSpan);
        div.appendChild(priceDiv);

        const qtyDiv = document.createElement('div');
        qtyDiv.className = 'product-quantity d-flex';
        const qtyDetails = document.createElement('div');
        qtyDetails.className = 'product-qty-details';
        const decBtn = document.createElement('button');
        decBtn.className = 'value-button decrease-button';
        decBtn.setAttribute('data-cart-key', item.key || '');
        decBtn.textContent = '-';
        qtyDetails.appendChild(decBtn);
        const numDiv = document.createElement('div');
        numDiv.className = 'number';
        numDiv.setAttribute('data-cart-key', item.key || '');
        numDiv.textContent = item.qty || 1;
        qtyDetails.appendChild(numDiv);
        const incBtn = document.createElement('button');
        incBtn.className = 'value-button increase-button';
        incBtn.setAttribute('data-cart-key', item.key || '');
        incBtn.textContent = '+';
        qtyDetails.appendChild(incBtn);
        qtyDiv.appendChild(qtyDetails);
        div.appendChild(qtyDiv);

        const linePriceDiv = document.createElement('div');
        linePriceDiv.className = 'product-line-price';
        const linePriceSpan = document.createElement('span');
        linePriceSpan.textContent = item.total || '';
        linePriceDiv.appendChild(linePriceSpan);
        div.appendChild(linePriceDiv);

        const removalDiv = document.createElement('div');
        removalDiv.className = 'product-removal';
        const rmBtn = document.createElement('button');
        rmBtn.className = 'remove-product';
        rmBtn.setAttribute('data-cart-key', item.key || '');
        const rmIcon = document.createElement('i');
        rmIcon.className = 'fas fa-times';
        rmBtn.appendChild(rmIcon);
        removalDiv.appendChild(rmBtn);
        div.appendChild(removalDiv);

        cartInfo.appendChild(div);
      });

      // Totals
      const subtotalEl = document.querySelector('.detail .list-unstyled li span.dollar');
      if (subtotalEl) subtotalEl.textContent = data.total || '$0';

      const totalEl = document.querySelector('.all-total .total span.dollar');
      if (totalEl) totalEl.textContent = data.total || '$0';

      // Cart count in header
      if (data.totalItems !== undefined) {
        updateCartCount(data.totalItems);
      }
    }).catch(function (err) {
      console.error('[PhantomCore] Cart fetch error:', err);
    });
  }

  function updateCartCount(count) {
    document.querySelectorAll('.last_list a.cart span, a.cart span').forEach(function (el) {
      el.textContent = count || 0;
    });
  }

  // ─── WOOCOMMERCE AJAX ────────────────────────────────────

  function getStoreNonce() {
    const el = document.querySelector('meta[name="wc-nonce"]');
    return el ? el.getAttribute('content') : '';
  }

  function wcAjax(endpoint, formData) {
    const url = '/?wc-ajax=' + endpoint;
    const nonceEl = document.querySelector('meta[name="wc-nonce"]');
    if (nonceEl) formData.append('security', nonceEl.getAttribute('content'));
    return fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      body: formData
    }).then(function (r) { return r.json(); });
  }

  function storeApiUpdateItem(key, qty) {
    return fetch('/wp-json/wc/store/v1/cart/update-item', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'Nonce': getStoreNonce()
      },
      body: JSON.stringify({ key: key, quantity: qty })
    }).then(function (r) { return r.json(); });
  }

  function onCartUpdate(data) {
    if (data && data.fragments) {
      Object.keys(data.fragments).forEach(function (key) {
        const target = document.querySelector(key);
        if (target) target.outerHTML = data.fragments[key];
      });
    }
    if (data && data.cart_hash !== undefined) {
      injectCart();
    }
  }

  function initWooCommerce() {
    document.addEventListener('click', function (e) {
      let btn, fd, key;

      // Add to cart
      btn = e.target.closest('.add-to-cart-trigger, .quatity_button_wrapper a.primary_btn');
      if (btn) {
        e.preventDefault();
        let productId = btn.getAttribute('data-product_id');
        if (!productId) {
          // Try to get from parent container
          const detailContainer = btn.closest('[data-phantom-product]');
          if (detailContainer) {
            productId = detailContainer.getAttribute('data-product-id');
          }
        }
        if (!productId) return;
        fd = new FormData();
        fd.append('product_id', productId);
        fd.append('product_sku', btn.getAttribute('data-product_sku') || '');
        fd.append('quantity', 1);
        wcAjax('add_to_cart', fd).then(onCartUpdate).catch(function (err) {
          console.error('[PhantomCore] Add to cart error:', err);
        });
        return;
      }

      // Remove from cart
      btn = e.target.closest('.remove-product');
      if (btn) {
        e.preventDefault();
        key = btn.getAttribute('data-cart-key');
        if (!key) return;
        fd = new FormData();
        fd.append('cart_item_key', key);
        wcAjax('remove_from_cart', fd).then(onCartUpdate).catch(function (err) {
          console.error('[PhantomCore] Remove from cart error:', err);
        });
        return;
      }

      // Quantity minus (cart page)
      btn = e.target.closest('.decrease-button');
      if (btn && btn.closest('.shopping-cart')) {
        e.preventDefault();
        key = btn.getAttribute('data-cart-key');
        const numEl = document.querySelector('.number[data-cart-key="' + key + '"]');
        if (numEl && parseInt(numEl.textContent) > 1) {
          numEl.textContent = parseInt(numEl.textContent) - 1;
          storeApiUpdateItem(key, parseInt(numEl.textContent)).then(function (data) {
            if (data && data.items !== undefined) injectCart();
          }).catch(function (err) {
            console.error('[PhantomCore] Cart decrease error:', err);
          });
        }
        return;
      }

      // Quantity plus (cart page)
      btn = e.target.closest('.increase-button');
      if (btn && btn.closest('.shopping-cart')) {
        e.preventDefault();
        key = btn.getAttribute('data-cart-key');
        const numEl2 = document.querySelector('.number[data-cart-key="' + key + '"]');
        if (numEl2) {
          numEl2.textContent = parseInt(numEl2.textContent) + 1;
          storeApiUpdateItem(key, parseInt(numEl2.textContent)).then(function (data) {
            if (data && data.items !== undefined) injectCart();
          }).catch(function (err) {
            console.error('[PhantomCore] Cart increase error:', err);
          });
        }
        return;
      }
    });
  }

  // ─── CHECKOUT ────────────────────────────────────────────

  function initCheckout() {
    const form = document.getElementById('contactpage');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const fd = new FormData(form);
      fd.append('action', 'woocommerce_ajax_checkout');
      const btn = form.querySelector('.submit_now');
      if (btn) btn.textContent = 'Processing...';

      wcAjax('checkout', fd).then(function (data) {
        if (btn) btn.textContent = 'Next';
        if (data && data.result === 'success') {
          window.location.href = data.redirect || '/thank-you/';
        } else if (data && data.messages) {
          let errEl = document.querySelector('.checkout-errors');
          if (!errEl) {
            errEl = document.createElement('div');
            errEl.className = 'checkout-errors alert alert-danger mt-3';
            form.appendChild(errEl);
          }
          errEl.textContent = data.messages;
        }
      }).catch(function (err) {
        console.error('[PhantomCore] Checkout error:', err);
        if (btn) btn.textContent = 'Next';
      });
    });
  }

  // ─── POSTS / BLOG ────────────────────────────────────────

  function injectPosts(posts) {
    if (!posts || !posts.length) return;
    document.querySelectorAll('[data-phantom-posts]').forEach(function (container) {
      const count = parseInt(container.getAttribute('data-phantom-posts'), 10) || posts.length;
      const items = posts.slice(0, count);
      container.innerHTML = '';
      items.forEach(function (post) {
        const imgSrc = post.featured_image || resolveUrl('assets/images/single-blog-tab-img1.jpg');
        const dateStr = post.date ? new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
        const div = document.createElement('div');
        div.className = 'single-blog-box';
        const figure = document.createElement('figure');
        figure.className = 'mb-0';
        const link1 = document.createElement('a');
        link1.href = '/post/?post_id=' + encodeURIComponent(post.id || post.slug || '');
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = post.title || '';
        img.loading = 'lazy';
        img.className = 'img-fluid';
        link1.appendChild(img);
        figure.appendChild(link1);
        div.appendChild(figure);
        const details = document.createElement('div');
        details.className = 'single-blog-details';
        const ul = document.createElement('ul');
        ul.className = 'list-unstyled';
        const li1 = document.createElement('li');
        li1.className = 'position-relative';
        li1.innerHTML = '<i class="fas fa-user"></i> Posted by Admin';
        ul.appendChild(li1);
        if (dateStr) {
          const li2 = document.createElement('li');
          li2.className = 'position-relative';
          li2.innerHTML = '<i class="fas fa-calendar-alt"></i> ' + escapeHtml(dateStr);
          ul.appendChild(li2);
        }
        details.appendChild(ul);
        const h4 = document.createElement('h4');
        const link2 = document.createElement('a');
        link2.href = '/post/?post_id=' + encodeURIComponent(post.id || post.slug || '');
        link2.textContent = post.title || '';
        h4.appendChild(link2);
        details.appendChild(h4);
        const p = document.createElement('p');
        p.textContent = post.excerpt ? post.excerpt.replace(/<[^>]+>/g, '') : '';
        details.appendChild(p);
        const btnDiv = document.createElement('div');
        btnDiv.className = 'generic-btn2';
        const link3 = document.createElement('a');
        link3.href = '/post/?post_id=' + encodeURIComponent(post.id || post.slug || '');
        link3.textContent = 'Read More';
        btnDiv.appendChild(link3);
        details.appendChild(btnDiv);
        div.appendChild(details);
        container.appendChild(div);
      });
    });
  }

  // ─── SINGLE BLOG POST ──────────────────────────────────────

  function injectSinglePost() {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('post_id');
    if (!postId) return;

    fetchJSON('/posts/' + encodeURIComponent(postId)).then(function (data) {
      const p = data && data.post ? data.post : (Array.isArray(data) ? data[0] : data);
      if (!p || p.code) return;

      const el = document.querySelector('[data-phantom-post]');
      if (!el) return;

      document.title = (p.title || '') + ' | Claudia Kids Collection';

      // Title
      const titleEl = el.querySelector('.content1 h4, .news-heading, .blog-detail-heading, h2, h1');
      if (titleEl) titleEl.textContent = p.title || '';

      // Date
      const dateSpans = el.querySelectorAll('.span-fa-outer-con span.text-size-14');
      if (dateSpans.length >= 2 && p.date) {
        dateSpans[1].textContent = new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      }

      // Content
      const contentEl = el.querySelector('.content1 p.text-size-16, .text-size-16, .news-detail-content p');
      if (contentEl && p.content) {
        contentEl.innerHTML = p.content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      }

      // Featured image
      const imgEl = el.querySelector('.image1 img, .featured-image img, .blog-detail-image img');
      if (imgEl && p.featured_image) {
        imgEl.src = p.featured_image;
        imgEl.alt = p.title || '';
      }
    }).catch(function (err) {
      console.error('[PhantomCore] Single post error:', err);
    });
  }

  // ─── CATEGORIES ──────────────────────────────────────────

  function injectCategories(categories) {
    if (!categories || !categories.length) return;
    const catList = document.querySelector('#category1 ul.list-unstyled');
    if (!catList) return;
    catList.innerHTML = '';
    categories.forEach(function (cat) {
      const li = document.createElement('li');
      li.className = 'cat-item';
      const a = document.createElement('a');
      a.href = '/shop/?category=' + encodeURIComponent(cat.slug || '');
      a.className = 'd-block';
      a.textContent = (cat.name || '') + ' (' + (cat.count || 0) + ')';
      li.appendChild(a);
      catList.appendChild(li);
    });
  }

  function resolveUrl(val) {
    if (!val || val.indexOf('http') === 0 || val.indexOf('data:') === 0 || val.indexOf('/wp-content/') === 0) return val;
    if (val.indexOf('assets/') === 0) return '/wp-content/plugins/phantom-core/frontend/' + val;
    if (val.indexOf('/') === 0) return '/wp-content/plugins/phantom-core/frontend/assets/images/' + val.replace(/^\//, '');
    return '/wp-content/plugins/phantom-core/frontend/assets/images/' + val;
  }

  // ─── FOOTER ──────────────────────────────────────────────

  function injectFooter(settings) {
    if (!settings) return;

    // Logo
    const logoImg = document.querySelector('.footer-logo img');
    if (logoImg && settings.footer_logo) logoImg.src = resolveUrl(settings.footer_logo);

    // About text
    const aboutText = document.querySelector('.logo-content .text.text-size-14');
    if (aboutText && settings.footer_about_text) aboutText.innerHTML = escapeHtml(settings.footer_about_text).replace(/\n/g, '<br>');

    // Copyright
    const copyrightEl = document.querySelector('.copyright .content p');
    if (copyrightEl && settings.footer_copyright) {
      copyrightEl.textContent = settings.footer_copyright.replace('%d', new Date().getFullYear());
    }

    // Payment cards
    const paymentImg = document.querySelector('.copyright .content img');
    if (paymentImg && settings.footer_payment_cards) paymentImg.src = resolveUrl(settings.footer_payment_cards);

    // Contact info
    const phoneLink = document.querySelector('.icon ul.list-unstyled a[href^="tel:"]');
    if (phoneLink && settings.footer_phone) {
      phoneLink.href = 'tel:' + settings.footer_phone.replace(/[^0-9+]/g, '');
      phoneLink.textContent = settings.footer_phone;
    }
    const emailLink = document.querySelector('.icon ul.list-unstyled a[href^="mailto:"]');
    if (emailLink && settings.footer_email) {
      emailLink.href = 'mailto:' + settings.footer_email;
      emailLink.textContent = settings.footer_email;
    }
    const addressEl = document.querySelector('.icon ul.list-unstyled a.address, .icon ul.list-unstyled li:last-child a');
    if (addressEl && settings.footer_address) addressEl.innerHTML = escapeHtml(settings.footer_address).replace(/\n/g, '<br>');

    // Social links
    const socialUl = document.querySelector('.logo-content ul.social-icons');
    if (socialUl && settings.footer_social_links && settings.footer_social_links.length) {
      socialUl.innerHTML = '';
      settings.footer_social_links.forEach(function (s) {
        const iconMap = { facebook: 'fa-facebook-f', instagram: 'fa-instagram', youtube: 'fa-youtube', twitter: 'fa-x-twitter', pinterest: 'fa-pinterest' };
        const iconClass = iconMap[(s.platform || '').toLowerCase()] || 'fa-globe';
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = sanitizeUrl(s.url);
        const i = document.createElement('i');
        i.className = 'fa-brands ' + iconClass + ' social-networks';
        a.appendChild(i);
        li.appendChild(a);
        socialUl.appendChild(li);
      });
    }
  }

  // ─── BANNER ──────────────────────────────────────────────

  function injectBanner(settings) {
    if (!settings) return;
    const span = document.querySelector('.banner-span');
    if (span && settings.home_banner_heading) span.textContent = settings.home_banner_heading;
    const h1 = document.querySelector('.center-context h1.font-size92');
    if (h1 && settings.home_banner_title) h1.innerHTML = escapeHtml(settings.home_banner_title).replace(/\n/g, '<br>');
    const p = document.querySelector('.center-context p');
    if (p && settings.home_banner_description) p.innerHTML = escapeHtml(settings.home_banner_description).replace(/\n/g, '<br>');
    const cta = document.querySelector('.center-context a.secondary_btn');
    if (cta) {
      if (settings.home_banner_btn_text) cta.childNodes[0].textContent = settings.home_banner_btn_text;
      if (settings.home_banner_btn_url) cta.href = settings.home_banner_btn_url;
    }
    const img1 = document.querySelector('.banner-img1');
    if (img1 && settings.home_banner_img1) img1.src = resolveUrl(settings.home_banner_img1);
    const img2 = document.querySelector('.banner-img2');
    if (img2 && settings.home_banner_img2) img2.src = resolveUrl(settings.home_banner_img2);
  }

  // ─── SEO ─────────────────────────────────────────────────

  function injectSEO(settings) {
    if (!settings) return;
    if (settings.seo_meta_description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.content = settings.seo_meta_description;
    }
    if (settings.seo_og_title) {
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.content = settings.seo_og_title;
    }
    if (settings.seo_og_description) {
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.content = settings.seo_og_description;
    }
    if (settings.seo_og_image) {
      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg) ogImg.content = settings.seo_og_image;
    }
  }

  // ─── PRELOADER ───────────────────────────────────────────

  function hidePreloader() {
    const mask = document.querySelector('.loader-mask');
    if (mask) {
      mask.style.opacity = '0';
      mask.style.pointerEvents = 'none';
      setTimeout(function () { mask.style.display = 'none'; }, 500);
    }
  }

  // ─── INIT ────────────────────────────────────────────────

  function init() {
    fetchJSON('/cart').then(function (data) {
      if (data.totalItems !== undefined) updateCartCount(data.totalItems);
    }).catch(function (err) {
      console.error('[PhantomCore] Cart count fetch failed:', err);
    });
    fetchJSON('/page-data').then(function (data) {
      if (data.settings) {
        injectSettings(data.settings);
        injectBanner(data.settings);
        injectFooter(data.settings);
        injectSEO(data.settings);
      }
      if (data.menus) injectMenus(data.menus);
      if (data.products) injectProducts(data.products, data.settings);
      if (data.posts) injectPosts(data.posts);
      if (data.categories) injectCategories(data.categories);

      injectSinglePost();

      initWooCommerce();
      injectSingleProduct();
      injectCart();
      initCheckout();
      hidePreloader();
    }).catch(function (err) {
      console.error('[PhantomCore] Init error:', err);
      hidePreloader();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.PhantomCore = { fetchJSON: fetchJSON, apiBase: apiBase, cache: cache };

})();
