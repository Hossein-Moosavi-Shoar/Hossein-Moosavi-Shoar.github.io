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
