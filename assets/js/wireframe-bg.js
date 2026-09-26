// Wireframe background (three.js) — light adaptation of thebenezer/threejs-wireframe
// A slow-rotating wireframe torus knot + icosahedron behind the homepage hero.
(function () {
  // Only on homepage, and skip for reduced-motion users
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.location.pathname.match(/^\/?$|^\/index\.html?$/)) return;

  function themeColors() {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    return dark
      ? { wire: 0x25d0c4, wire2: 0xff9b52, opacity: 0.22 }
      : { wire: 0x3b82f6, wire2: 0x8b5cf6, opacity: 0.16 };
  }

  function init() {
    if (typeof THREE === "undefined") return;
    const canvas = document.createElement("canvas");
    canvas.id = "wireframe-bg";
    canvas.style.cssText =
      "position:fixed;inset:0;width:100%;height:100%;z-index:-3;pointer-events:none;";
    document.body.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50, window.innerWidth / window.innerHeight, 0.1, 100
    );
    camera.position.set(0, 0, 7);

    const col = themeColors();

    // Torus knot — the hero shape
    const knotGeo = new THREE.TorusKnotGeometry(1.6, 0.5, 140, 20);
    const knot = new THREE.LineSegments(
      new THREE.WireframeGeometry(knotGeo),
      new THREE.LineBasicMaterial({ color: col.wire, transparent: true, opacity: col.opacity })
    );
    knot.position.set(2.2, 0.2, -1);
    scene.add(knot);

    // Icosahedron — secondary shape
    const icoGeo = new THREE.IcosahedronGeometry(1.2, 1);
    const ico = new THREE.LineSegments(
      new THREE.WireframeGeometry(icoGeo),
      new THREE.LineBasicMaterial({ color: col.wire2, transparent: true, opacity: col.opacity * 0.9 })
    );
    ico.position.set(-2.6, -0.6, -2);
    scene.add(ico);

    // parallax on mouse
    let mx = 0, my = 0;
    window.addEventListener("mousemove", function (e) {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    let running = true;
    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
    });

    window.addEventListener("resize", function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      if (!running) return;
      const t = clock.getElapsedTime();
      knot.rotation.x = t * 0.12;
      knot.rotation.y = t * 0.18;
      ico.rotation.x = -t * 0.1;
      ico.rotation.y = -t * 0.15;
      camera.position.x = mx * 0.6;
      camera.position.y = -my * 0.4;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    animate();

    // re-color on theme toggle
    new MutationObserver(function () {
      const c = themeColors();
      knot.material.color.setHex(c.wire);
      ico.material.color.setHex(c.wire2);
      knot.material.opacity = c.opacity;
      ico.material.opacity = c.opacity * 0.9;
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      // wait for three.js to be available (loaded via importmap module)
      const check = setInterval(function () {
        if (typeof THREE !== "undefined") { clearInterval(check); init(); }
      }, 100);
      setTimeout(function () { clearInterval(check); }, 8000);
    });
  } else {
    init();
  }
})();
