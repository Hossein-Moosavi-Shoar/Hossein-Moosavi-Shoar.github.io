// Dual-model 3D background: jet engine (hero) -> compressor wheel (deep background)
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.location.pathname.match(/^\/?$|^\/index\.html?$/)) return;

  function themeColors() {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    return dark
      ? { surface: 0x0e2a30, edge: 0x25d0c4, surfOp: 0.5, edgeOp: 0.8 }
      : { surface: 0xdceafb, edge: 0x3b82f6, surfOp: 0.68, edgeOp: 0.75 };
  }

  function start(THREE, jetGeo, wheelGeo) {
    const canvas = document.createElement("canvas");
    canvas.id = "wireframe-bg";
    canvas.style.cssText =
      "position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:0.85;";
    document.body.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.6, 7.5);

    const col = themeColors();

    function prep(geo, fit) {
      geo.computeBoundingBox();
      const bb = geo.boundingBox;
      const c = new THREE.Vector3(); bb.getCenter(c);
      const size = new THREE.Vector3(); bb.getSize(size);
      const s = fit / Math.max(size.x, size.y, size.z);
      geo.translate(-c.x, -c.y, -c.z);
      geo.scale(s, s, s);
      geo.computeVertexNormals();
      return geo;
    }

    function buildModel(geo, fit) {
      geo = prep(geo, fit);
      const g = new THREE.Group();
      const surfMat = new THREE.MeshLambertMaterial({
        color: col.surface, transparent: true, opacity: col.surfOp,
        side: THREE.DoubleSide, depthWrite: false,
      });
      g.add(new THREE.Mesh(geo, surfMat));
      const edgeMat = new THREE.LineBasicMaterial({
        color: col.edge, transparent: true, opacity: col.edgeOp,
      });
      g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), edgeMat));
      return { group: g, surfMat, edgeMat };
    }

    const jet = buildModel(jetGeo, 3.6);
    const wheel = buildModel(wheelGeo, 2.6);
    scene.add(jet.group);
    scene.add(wheel.group);

    // ---- choreography state ----
    // jet: hero centerpiece; scrolls DOWN away (fast)
    // wheel: starts above/off; descends into place later (slower), then stays as bg
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const key = new THREE.DirectionalLight(0xffffff, 0.6);
    key.position.set(4, 6, 8);
    scene.add(key);

    // orientation
    jet.group.rotation.z = -0.15;
    jet.group.rotation.y = 0.4;
    // wheel: tilt to show the nose/blades
    wheel.group.rotation.x = 1.05;

    let scrollT = 0;
    function updateScroll() {
      scrollT = Math.min(1, window.scrollY / (window.innerHeight * 2.2));
    }
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();

    let mx = 0, my = 0, paused = false;
    window.addEventListener("mousemove", function (e) {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    document.addEventListener("visibilitychange", function () { paused = document.hidden; });
    window.addEventListener("resize", function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const clock = new THREE.Clock();
    let yaw = 0.4;
    function clamp01(x) { return Math.max(0, Math.min(1, x)); }

    function animate() {
      requestAnimationFrame(animate);
      if (paused) return;
      const t = clock.getElapsedTime();

      // --- jet engine: visible in hero (scrollT 0), exits downward by scrollT ~0.45 (fast) ---
      const jetExit = clamp01(scrollT / 0.45);
      const jetEase = jetExit * jetExit;
      jet.group.position.y = -jetEase * 5.5;              // moves DOWN off-screen
      jet.group.position.x = yaw * 0;
      jet.group.visible = jetEase < 0.999;
      jet.group.traverse(function (o) {
        if (o.material) o.material.opacity = (o.material.type === "LineBasicMaterial" ? col.edgeOp : col.surfOp) * (1 - jetEase);
      });
      yaw += 0.0018;
      jet.group.rotation.y = yaw;
      jet.group.position.y += Math.sin(t * 0.4) * 0.08;   // hover bob

      // --- compressor wheel: enters later (scrollT 0.35 -> 1.0), slower, then lingers as bg ---
      const wheelIn = clamp01((scrollT - 0.35) / 0.65);
      const wheelEase = wheelIn * wheelIn * (3 - 2 * wheelIn); // smoothstep
      wheel.group.position.y = 4.5 - wheelEase * 4.7;     // descends from above into place
      wheel.group.position.x = 2.2 * wheelEase;           // settles to the right side
      wheel.group.visible = wheelIn > 0.001;
      wheel.group.traverse(function (o) {
        if (o.material) o.material.opacity = (o.material.type === "LineBasicMaterial" ? col.edgeOp : col.surfOp) * wheelEase * 0.75;
      });
      wheel.group.rotation.z = t * 0.1;                   // slow spin

      // mouse parallax (light)
      camera.position.x = mx * 0.4;
      camera.position.y = 0.6 - my * 0.25;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    animate();

    // theme re-color
    new MutationObserver(function () {
      const c2 = themeColors();
      [jet, wheel].forEach(function (m) {
        m.surfMat.color.setHex(c2.surface);
        m.surfMat.opacity = c2.surfOp;
        m.edgeMat.color.setHex(c2.edge);
        m.edgeMat.opacity = c2.edgeOp;
      });
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
        loader.load("/assets/js/jetengine.stl", function (jetGeo) {
          loader.load("/assets/js/compressorwheel.stl", function (wheelGeo) {
            start(THREE, jetGeo, wheelGeo);
          });
        });
      }
    }, 100);
    setTimeout(function () { clearInterval(check); }, 15000);
  }
  boot();
})();
