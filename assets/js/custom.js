/* Custom interactivity for Hossein's site */

// 1) Fade-in sections as they scroll into view
document.addEventListener("DOMContentLoaded", function () {
  const targets = document.querySelectorAll(
    ".post article > div, .publications li, .news li, .card"
  );
  targets.forEach((el) => el.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  // 2) Publication filter buttons (journal / conference / all)
  const pubList = document.querySelector(".publications ul, ul.bibliography");
  if (pubList) {
    const items = Array.from(pubList.children);

    const bar = document.createElement("div");
    bar.className = "pub-filter btn-group mb-3";
    bar.innerHTML =
      '<button class="btn btn-outline-primary btn-sm active" data-filter="all">All</button>' +
      '<button class="btn btn-outline-primary btn-sm" data-filter="journal">Journal</button>' +
      '<button class="btn btn-outline-primary btn-sm" data-filter="conference">Conference</button>';
    pubList.parentNode.insertBefore(bar, pubList);

    bar.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      bar.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.filter;
      items.forEach((li) => {
        const text = li.textContent.toLowerCase();
        const show =
          f === "all" ||
          (f === "journal" && text.includes("journal") && !text.includes("conference")) ||
          (f === "conference" && text.includes("conference") && !text.includes("in progress"));
        li.style.display = show ? "" : "none";
      });
    });
  }

  // 2b) Floating emoji badges on the profile photo
  const profBlock = document.querySelector(".profile");
  if (profBlock && !profBlock.querySelector(".float-badge")) {
    const b1 = document.createElement("div");
    b1.className = "float-badge badge-1";
    b1.textContent = "🔥"; // thermal engineering
    const b2 = document.createElement("div");
    b2.className = "float-badge badge-2";
    b2.textContent = "⚙️";
    profBlock.appendChild(b1);
    profBlock.appendChild(b2);
  }

  // 2c) Animated skill bars on the CV page (.skill-item divs)
  const skillItems = document.querySelectorAll(".skill-item");
  if (skillItems.length) {
    skillItems.forEach((item) => {
      const text = item.textContent.toLowerCase();
      let level = null;
      if (text.includes("programming")) level = 88;        // MATLAB/EES strong
      else if (text.includes("cfd")) level = 80;           // Fluent etc.
      else if (text.includes("cad")) level = 78;           // SolidWorks/CATIA
      else if (text.includes("hands-on")) level = 70;      // welding etc.
      if (level) {
        const bar = document.createElement("div");
        bar.className = "skillbar";
        bar.innerHTML = '<div class="fill" data-level="' + level + '"></div>';
        item.appendChild(bar);
      }
    });
    const barObs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.querySelectorAll(".fill").forEach((f) => {
            f.style.width = f.dataset.level + "%";
          });
          barObs.unobserve(en.target);
        }
      });
    }, { threshold: 0.2 });
    skillItems.forEach((el) => barObs.observe(el));
  }

  // 2d) Animate skill bars on homepage skills-grid too
  const homeBars = document.querySelectorAll(".skills-grid .fill, .skill-card .fill");
  if (homeBars.length) {
    const hbObs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.style.width = en.target.dataset.level + "%";
          hbObs.unobserve(en.target);
        }
      });
    }, { threshold: 0.3 });
    homeBars.forEach((el) => hbObs.observe(el));
  }

  // 3) Rotating profile photo: alternate formal headshot <-> candid photo
  const profileImg = document.querySelector(".profile img");
  if (profileImg && profileImg.src) {
    const altSrc = "/assets/img/prof_pic_alt.jpg"; // candid lakeside photo
    const baseSrc = profileImg.currentSrc || profileImg.src;
    // only rotate on the homepage (about layout)
    if (document.querySelector(".profile")) {
      // preload alt image
      const pre = new Image();
      pre.src = altSrc;
      pre.onload = function () {
        // wrap in a positioned container if not already
        // use the figure as the positioning context (img may live inside <picture>)
        let wrapper = profileImg.closest("figure") || profileImg.parentElement;
        if (getComputedStyle(wrapper).position === "static") {
          wrapper.style.position = "relative";
        }
        // create the overlay img (candid), stacked exactly on top
        const overlay = profileImg.cloneNode();
        overlay.src = altSrc;
        overlay.srcset = "";
        overlay.sizes = "";
        overlay.style.cssText =
          "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 1.2s ease;border-radius:inherit;";
        // match the base image's border-radius (circular)
        const br = getComputedStyle(profileImg).borderRadius;
        overlay.style.borderRadius = br;
        wrapper.appendChild(overlay);
        let showingAlt = false;
        setInterval(function () {
          showingAlt = !showingAlt;
          overlay.style.opacity = showingAlt ? 1 : 0;
        }, 6000); // swap every 6 seconds
      };
    }
  }
});
