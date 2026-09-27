// Jet engine 3D background v3 — turntable jet engine, hero-prominent, static on scroll
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.location.pathname.match(/^\/?$|^\/index\.html?$/)) return;

  function themeColors() {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    return dark
      ? { surface: 0x0e2a30, edge: 0x25d0c4, surfOp: 0.5, edgeOp: 0.8 }
      : { surface: 0xdceafb, edge: 0x3b82f6, surfOp: 0.68, edgeOp: 0.75 };
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
      40, window.innerWidth / window.innerHeight, 0.1, 100
    );
    camera.position.set(0, 0.6, 7.5);

    const group = new THREE.Group();
    scene.add(group);

    const col = themeColors();

    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    const c = new THREE.Vector3(); bb.getCenter(c);
    const size = new THREE.Vector3(); bb.getSize(size);
    const s = 3.6 / Math.max(size.x, size.y, size.z);
    geo.translate(-c.x, -c.y, -c.z);
    geo.scale(s, s, s);
    geo.computeVertexNormals();

    const surfMat = new THREE.MeshLambertMaterial({
      color: col.surface, transparent: true, opacity: col.surfOp,
      side: THREE.DoubleSide, depthWrite: false,
    });
    const surface = new THREE.Mesh(geo, surfMat);
    group.add(surface);

    const edgeGeo = new THREE.EdgesGeometry(geo, 30);
    const edgeMat = new THREE.LineBasicMaterial({
      color: col.edge, transparent: true, opacity: col.edgeOp,
    });
    const edges = new THREE.LineSegments(edgeGeo, edgeMat);
    group.add(edges);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const key = new THREE.DirectionalLight(0xffffff, 0.6);
    key.position.set(4, 6, 8);
    scene.add(key);

    // engine lies along X: tilt slightly for a dynamic 3/4 view
    group.rotation.z = -0.15;   // nose slightly up
    group.rotation.y = 0.4;     // angled toward viewer

    // turntable rotation + mouse parallax only (NO scroll behavior)
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
    let yaw = 0.4;
    function animate() {
      requestAnimationFrame(animate);
      if (paused) return;
      const t = clock.getElapsedTime();
      yaw += 0.0018;                       // slow turntable
      group.rotation.y = yaw;
      group.position.y = Math.sin(t * 0.4) * 0.08; // gentle hover
      camera.position.x = mx * 0.4;
      camera.position.y = 0.6 - my * 0.25;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    animate();

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
        new THREE.STLLoader().load("/assets/js/jetengine.stl", function (geo) {
          start(THREE, geo);
        });
      }
    }, 100);
    setTimeout(function () { clearInterval(check); }, 12000);
  }
  boot();
})();
