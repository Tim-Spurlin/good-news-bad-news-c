<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { invoke } from '@tauri-apps/api/core';

  // State
  let container: HTMLDivElement;
  let activeArticle: any = null;
  let showModal = false;
  let isBatteryLowMode = false;

  // Three.js variables
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let controls: OrbitControls;
  let animationFrameId: number;
  let earthMesh: THREE.Mesh;
  let cloudMesh: THREE.Mesh;
  let pinsInstancedMesh: THREE.InstancedMesh;
  let raycaster = new THREE.Raycaster();
  let mouse = new THREE.Vector2();

  // Labels map data
  let countryLabels = [
    // Continents
    { name: 'North America', lat: 45, lon: -100 },
    { name: 'South America', lat: -15, lon: -60 },
    { name: 'Europe', lat: 50, lon: 10 },
    { name: 'Africa', lat: 0, lon: 20 },
    { name: 'Asia', lat: 45, lon: 90 },
    { name: 'Australia', lat: -25, lon: 135 },

    // Middle East
    { name: 'Saudi Arabia', lat: 23.8859, lon: 45.0792 },
    { name: 'Iran', lat: 32.4279, lon: 53.6880 },
    { name: 'Turkey', lat: 38.9637, lon: 35.2433 },
    { name: 'Egypt', lat: 26.8206, lon: 30.8025 },
    { name: 'Israel', lat: 31.0461, lon: 34.8516 },
    { name: 'Iraq', lat: 33.2232, lon: 43.6793 },
    { name: 'UAE', lat: 23.4241, lon: 53.8478 },
    { name: 'Syria', lat: 34.8021, lon: 38.9968 },
    { name: 'Jordan', lat: 30.5852, lon: 36.2384 },
    { name: 'Yemen', lat: 15.5527, lon: 48.5164 },

    // North America
    { name: 'USA', lat: 38, lon: -97 },
    { name: 'Canada', lat: 56, lon: -106 },
    { name: 'Mexico', lat: 23.6345, lon: -102.5528 },
    { name: 'Cuba', lat: 21.5218, lon: -77.7812 },

    // South America
    { name: 'Brazil', lat: -10, lon: -51 },
    { name: 'Argentina', lat: -38.4161, lon: -63.6167 },
    { name: 'Colombia', lat: 4.5709, lon: -74.2973 },
    { name: 'Peru', lat: -9.19, lon: -75.0152 },
    { name: 'Chile', lat: -35.6751, lon: -71.5430 },
    { name: 'Venezuela', lat: 6.4238, lon: -66.5897 },

    // Europe
    { name: 'UK', lat: 54, lon: -2 },
    { name: 'France', lat: 46.2276, lon: 2.2137 },
    { name: 'Germany', lat: 51.1657, lon: 10.4515 },
    { name: 'Italy', lat: 41.8719, lon: 12.5674 },
    { name: 'Spain', lat: 40.4637, lon: -3.7492 },
    { name: 'Ukraine', lat: 48.3794, lon: 31.1656 },
    { name: 'Poland', lat: 51.9194, lon: 19.1451 },
    { name: 'Sweden', lat: 60.1282, lon: 18.6435 },
    { name: 'Norway', lat: 60.4720, lon: 8.4689 },
    { name: 'Greece', lat: 39.0742, lon: 21.8243 },

    // Africa
    { name: 'South Africa', lat: -30.5595, lon: 22.9375 },
    { name: 'Nigeria', lat: 9.0820, lon: 8.6753 },
    { name: 'Kenya', lat: -0.0236, lon: 37.9062 },
    { name: 'Ethiopia', lat: 9.1450, lon: 40.4897 },
    { name: 'Algeria', lat: 28.0339, lon: 1.6596 },
    { name: 'Morocco', lat: 31.7917, lon: -7.0926 },
    { name: 'DRC', lat: -4.0383, lon: 21.7587 },
    { name: 'Sudan', lat: 12.8628, lon: 30.2176 },

    // Asia
    { name: 'Russia', lat: 60, lon: 100 },
    { name: 'China', lat: 35, lon: 104 },
    { name: 'India', lat: 20, lon: 77 },
    { name: 'Japan', lat: 36.2048, lon: 138.2529 },
    { name: 'Indonesia', lat: -0.7893, lon: 113.9213 },
    { name: 'Pakistan', lat: 30.3753, lon: 69.3451 },
    { name: 'South Korea', lat: 35.9078, lon: 127.7669 },
    { name: 'Vietnam', lat: 14.0583, lon: 108.2772 },
    { name: 'Philippines', lat: 12.8797, lon: 121.7740 },
    { name: 'Thailand', lat: 15.8700, lon: 100.9925 },
    { name: 'Afghanistan', lat: 33.9391, lon: 67.7100 },
    { name: 'Kazakhstan', lat: 48.0196, lon: 66.9237 },

    // Oceania
    { name: 'New Zealand', lat: -40.9006, lon: 174.8860 },
    { name: 'PNG', lat: -6.3150, lon: 143.9555 }
  ];
  let renderedLabels: any[] = [];

  // News data
  let newsData: any[] = [];
  const PROXY_URL = 'http://localhost:8000';
  const API_TOKEN = 'sk-lm-48IXAjXt:SpEuhK6SYL8sSI0YKiVb';

  async function checkBatteryStatus() {
    try {
      // Custom Tauri command to check battery status
      isBatteryLowMode = await invoke('check_battery_status');
    } catch (e) {
      console.warn("Could not check battery status via Tauri:", e);
      // Fallback to web API if available
      if ('getBattery' in navigator) {
        const battery: any = await (navigator as any).getBattery();
        isBatteryLowMode = !battery.charging && battery.level < 0.3;
      }
    }
  }

  let apiLimitReached = false;
  let isFetching = false;
  let timeUntilNextCall = 0; // seconds
  let countdownInterval: any = null;

  function startCountdown(seconds: number) {
    timeUntilNextCall = seconds;
    apiLimitReached = true;
    if (countdownInterval) clearInterval(countdownInterval);
    
    countdownInterval = setInterval(() => {
      timeUntilNextCall -= 1;
      if (timeUntilNextCall <= 0) {
        clearInterval(countdownInterval);
        apiLimitReached = false;
      }
    }, 1000);
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  async function fetchNewsData() {
    if (isFetching) return;
    isFetching = true;
    
    try {
      // 1. SAFETY MECHANISM: Check with Rust backend if we have API calls left today
      // Returns 0 if allowed, std::u64::MAX if hard limit reached, or wait_time in seconds
      const waitTime: number = await invoke('check_and_increment_api_usage');
      
      if (waitTime > 0 && waitTime < 999999) {
        console.warn(`World News API Rate Limit sliding window active. Try again in ${waitTime}s.`);
        startCountdown(waitTime);
        loadMockData();
        return;
      } else if (waitTime >= 999999) {
        console.warn("World News API Free Tier Limit Exceeded (50/day). Hard limit reached.");
        apiLimitReached = true;
        timeUntilNextCall = -1; // Specific flag for hard limit
        loadMockData();
        return;
      }

      // 2. HIGH QUALITY SPREAD: Since we are limited to 50 calls/day, we do not spam small requests.
      // We request a dense, high-quality batch of 50 comprehensive articles in a single call.
      const res = await fetch(`${PROXY_URL}/get-news-by-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`
        },
        body: JSON.stringify({ 
          batch_size: 50, // Maximize the value of this single API point
          comprehensive_analysis: true 
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.articles && data.articles.length > 0) {
          newsData = data.articles;
          createPins();
        } else {
          loadMockData();
        }
      } else {
        console.warn("Proxy returned error, falling back to mock data.");
        loadMockData();
      }
    } catch (err) {
      console.error('Error fetching real news, falling back to Mock:', err);
      loadMockData();
    } finally {
      isFetching = false;
    }
  }

  function loadMockData() {
    newsData = [
      { id: 1, title: 'Breakthrough in Fusion Energy', lat: 48.8566, lon: 2.3522, good: true, score: 0.95, summary: 'Scientists have achieved net-positive fusion.' },
      { id: 2, title: 'Storm Causes Major Outages', lat: 25.7617, lon: -80.1918, good: false, score: 0.88, summary: 'Grid failures reported across the coast.' },
      { id: 3, title: 'New KDE Plasma 6 Release', lat: 52.5200, lon: 13.4050, good: true, score: 1.0, summary: 'Wayland native features and Breeze theme enhancements.' },
      { id: 4, title: 'Market Crash in Tech Sector', lat: 37.7749, lon: -122.4194, good: false, score: 0.92, summary: 'Stocks tumble after regulatory news.' },
    ];
    createPins();
  }

  function latLongToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
    return new THREE.Vector3(x, y, z);
  }

  function createPins() {
    if (!scene) return;
    if (pinsInstancedMesh) scene.remove(pinsInstancedMesh);

    const pinGeometry = new THREE.CylinderGeometry(0.1, 0.02, 0.5, 8);
    pinGeometry.translate(0, 0.25, 0); // shift origin to base
    pinGeometry.rotateX(Math.PI / 2); // align along Z

    const pinMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    pinsInstancedMesh = new THREE.InstancedMesh(pinGeometry, pinMaterial, newsData.length);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    newsData.forEach((item, i) => {
      const pos = latLongToVector3(item.lat, item.lon, 5.05); // slightly above earth/clouds
      
      dummy.position.copy(pos);
      // Orient pin normal to the sphere surface
      dummy.lookAt(new THREE.Vector3(0, 0, 0));
      // Scale by relevance score
      const scale = 0.5 + (item.score * 0.5);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();

      pinsInstancedMesh.setMatrixAt(i, dummy.matrix);

      // Color: Green gradient for Good, Red gradient for Bad
      if (item.good) {
        color.setHSL(0.33, 1.0, 0.3 + (item.score * 0.3)); // Green
      } else {
        color.setHSL(0.0, 1.0, 0.3 + (item.score * 0.3)); // Red
      }
      pinsInstancedMesh.setColorAt(i, color);
    });

    pinsInstancedMesh.instanceMatrix.needsUpdate = true;
    if (pinsInstancedMesh.instanceColor) {
      pinsInstancedMesh.instanceColor.needsUpdate = true;
    }
    
    // Add user data for raycasting association
    pinsInstancedMesh.userData.news = newsData;

    scene.add(pinsInstancedMesh);
  }

  function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1d26); // Midnight black / cyber theme

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 15;

    // Fast GPU-accelerated renderer suitable for KDE Plasma Wayland
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 6;
    controls.maxDistance = 20;

    // High-poly Earth Textures (Satellite View)
    const textureLoader = new THREE.TextureLoader();
    const earthMap = textureLoader.load('/earth_atmos_2048.jpg');
    const specularMap = textureLoader.load('/earth_specular_2048.jpg');
    const normalMap = textureLoader.load('/earth_normal_2048.jpg');
    const cloudsMap = textureLoader.load('/earth_clouds_1024.png');

    const earthGeo = new THREE.SphereGeometry(5, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthMap,
      specularMap: specularMap,
      normalMap: normalMap,
      specular: new THREE.Color(0x333333),
      shininess: 15
    });
    earthMesh = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earthMesh);

    // Clouds
    const cloudGeo = new THREE.SphereGeometry(5.01, 64, 64);
    const cloudMat = new THREE.MeshPhongMaterial({
      map: cloudsMap,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    scene.add(cloudMesh);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onClick);
    document.addEventListener('visibilitychange', onVisibilityChange);
  }

  function onWindowResize() {
    if (!container || !camera || !renderer) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  function onClick(event: MouseEvent) {
    if (!renderer) return;
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(pinsInstancedMesh);

    if (intersects.length > 0) {
      const instanceId = intersects[0].instanceId;
      if (instanceId !== undefined) {
        activeArticle = newsData[instanceId];
        showModal = true;
      }
    }
  }

  let lastTime = 0;
  function animate(time: number) {
    animationFrameId = requestAnimationFrame(animate);

    // Battery optimization: limit FPS
    if (isBatteryLowMode) {
      if (time - lastTime < 33) return; // ~30fps cap
    }

    lastTime = time;

    controls.update();
    
    // Slow rotation
    if (earthMesh && !showModal) {
      earthMesh.rotation.y += 0.001;
      if (cloudMesh) {
         cloudMesh.rotation.y += 0.0012; // clouds move slightly faster
      }
      if (pinsInstancedMesh) {
         pinsInstancedMesh.rotation.y += 0.001;
      }
    }

    // Update continent/country labels 3D to 2D screen projection
    if (camera && container && earthMesh) {
      const w = container.clientWidth;
      const h = container.clientHeight;
      const camPos = camera.position.clone();
      const vector = new THREE.Vector3();
      const updatedLabels = [];
      
      for (const lbl of countryLabels) {
        // Build raw 3D position
        const pos3D = latLongToVector3(lbl.lat, lbl.lon, 5.05);
        // Apply globe rotation mapping
        pos3D.applyEuler(earthMesh.rotation);
        
        // Dot product occlusion calculation
        const normal = pos3D.clone().normalize();
        const toCamera = camPos.clone().sub(pos3D).normalize();
        
        // Threshold > 0.1 means it's visibly on the near side
        if (toCamera.dot(normal) > 0.1) {
          vector.copy(pos3D).project(camera);
          updatedLabels.push({
            name: lbl.name,
            x: (vector.x * .5 + .5) * w,
            y: (-(vector.y * .5) + .5) * h
          });
        }
      }
      renderedLabels = updatedLabels;
    }

    renderer.render(scene, camera);
  }

  function onVisibilityChange() {
    if (document.hidden) {
      cancelAnimationFrame(animationFrameId);
    } else {
      lastTime = performance.now();
      animate(lastTime);
    }
  }

  async function handleReassign(good: boolean) {
    if (!activeArticle) return;
    try {
      const res = await fetch(`${PROXY_URL}/update-survival-prototype`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`
        },
        body: JSON.stringify({
          article_id: activeArticle.id,
          reassigned_label: good ? 'good' : 'bad'
        })
      });
      if (res.ok) {
        activeArticle.good = good;
        createPins(); // Update colors
        showModal = false;
        alert('Reassigned successfully.');
      }
    } catch (e) {
      console.error('Failed to reassign:', e);
      alert('Proxy error. See console.');
    }
  }

  async function loadBorders() {
    try {
      const res = await fetch('/countries.geojson');
      const data = await res.json();
      const material = new THREE.LineBasicMaterial({ color: 0x6DD4F2, transparent: true, opacity: 0.15 });
      
      const renderRing = (ring: any[]) => {
        const points: THREE.Vector3[] = [];
        ring.forEach(coord => {
          points.push(latLongToVector3(coord[1], coord[0], 5.001));
        });
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        if (earthMesh) earthMesh.add(line);
      };

      data.features.forEach((feature: any) => {
        if (!feature.geometry) return;
        const coords = feature.geometry.coordinates;
        const type = feature.geometry.type;
        
        if (type === 'Polygon') {
          coords.forEach(renderRing);
        } else if (type === 'MultiPolygon') {
          coords.forEach((poly: any) => poly.forEach(renderRing));
        }
      });
    } catch (e) {
      console.warn("Failed to load political borders:", e);
    }
  }

  onMount(async () => {
    await checkBatteryStatus();
    initThree();
    loadBorders();
    await fetchNewsData();
    animate(performance.now());
  });

  onDestroy(() => {
    window.removeEventListener('resize', onWindowResize);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (renderer) {
      renderer.domElement.removeEventListener('click', onClick);
      renderer.dispose();
    }
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  });
</script>

<div class="globe-container">
  <div bind:this={container} class="canvas-wrapper"></div>
  
  {#if isBatteryLowMode}
    <div class="battery-indicator">🔋 Energy Saving Mode (30 FPS)</div>
  {/if}

  {#if apiLimitReached}
    <div class="api-limit-indicator">
      {#if timeUntilNextCall === -1}
        🛑 Daily World News API Limit Reached (50/50)
      {:else}
        ⏳ Waiting for next API batch: {formatTime(timeUntilNextCall)}
      {/if}
    </div>
  {/if}

  {#each renderedLabels as lbl}
    <div class="map-label" style="left: {lbl.x}px; top: {lbl.y}px;">
      {lbl.name}
    </div>
  {/each}

  {#if showModal && activeArticle}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-backdrop" on:click={() => showModal = false}>
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="modal-content" on:click|stopPropagation>
        <h2>{activeArticle.title}</h2>
        <div class="meta">
          <span class="label {activeArticle.good ? 'good' : 'bad'}">
            {activeArticle.good ? 'Good News' : 'Bad News'}
          </span>
          <span class="score">Confidence: {Math.round(activeArticle.score * 100)}%</span>
        </div>
        <p>{activeArticle.summary}</p>
        
        <div class="actions">
          <h3>Reassign Classification</h3>
          <button class="btn btn-good" on:click={() => handleReassign(true)}>Mark Good</button>
          <button class="btn btn-bad" on:click={() => handleReassign(false)}>Mark Bad</button>
        </div>
        <button class="close-btn" on:click={() => showModal = false}>Close</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .globe-container {
    position: relative;
    width: 100%;
    height: 100vh;
    background: #1a1d26; /* Midnight Black */
    overflow: hidden;
  }
  .canvas-wrapper {
    width: 100%;
    height: 100%;
  }
  .battery-indicator {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(40, 45, 58, 0.8); /* Charcoal Steel */
    color: #6DD4F2; /* Electric Cyan */
    padding: 8px 12px;
    border-radius: 4px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    border: 1px solid #6DD4F2;
    pointer-events: none;
  }
  .api-limit-indicator {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(26, 29, 38, 0.9); /* Midnight Black */
    color: #ffaa00; /* Warning Orange */
    padding: 10px 16px;
    border-radius: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    border: 1px solid #ffaa00;
    box-shadow: 0 0 10px rgba(255, 170, 0, 0.3);
    pointer-events: none;
    z-index: 10;
  }
  .modal-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(26, 29, 38, 0.8);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
  }
  .modal-content {
    background: #282D3A; /* Charcoal Steel */
    border: 1px solid #353F5C; /* Deep Metallic Blue */
    padding: 24px;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
    color: white;
    font-family: 'Inter', sans-serif;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  }
  .modal-content h2 {
    font-family: 'Rajdhani', sans-serif;
    color: #6DD4F2;
    margin-top: 0;
  }
  .meta {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
  }
  .label {
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: bold;
  }
  .label.good { background: rgba(0, 255, 128, 0.2); color: #00ff80; }
  .label.bad { background: rgba(255, 64, 64, 0.2); color: #ff4040; }
  .score {
    padding: 4px 8px;
    background: rgba(255,255,255,0.1);
    border-radius: 4px;
  }
  .actions {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #353F5C;
  }
  .actions h3 {
    font-size: 14px;
    color: #aaa;
    margin-bottom: 12px;
  }
  .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-family: 'Rajdhani', sans-serif;
    font-weight: bold;
    margin-right: 8px;
    transition: all 0.2s;
  }
  .btn-good { background: #00ff80; color: #1a1d26; }
  .btn-good:hover { box-shadow: 0 0 10px #00ff80; }
  .btn-bad { background: #ff4040; color: #1a1d26; }
  .btn-bad:hover { box-shadow: 0 0 10px #ff4040; }
  .close-btn {
    margin-top: 20px;
    background: transparent;
    border: 1px solid #6DD4F2;
    color: #6DD4F2;
    width: 100%;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .close-btn:hover {
    background: rgba(109, 212, 242, 0.1);
  }
  .map-label {
    position: absolute;
    transform: translate(-50%, -50%);
    color: rgba(255, 255, 255, 0.6);
    font-family: 'Rajdhani', sans-serif;
    font-size: 13px;
    font-weight: bold;
    text-shadow: 1px 1px 4px rgba(0,0,0,1.0), 0 0 8px rgba(0,0,0,0.8);
    pointer-events: none;
    z-index: 5;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
</style>
