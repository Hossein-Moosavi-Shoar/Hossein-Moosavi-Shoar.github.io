// Wireframe background — compressor wheel (real CAD model, STL-derived wireframe)
// Original model: Compressorwheel.STL (turbocharger impeller), decimated to 10k verts / 26k edges.
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.location.pathname.match(/^\/?$|^\/index\.html?$/)) return;

  function themeColors() {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    return dark
      ? { wire: 0x25d0c4, opacity: 0.34 }
      : { wire: 0x3b82f6, opacity: 0.30 };
  }

  function start(THREE, data) {
    const canvas = document.createElement("canvas");
    canvas.id = "wireframe-bg";
    canvas.style.cssText =
      "position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:0.55;";
    document.body.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40, window.innerWidth / window.innerHeight, 0.1, 100
    );
    camera.position.set(0, 0, 5.2);

    const col = themeColors();

    // build LineSegments from the STL-derived wireframe
    const positions = new Float32Array(data.e.length * 6);
    for (let i = 0; i < data.e.length; i++) {
      const a = data.v[data.e[i][0]], b = data.v[data.e[i][1]];
      positions.set([a[0], a[1], a[2], b[0], b[1], b[2]], i * 6);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.LineBasicMaterial({ color: col.wire, transparent: true, opacity: col.opacity });
    const wheel = new THREE.LineSegments(geo, mat);
    wheel.scale.setScalar(3.1);
    wheel.rotation.x = 0.5; // tilt to show the blade curvature
    scene.add(wheel);

    // slow spin around the wheel's own axis + gentle wobble
    let mx = 0, my = 0;
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

    let paused = false;
    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      if (paused) return;
      const t = clock.getElapsedTime();
      wheel.rotation.z = t * 0.1;          // slow spin like a real compressor wheel
      wheel.rotation.x = 0.5 + Math.sin(t * 0.25) * 0.15;
      wheel.rotation.y = Math.cos(t * 0.2) * 0.25;
      camera.position.x = mx * 0.5;
      camera.position.y = -my * 0.35;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    animate();

    // re-color on theme toggle
    new MutationObserver(function () {
      const c = themeColors();
      mat.color.setHex(c.wire);
      mat.opacity = c.opacity;
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
        fetch("/assets/js/compressorwheel.json")
          .then(function (r) { return r.json(); })
          .then(function (data) { start(THREE, data); })
          .catch(function () {});
      }
    }, 100);
    setTimeout(function () { clearInterval(check); }, 10000);
  }
  boot();
})();
