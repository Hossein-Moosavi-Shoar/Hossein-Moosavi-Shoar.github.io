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

  // 2c) Animated skill bars on the CV page — values from the CV itself
  const skillItems = document.querySelectorAll(".skill-item");
  if (skillItems.length) {
    const levels = {
      "MATLAB": 75, "EES": 90, "Python": 40, "C / C++": 25,
      "Ansys": 65, "STAR-CCM+": 40, "Aspen-HTRI": 40,
      "COMSOL": 40, "Carrier HAP": 40,
      "SolidWorks": 75, "CATIA": 75, "Inventor": 40, "AutoCAD": 40,
    };
    skillItems.forEach((item) => {
      const label = item.querySelector("strong") ? item.querySelector("strong").textContent : "";
      const key = Object.keys(levels).find((k) => label.toLowerCase().includes(k.toLowerCase()));
      if (key) {
        const bar = document.createElement("div");
        bar.className = "skillbar";
        bar.innerHTML = '<div class="fill" data-level="' + levels[key] + '"></div>';
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

  // 2e) Portrait ring dots + energy flow lines
  const fig = document.querySelector(".profile figure");
  if (fig && !fig.querySelector(".orbit-dot")) {
    // two dots riding the rings
    [[ "6%", "50%" ], [ "94%", "44%" ]].forEach(function (pos) {
      const d = document.createElement("div");
      d.className = "orbit-dot";
      d.style.top = pos[0];
      d.style.left = pos[1];
      fig.appendChild(d);
    });
  }

  // energy flow lines: lightweight 2D canvas, lower-right of hero
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const flow = document.createElement("canvas");
    flow.id = "flow-lines";
    flow.style.cssText = "position:absolute;top:-40px;left:-60px;width:calc(100% + 120px);height:620px;pointer-events:none;z-index:-1;";
    const art = document.querySelector(".about .post article");
    if (art) {
      art.style.position = "relative";
      art.prepend(flow);
      const fx = flow.getContext("2d");
      let fw, fh;
      function sizeFlow() {
        fw = flow.width = flow.offsetWidth;
        fh = flow.height = flow.offsetHeight;
      }
      sizeFlow();
      window.addEventListener("resize", sizeFlow);
      // 8 streamlines: bezier paths with a moving dash-dot pulse
      const lines = Array.from({length: 8}, function (_, i) {
        return { y: 0.25 + i * 0.09, speed: 0.0012 + Math.random() * 0.0018, offset: Math.random() };
      });
      let ft = 0;
      (function drawFlow() {
        requestAnimationFrame(drawFlow);
        if (document.hidden) return;
        ft += 1;
        fx.clearRect(0, 0, fw, fh);
        lines.forEach(function (ln) {
          const y = fh * ln.y;
          const grad = fx.createLinearGradient(0, 0, fw, 0);
          grad.addColorStop(0, "rgba(25,211,197,0)");
          grad.addColorStop(0.5, "rgba(25,211,197,0.14)");
          grad.addColorStop(1, "rgba(59,130,246,0)");
          fx.strokeStyle = grad;
          fx.lineWidth = 1;
          fx.beginPath();
          for (let x = 0; x <= fw; x += 24) {
            const yy = y + Math.sin(x * 0.008 + ln.offset * 6 + ft * 0.004 * ln.speed * 500) * 12;
            x === 0 ? fx.moveTo(x, yy) : fx.lineTo(x, yy);
          }
          fx.stroke();
          // pulse traveling along the line
          const px = ((ft * ln.speed * 60 + ln.offset * fw) % (fw + 120)) - 60;
          const py = y + Math.sin(px * 0.008 + ln.offset * 6 + ft * 0.004 * ln.speed * 500) * 12;
          fx.fillStyle = "rgba(25,211,197,0.5)";
          fx.beginPath();
          fx.arc(px, py, 1.6, 0, Math.PI * 2);
          fx.fill();
        });
      })();
    }
  }

  // 2f) Projects carousel: arrows + dots
  document.querySelectorAll(".carousel").forEach(function (car) {
    const track = car.querySelector(".car-track");
    const prev = car.querySelector(".car-btn.prev");
    const next = car.querySelector(".car-btn.next");
    const dotsBox = car.parentNode.querySelector(".car-dots");
    const slides = track ? Array.from(track.children) : [];
    if (!track || !slides.length) return;

    // build dots
    let dots = [];
    if (dotsBox) {
      slides.forEach(function (_, i) {
        const d = document.createElement("span");
        d.className = "dot" + (i === 0 ? " active" : "");
        d.addEventListener("click", function () {
          track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: "smooth" });
        });
        dotsBox.appendChild(d);
        dots.push(d);
      });
    }

    function slideStep() {
      return slides[0].offsetWidth + 19; // width + gap
    }
    function currentIndex() {
      return Math.min(slides.length - 1, Math.round(track.scrollLeft / slideStep()));
    }
    function updateDots() {
      const idx = currentIndex();
      dots.forEach(function (d, i) { d.classList.toggle("active", i === idx); });
    }
    prev.addEventListener("click", function () {
      track.scrollBy({ left: -slideStep(), behavior: "smooth" });
    });
    next.addEventListener("click", function () {
      track.scrollBy({ left: slideStep(), behavior: "smooth" });
    });
    track.addEventListener("scroll", updateDots, { passive: true });
  });

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
