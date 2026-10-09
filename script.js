document.addEventListener("DOMContentLoaded", () => {
  // 1. ANALYTICS & CONSENT
  function loadAnalytics() {
    if (!window.clinicConfig || !clinicConfig.analytics) return;
    const { ga4Id, metaPixelId } = clinicConfig.analytics;

    if (ga4Id && ga4Id.trim() !== "") {
      const gaScript = document.createElement("script");
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
      document.head.appendChild(gaScript);

      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', ga4Id, { 'send_page_view': true });
    }

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
      if (consentBanner) consentBanner.classList.remove("visible");
      loadAnalytics();
    });
  }
  if (consentDecline) {
    consentDecline.addEventListener("click", () => {
      localStorage.setItem("cookieConsent", "declined");
      if (consentBanner) consentBanner.classList.remove("visible");
    });
  }

  // 2. BOOKING LISTENERS
  const attachBookingListeners = (container) => {
    const targets = container ? container.querySelectorAll(".open-booking") : document.querySelectorAll(".open-booking");
    targets.forEach(btn => {
      if (btn.dataset.listenerAttached === "true") return;
      btn.dataset.listenerAttached = "true";

      btn.addEventListener("click", (e) => {
        e.stopPropagation();

        let bookingUrl = btn.getAttribute("data-booking-url");
        if (!bookingUrl && window.clinicConfig) {
          const activeDept = document.body.getAttribute("data-active-dept") || "medical";
          bookingUrl = (clinicConfig.bookingLinks && clinicConfig.bookingLinks[activeDept]) || clinicConfig.bookingLinks.default;
        }

        if (window.gtag) gtag('event', 'click_booking', { 'event_category': 'Conversion' });
        if (window.fbq) fbq('track', 'Schedule');

        window.open(bookingUrl, "_blank");
      });
    });
  };

  // 3. DYNAMIC CONFIG & META INJECTION
  if (window.clinicConfig) {
    const pageUrl = clinicConfig.siteUrl ? clinicConfig.siteUrl.replace(/\/$/, "") + "/" : window.location.href;
    const ogImageUrl = clinicConfig.siteUrl ? clinicConfig.siteUrl.replace(/\/$/, "") + "/images/hero.jpg" : window.location.href + "images/hero.jpg";

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

    document.querySelectorAll(".dynamic-clinic-name").forEach(el => el.textContent = clinicConfig.name);
    document.querySelectorAll(".dynamic-phone-link").forEach(el => {
      el.textContent = clinicConfig.phone;
      el.href = `tel:${clinicConfig.phone.replace(/\s+/g, '')}`;
    });
    document.querySelectorAll(".dynamic-email-link").forEach(el => {
      el.textContent = clinicConfig.email;
      el.href = `mailto:${clinicConfig.email}`;
    });

    const mapsIframe = document.getElementById("maps-target");
    if (mapsIframe) mapsIframe.src = clinicConfig.mapsEmbedUrl;
  }

  // 4. SERVICES RENDERER WITH ARABIC DEDICATED LINES
  function renderServices(servicesArray) {
    const container = document.getElementById("services-target");
    if (!container || !servicesArray) return;

    container.innerHTML = servicesArray.map(service => {
      const descriptionText = service.desc || '';
      const arText = service.arDesc ? `<div class="ar-desc" dir="rtl" lang="ar">${service.arDesc}</div>` : '';
      const bookingType = service.bookingType || 'default';
      const bookingUrl = clinicConfig && clinicConfig.bookingLinks ? (clinicConfig.bookingLinks[bookingType] || clinicConfig.bookingLinks.default) : '#';

      return `
        <div class="service-card fade-up visible">
          <div class="service-icon">${service.iconSvg || '🩺'}</div>
          <h3>${service.title}</h3>
          <p>${descriptionText}</p>
          ${arText}
          <button class="btn btn-primary open-booking" data-booking-url="${bookingUrl}">
            Prendre RDV &rarr;
          </button>
        </div>
      `;
    }).join('');

    attachBookingListeners(container);
  }

  // 5. DEPARTMENT SWITCHER & HOURS RENDERER
  function renderHours(dept) {
    const hoursTarget = document.getElementById("hours-target");
    if (!hoursTarget || !clinicConfig.departmentHours) return;

    const list = clinicConfig.departmentHours[dept] || clinicConfig.departmentHours.medical;
    hoursTarget.innerHTML = list.map(h => `
      <li>
        <strong>${h.days}</strong>
        <span>${h.time}</span>
      </li>
    `).join('');
  }

  function applyDepartmentState(dept) {
    document.body.setAttribute("data-active-dept", dept);

    document.querySelectorAll(".dept-switch-btn").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-dept") === dept);
    });

    if (window.clinicConfig && clinicConfig.colors) {
      const activeColor = (dept === "medical") ? clinicConfig.colors.primary : clinicConfig.colors.secondary;
      document.documentElement.style.setProperty('--primary-color', activeColor);
    }

    const heroTitle = document.querySelector("#hero h1");
    const heroBtn = document.getElementById("hero-main-btn");

    if (dept === "medical") {
      if (heroTitle) heroTitle.innerHTML = "Votre santé globale et consultations en <strong>Médecine Générale</strong>.";
      if (heroBtn) {
        heroBtn.innerHTML = "🩺 Prendre RDV Consultation Médicale";
        heroBtn.setAttribute("data-booking-url", clinicConfig.bookingLinks ? clinicConfig.bookingLinks.medical : "#");
      }
    } else {
      if (heroTitle) heroTitle.innerHTML = "Votre plus beau sourire avec nos experts en <strong>Chirurgie Dentaire</strong>.";
      if (heroBtn) {
        heroBtn.innerHTML = "🦷 Prendre RDV Soins Dentaires";
        heroBtn.setAttribute("data-booking-url", clinicConfig.bookingLinks ? clinicConfig.bookingLinks.dental : "#");
      }
    }

    if (window.clinicConfig) {
      const services = (dept === "medical") ? clinicConfig.medicalServices : clinicConfig.dentalServices;
      renderServices(services);
      renderHours(dept);
    }

    document.querySelectorAll(".dept-card, .gallery-item").forEach(item => {
      const itemDept = item.getAttribute("data-dept");
      if (!itemDept || itemDept === dept) {
        item.style.setProperty("display", "block", "important");
      } else {
        item.style.setProperty("display", "none", "important");
      }
    });
  }

  document.body.addEventListener("click", (e) => {
    const switchBtn = e.target.closest(".dept-switch-btn");
    if (switchBtn) {
      const selectedDept = switchBtn.getAttribute("data-dept");
      applyDepartmentState(selectedDept);
    }
  });

  applyDepartmentState("medical");

  // 6. REVIEWS RENDERER
  if (window.clinicConfig && clinicConfig.reviews) {
    const reviewsTarget = document.getElementById("reviews-target");
    if (reviewsTarget) {
      reviewsTarget.innerHTML = clinicConfig.reviews.map(r => {
        const isArabic = /[\u0600-\u06FF]/.test(r.text);
        const textAttr = isArabic ? 'dir="rtl" lang="ar" class="ar-review"' : '';
        return `
          <div class="review-card">
            <div class="star-rating">★★★★★</div>
            <p ${textAttr}>"${r.text}"</p>
            <div class="review-author">- ${r.name}</div>
            <small class="review-dept">${r.department}</small>
          </div>
        `;
      }).join('');
    }
  }

  // 7. BEFORE / AFTER COMPARISON SLIDER
  const baTarget = document.getElementById("before-after-target");
  if (baTarget && window.clinicConfig && clinicConfig.beforeAfterCases) {
    baTarget.innerHTML = clinicConfig.beforeAfterCases.map((item, idx) => `
      <div class="ba-card fade-up visible">
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
      </div>
    `).join('');

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
      setTimeout(updateSlider, 100);
    });
  }

  // 8. MOBILE MENU TOGGLE
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

  attachBookingListeners(document);

  // 9. LOCAL SEO JSON-LD SCHEMA
  if (window.clinicConfig) {
    const schemaMarkup = {
      "@context": "https://schema.org",
      "@type": ["MedicalClinic", "Dentist"],
      "name": clinicConfig.name,
      "image": clinicConfig.siteUrl + "/images/hero.jpg",
      "telephone": clinicConfig.phone,
      "email": clinicConfig.email,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": clinicConfig.address,
        "addressLocality": "Alger",
        "addressCountry": "DZ"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 36.672683,
        "longitude": 2.843024
      },
"openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          "opens": "00:00",
          "closes": "23:59"
        }
      ],
      "url": clinicConfig.siteUrl
    };

    const schemaScript = document.getElementById("schema-json");
    if (schemaScript) schemaScript.text = JSON.stringify(schemaMarkup);
  }
});