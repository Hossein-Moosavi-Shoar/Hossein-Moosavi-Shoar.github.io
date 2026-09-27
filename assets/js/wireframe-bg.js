// Compressor wheel 3D background v2
// - real STL surface (semi-transparent) + feature edges (not hollow triangle soup)
// - hero-prominent, recedes into background on scroll
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.location.pathname.match(/^\/?$|^\/index\.html?$/)) return;

  function themeColors() {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    return dark
      ? { surface: 0x0e2a30, edge: 0x25d0c4, surfOp: 0.55, edgeOp: 0.85 }
      : { surface: 0xdceafb, edge: 0x3b82f6, surfOp: 0.72, edgeOp: 0.8 };
  }

  function start(THREE, geo) {
    const canvas = document.createElement("canvas");
    canvas.id = "wireframe-bg";
    canvas.style.cssText =
      "position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:0.8;";
    document.body.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      38, window.innerWidth / window.innerHeight, 0.1, 100
    );
    camera.position.set(0, 0.4, 6);

    // group holds the whole model so we scale/position once
    const group = new THREE.Group();   // tilt + wobble + scroll placement
    const spinner = new THREE.Group(); // spins on the wheel axis (z)
    group.add(spinner);
    scene.add(group);

    const col = themeColors();

    // --- solid surface (semi-transparent, doubleside) ---
    const surfGeo = geo;
    surfGeo.computeVertexNormals();
    // normalize: center + fit
    surfGeo.computeBoundingBox();
    const bb = surfGeo.boundingBox;
    const c = new THREE.Vector3(); bb.getCenter(c);
    const size = new THREE.Vector3(); bb.getSize(size);
    const s = 3.4 / Math.max(size.x, size.y, size.z);
    surfGeo.translate(-c.x, -c.y, -c.z);
    surfGeo.scale(s, s, s);

    const surfMat = new THREE.MeshLambertMaterial({
      color: col.surface,
      transparent: true,
      opacity: col.surfOp,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const surface = new THREE.Mesh(surfGeo, surfMat);
    spinner.add(surface);

    // --- feature edges only (blade contours, hub) — crisp CAD look ---
    const edgeGeo = new THREE.EdgesGeometry(surfGeo, 28); // 28° threshold
    const edgeMat = new THREE.LineBasicMaterial({
      color: col.edge, transparent: true, opacity: col.edgeOp,
    });
    const edges = new THREE.LineSegments(edgeGeo, edgeMat);
    spinner.add(edges);

    // lighting for the shaded surface
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const key = new THREE.DirectionalLight(0xffffff, 0.6);
    key.position.set(4, 6, 8);
    scene.add(key);

    // --- state: hero-prominent, recedes on scroll ---
    let scrollT = 0; // 0 at top, 1 after ~1.5 viewport heights
    function updateScroll() {
      const vh = window.innerHeight;
      scrollT = Math.min(1, window.scrollY / (vh * 1.4));
    }
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();

    // interaction
    let mx = 0, my = 0, paused = false;
    window.addEventListener("mousemove", function (e) {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    document.addEventListener("visibilitychange", function () {
      paused = document.hidden;
    });
    window.addEventListener("resize", function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      if (paused) return;
      const t = clock.getElapsedTime();

      // outer group: tilt the wheel axis toward the viewer + wobble
      group.rotation.x = 1.05;
      group.rotation.y = Math.sin(t * 0.18) * 0.3;
      // inner group: the actual spin on the wheel axis
      spinner.rotation.z = t * 0.12;

      // scroll: fade back + drift up + shrink into a background ornament
      const ease = scrollT * scrollT;
      group.position.x = 2.6 * ease * (mx > 0 ? 1 : 1); // drift right as it recedes
      group.position.y = 1.6 * ease;
      group.scale.setScalar(1 - 0.55 * ease);
      canvas.style.opacity = String(0.8 - 0.45 * ease);

      // mouse parallax on camera
      camera.position.x = mx * 0.5 * (1 - ease * 0.6);
      camera.position.y = 0.4 - my * 0.3 * (1 - ease * 0.6);
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    animate();

    // theme re-color
    new MutationObserver(function () {
      const c2 = themeColors();
      surfMat.color.setHex(c2.surface);
      surfMat.opacity = c2.surfOp;
      edgeMat.color.setHex(c2.edge);
      edgeMat.opacity = c2.edgeOp;
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  function boot() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
      return;
    }
    const check = setInterval(function () {
      if (typeof THREE !== "undefined") {
        clearInterval(check);
        const loader = new THREE.STLLoader();
        loader.load("/assets/js/compressorwheel.stl", function (geo) {
          start(THREE, geo);
        });
      }
    }, 100);
    setTimeout(function () { clearInterval(check); }, 12000);
  }
  boot();
})();
