document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const more = document.querySelector("[data-more]");
  const moreToggle = document.querySelector("[data-more-toggle]");
  const scrollTop = document.querySelector("[data-scroll-top]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const closeMobileMenu = () => {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    body.classList.remove("menu-open");
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const open = mobileMenu.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
      body.classList.toggle("menu-open", open);
    });
    mobileMenu.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMobileMenu));
  }

  if (more && moreToggle) {
    moreToggle.addEventListener("click", () => {
      const open = more.classList.toggle("open");
      moreToggle.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", e => {
      if (!more.contains(e.target)) {
        more.classList.remove("open");
        moreToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeMobileMenu();
      if (more) more.classList.remove("open");
      if (moreToggle) moreToggle.setAttribute("aria-expanded", "false");
    }
  });

  const current = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll("[data-nav-link]").forEach(link => {
    const href = (link.getAttribute("href") || "").split("/").pop().toLowerCase();
    if (href === current || (current === "" && href === "index.html")) link.classList.add("active");
  });

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(el => observer.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add("reveal-visible"));
  }

  const onScroll = () => {
    if (scrollTop) scrollTop.classList.toggle("visible", window.scrollY > 400);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (scrollTop) {
    scrollTop.addEventListener("click", () => window.scrollTo({top: 0, behavior: reduceMotion ? "auto" : "smooth"}));
  }

  document.querySelectorAll("[data-filter-group]").forEach(group => {
    const buttons = group.querySelectorAll("[data-filter]");
    const targetSelector = group.dataset.filterTarget;
    const items = document.querySelectorAll(targetSelector);
    buttons.forEach(button => {
      button.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        button.classList.add("active");
        const value = button.dataset.filter;
        items.forEach(item => {
          item.classList.toggle("hidden", value !== "all" && item.dataset.category !== value);
        });
      });
    });
  });

  document.querySelectorAll("[data-abstract-toggle]").forEach(button => {
    button.addEventListener("click", () => {
      const publication = button.closest(".publication");
      const expanded = publication.classList.toggle("expanded");
      button.setAttribute("aria-expanded", String(expanded));
      button.textContent = expanded ? "HIDE ABSTRACT ↑" : "READ ABSTRACT ↓";
    });
  });

  const roleElement = document.querySelector("[data-role]");
  if (roleElement) {
    const roles = ["Student", "Professional", "Designer", "Researcher", "Creator"]; // ADD YOUR ROLES HERE
    let roleIndex = 0, charIndex = 0, deleting = false;
    const type = () => {
      if (reduceMotion) { roleElement.textContent = roles[0]; return; }
      const role = roles[roleIndex];
      roleElement.textContent = role.slice(0, charIndex);
      if (!deleting && charIndex < role.length) charIndex++;
      else if (!deleting && charIndex === role.length) deleting = true;
      else if (deleting && charIndex > 0) charIndex--;
      else { deleting = false; roleIndex = (roleIndex + 1) % roles.length; }
      setTimeout(type, deleting ? 55 : charIndex === role.length ? 1200 : 85);
    };
    type();
  }

  const form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", async e => {
      const endpoint = form.getAttribute("action") || "";
      const status = form.querySelector("[data-form-status]");
      if (!endpoint || endpoint.includes("ADD_YOUR_FORMSPREE_ENDPOINT")) {
        e.preventDefault();
        status.className = "form-status error";
        status.textContent = "Add your Formspree endpoint to enable message submission.";
        return;
      }
      e.preventDefault();
      status.className = "form-status";
      status.textContent = "Sending…";
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: new FormData(form),
          headers: { "Accept": "application/json" }
        });
        if (!response.ok) throw new Error("Request failed");
        form.reset();
        status.className = "form-status success";
        status.textContent = "Message sent successfully.";
      } catch {
        status.className = "form-status error";
        status.textContent = "Something went wrong. Please try again.";
      }
    });
  }
});
