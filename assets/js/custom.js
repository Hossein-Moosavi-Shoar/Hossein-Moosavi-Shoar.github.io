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
});
