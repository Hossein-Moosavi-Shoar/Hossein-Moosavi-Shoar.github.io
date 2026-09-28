// 3D background: compressor wheel + accent hexagon
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.location.pathname.match(/^\/?$|^\/index\.html?$/)) return;

  function themeColors() {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    return dark
      ? { surface: 0x0e2a30, edge: 0x25d0c4, surfOp: 0.5, edgeOp: 0.8 }
      : { surface: 0xdceafb, edge: 0x3b82f6, surfOp: 0.68, edgeOp: 0.75 };
  }

  function start(THREE, wheelGeo) {
    const canvas = document.createElement("canvas");
    canvas.id = "wireframe-bg";
    canvas.style.cssText =
      "position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:0.45;";
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

    // ---- compressor wheel (hero centerpiece) ----
    wheelGeo = prep(wheelGeo, 3.2);
    const wheelGroup = new THREE.Group();
    const spinner = new THREE.Group();
    wheelGroup.add(spinner);
    const surfMat = new THREE.MeshLambertMaterial({
      color: col.surface, transparent: true, opacity: col.surfOp,
      side: THREE.DoubleSide, depthWrite: false,
    });
    spinner.add(new THREE.Mesh(wheelGeo, surfMat));
    const edgeMat = new THREE.LineBasicMaterial({
      color: col.edge, transparent: true, opacity: col.edgeOp,
    });
    spinner.add(new THREE.LineSegments(new THREE.EdgesGeometry(wheelGeo, 28), edgeMat));
    wheelGroup.rotation.x = 1.05; // show nose + blades
    wheelGroup.position.set(2.4, -0.4, -1); // lower-right, out of the text column
    scene.add(wheelGroup);


    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const key = new THREE.DirectionalLight(0xffffff, 0.6);
    key.position.set(4, 6, 8);
    scene.add(key);

    // motion: wheel spins on axis; hexagon tumbles slowly; mouse parallax
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
    function animate() {
      requestAnimationFrame(animate);
      if (paused) return;
      const t = clock.getElapsedTime();
      spinner.rotation.z = t * 0.12;                       // wheel spin
      wheelGroup.position.y = Math.sin(t * 0.4) * 0.06;
      camera.position.x = mx * 0.4;
      camera.position.y = 0.6 - my * 0.25;
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
        new THREE.STLLoader().load("/assets/js/compressorwheel.stl", function (geo) {
          start(THREE, geo);
        });
      }
    }, 100);
    setTimeout(function () { clearInterval(check); }, 12000);
  }
  boot();
})();
