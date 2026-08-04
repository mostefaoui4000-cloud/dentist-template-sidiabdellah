document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // DYNAMIC GA4 & META PIXEL INJECTION ENGINE
  // Only runs after the visitor accepts the cookie/consent banner.
  // ==========================================
  function loadAnalytics() {
    if (!clinicConfig.analytics) return;
    const { ga4Id, metaPixelId } = clinicConfig.analytics;

    // --- 1. Google Analytics 4 (GA4) ---
    if (ga4Id && ga4Id.trim() !== "") {
      const gaScript = document.createElement("script");
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
      document.head.appendChild(gaScript);

      window.dataLayer = window.dataLayer || [];
      function gtag(){ dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', ga4Id, { 'send_page_view': true });
    }

    // --- 2. Meta Pixel (Facebook) ---
    if (metaPixelId && metaPixelId.trim() !== "") {
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');

      fbq('init', metaPixelId);
      fbq('track', 'PageView');
    }
  }

  // --- Consent banner wiring ---
  const consentBanner = document.getElementById("consentBanner");
  const consentAccept = document.getElementById("consentAccept");
  const consentDecline = document.getElementById("consentDecline");
  const storedConsent = localStorage.getItem("cookieConsent");

  if (storedConsent === "accepted") {
    loadAnalytics();
  } else if (storedConsent !== "declined" && consentBanner) {
    consentBanner.classList.add("visible");
  }

  if (consentAccept) {
    consentAccept.addEventListener("click", () => {
      localStorage.setItem("cookieConsent", "accepted");
      consentBanner.classList.remove("visible");
      loadAnalytics();
    });
  }
  if (consentDecline) {
    consentDecline.addEventListener("click", () => {
      localStorage.setItem("cookieConsent", "declined");
      consentBanner.classList.remove("visible");
    });
  }

  // ==========================================
  // EVENT TRACKING (Conversions & Booking Clicks)
  // ==========================================
  // Track whenever a user clicks "Prendre RDV" or WhatsApp
  document.querySelectorAll(".open-booking").forEach(btn => {
    btn.addEventListener("click", () => {
      if (window.gtag) gtag('event', 'click_booking', { 'event_category': 'Conversion' });
      if (window.fbq) fbq('track', 'Schedule');
    });
  });

  document.querySelectorAll(".whatsapp-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (window.gtag) gtag('event', 'click_whatsapp', { 'event_category': 'Conversion' });
      if (window.fbq) fbq('track', 'Contact');
    });
  });
  // 0. Dynamic SEO: title, meta description, canonical, OG & Twitter tags
  const pageUrl = clinicConfig.siteUrl ? clinicConfig.siteUrl.replace(/\/$/, "") + "/" : window.location.href;
  const ogImageUrl = clinicConfig.siteUrl
    ? clinicConfig.siteUrl.replace(/\/$/, "") + "/images/hero.jpg"
    : window.location.href + "images/hero.jpg";

  if (clinicConfig.pageTitle) document.title = clinicConfig.pageTitle;
  const setMeta = (id, attr, value) => {
    const el = document.getElementById(id);
    if (el) el.setAttribute(attr, value);
  };
  setMeta("meta-description", "content", clinicConfig.metaDescription);
  setMeta("canonical-link", "href", pageUrl);
  setMeta("og-title", "content", clinicConfig.pageTitle);
  setMeta("og-description", "content", clinicConfig.metaDescription);
  setMeta("og-image", "content", ogImageUrl);
  setMeta("og-url", "content", pageUrl);
  setMeta("twitter-title", "content", clinicConfig.pageTitle);
  setMeta("twitter-description", "content", clinicConfig.metaDescription);
  setMeta("twitter-image", "content", ogImageUrl);

  const logoImg = document.getElementById("logo-img");
  if (logoImg) logoImg.alt = `${clinicConfig.name} logo`;

  // 1. Inject Theme Colors Dynamic Configuration Overrides
  if (clinicConfig.colors) {
    document.documentElement.style.setProperty('--primary-color', clinicConfig.colors.primary);
    document.documentElement.style.setProperty('--secondary-color', clinicConfig.colors.secondary);
    document.documentElement.style.setProperty('--bg-color', clinicConfig.colors.background);
    document.documentElement.style.setProperty('--text-color', clinicConfig.colors.text);
  }

  // 2. Inject Context text throughout Global Classes
  document.querySelectorAll(".dynamic-clinic-name").forEach(el => el.textContent = clinicConfig.name);
  document.querySelectorAll(".dynamic-doctor-name").forEach(el => el.textContent = clinicConfig.doctorName);
  document.querySelectorAll(".dynamic-speciality").forEach(el => el.textContent = clinicConfig.speciality);
  
  // Contacts Injection
  document.querySelectorAll(".whatsapp-btn").forEach(el => el.href = `https://wa.me/${clinicConfig.whatsapp}`);
  document.querySelectorAll(".dynamic-phone-link").forEach(el => {
    el.textContent = clinicConfig.phone;
    el.href = `tel:${clinicConfig.phone.replace(/\s+/g, '')}`;
  });
  document.querySelectorAll(".dynamic-email-link").forEach(el => {
    el.textContent = clinicConfig.email;
    el.href = `mailto:${clinicConfig.email}`;
  });
  
  const addressEl = document.querySelector(".address-text");
  if(addressEl) addressEl.textContent = `📍 ${clinicConfig.address}`;
  
  const mapsIframe = document.getElementById("maps-target");
  if(mapsIframe) mapsIframe.src = clinicConfig.mapsEmbedUrl;

  // 3. Inject Array Elements (Services, Reviews, Hours)
  // Built via safe DOM creation (textContent) rather than innerHTML so that
  // if this config is ever fed by client-submitted content (e.g. a future
  // "leave a review" form), it can't be used to inject scripts (XSS).
  const servicesTarget = document.getElementById("services-target");
  if (servicesTarget) {
    clinicConfig.services.forEach(s => {
      const card = document.createElement("div");
      // Added open-booking class so the modal listener opens automatically
      card.className = "service-card fade-up open-booking";
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", `Réserver pour ${s.title}`);

      const icon = document.createElement("span");
      icon.className = "service-icon";
      icon.textContent = s.icon;

      const title = document.createElement("h3");
      title.textContent = s.title;

      const desc = document.createElement("p");
      desc.textContent = s.desc;

      // Add a subtle CTA button inside the card
      const cta = document.createElement("span");
      cta.className = "service-cta";
      cta.textContent = "Prendre RDV →";

      card.append(icon, title, desc, cta);
      servicesTarget.appendChild(card);
    });
  }

  const reviewsTarget = document.getElementById("reviews-target");
  if (reviewsTarget) {
    clinicConfig.reviews.forEach(r => {
      const card = document.createElement("div");
      card.className = "review-card";

      const stars = document.createElement("div");
      stars.className = "star-rating";
      stars.textContent = "★".repeat(r.rating);

      const text = document.createElement("p");
      text.textContent = `"${r.text}"`;

      const author = document.createElement("div");
      author.className = "review-author";
      author.textContent = `- ${r.name}`;

      card.append(stars, text, author);
      reviewsTarget.appendChild(card);
    });
  }

  const hoursTarget = document.getElementById("hours-target");
  if (hoursTarget) {
    clinicConfig.hours.forEach(h => {
      const li = document.createElement("li");

      const days = document.createElement("strong");
      days.textContent = h.days;

      const time = document.createElement("span");
      time.textContent = h.time;

      li.append(days, time);
      hoursTarget.appendChild(li);
    });
  }

  // 4. Mobile Menu Navigation Toggler
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("active");
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // 5. Booking Modal Engine (Embed Control Setup)
  const modal = document.getElementById("bookingModal");
  const openButtons = document.querySelectorAll(".open-booking");
  const closeModal = document.querySelector(".close-modal");
  const iframeContainer = document.getElementById("iframe-container");

  openButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      if(modal && iframeContainer) {
        // Creates the embed dynamic target to improve primary window paint lifecycle speed
        iframeContainer.innerHTML = `<iframe src="${clinicConfig.bookingLink}" width="100%" height="100%" frameborder="0"></iframe>`;
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
      }
    });
  });

  if (closeModal && modal) {
    closeModal.addEventListener("click", () => {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
      if(iframeContainer) iframeContainer.innerHTML = ""; // Clear iframe allocation resource
    });
    modal.addEventListener("click", (e) => {
      if(e.target === modal) closeModal.click();
    });
  }

  // 6. Scroll Animations with IntersectionObserver Mechanics
  const fadeElements = document.querySelectorAll(".fade-up");
  const appearanceObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
        
        // Counter logic trigger inside about segment execution chain loop
        if(entry.target.classList.contains('about')) {
            triggerCounters();
        }
      }
    });
  }, { threshold: 0.15 });

  fadeElements.forEach(el => appearanceObserver.observe(el));
  
  const aboutSection = document.querySelector(".about");
  if(aboutSection) appearanceObserver.observe(aboutSection);

  // 7. Performance Smooth Counter Engine
  function triggerCounters() {
    const counters = document.querySelectorAll(".counter");
    counters.forEach(counter => {
      const type = counter.getAttribute("data-target");
      const target = clinicConfig.stats[type] || 0;
      let count = 0;
      const speed = target / 30; // Scale step speed relative to target volume
      
      const updateCount = () => {
        if (count < target) {
          count = Math.ceil(count + speed);
          counter.innerText = count > target ? target + "+" : count + "+";
          setTimeout(updateCount, 30);
        } else {
          counter.innerText = target + "+";
        }
      };
      updateCount();
    });
  }

  // 8. Auto Injection of SEO Structured Schema Markup
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    "name": clinicConfig.name,
    "image": window.location.href + "images/hero.jpg",
    "telephone": clinicConfig.phone,
    "email": clinicConfig.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": clinicConfig.address,
      "addressLocality": "Alger",
      "addressCountry": "DZ"
    },
    "url": window.location.href
  };

  // --- Inject Before & After Surgery Cases with Interactive Drag Slider ---
  const baTarget = document.getElementById("before-after-target");
  if (baTarget && clinicConfig.beforeAfterCases) {
    clinicConfig.beforeAfterCases.forEach((item, idx) => {
      const card = document.createElement("div");
      card.className = "ba-card fade-up";

      card.innerHTML = `
        <div class="ba-slider-container" id="ba-container-${idx}">
          <div class="ba-image ba-after">
            <img src="${item.afterImg}" alt="${item.title} - Après" loading="lazy">
            <span class="ba-badge after-badge">Après</span>
          </div>
          <div class="ba-before" id="ba-before-${idx}">
            <img src="${item.beforeImg}" alt="${item.title} - Avant" id="ba-before-img-${idx}" loading="lazy">
            <span class="ba-badge before-badge">Avant</span>
          </div>
          <div class="ba-line" id="ba-line-${idx}">
            <div class="ba-button">↔</div>
          </div>
          <input type="range" min="0" max="100" value="50" class="ba-range" aria-label="Comparer Avant et Après" data-index="${idx}">
        </div>
        <div class="ba-info">
          <h3>${item.title}</h3>
          <p>${item.desc}</p>
        </div>
      `;

      baTarget.appendChild(card);
    });

    // Handle range slider movement & update image width dynamically
    document.querySelectorAll(".ba-range").forEach(range => {
      const updateSlider = () => {
        const idx = range.getAttribute("data-index");
        const val = range.value;
        const container = document.getElementById(`ba-container-${idx}`);
        const before = document.getElementById(`ba-before-${idx}`);
        const beforeImg = document.getElementById(`ba-before-img-${idx}`);
        const line = document.getElementById(`ba-line-${idx}`);

        if (container && before && beforeImg && line) {
          const containerWidth = container.offsetWidth;
          before.style.width = `${val}%`;
          beforeImg.style.width = `${containerWidth}px`;
          line.style.left = `${val}%`;
        }
      };

      range.addEventListener("input", updateSlider);
      window.addEventListener("resize", updateSlider);
      // Run once on initial render
      setTimeout(updateSlider, 100);
    });
  }
  const schemaScript = document.getElementById("schema-json");
  if(schemaScript) schemaScript.text = JSON.stringify(schemaMarkup);
});