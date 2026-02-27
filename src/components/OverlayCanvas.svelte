<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { OverlayScene, type RainEffectConfig } from '@blorkfield/overlay-core';

  let wrapper: HTMLDivElement;
  let container: HTMLDivElement;
  let contentBox: HTMLDivElement;
  let scene: OverlayScene | null = null;

  // Layout constants
  const WELCOME_Y = 80;
  const VERTICAL_GAP = 30;
  const MIN_FLOOR_PADDING = 60; // minimum space below content box

  onMount(async () => {
    await new Promise(r => setTimeout(r, 10));

    const width = container.clientWidth;
    const centerX = width * 0.5;

    // Create canvas with temporary height, will resize after calculating layout
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    // Use small initial height so resize() always EXPANDS bounds (not shrinks)
    // overlay-core may not handle shrinking floor bounds correctly
    const tempHeight = 100;
    canvas.height = tempHeight;

    scene = new OverlayScene(canvas, {
      bounds: { top: 0, bottom: tempHeight, left: 0, right: width },
      gravity: 1,
      wrapHorizontal: true,
      background: '#1a1b26',
      floorConfig: {
        segments: 3,
        threshold: 100,
        thickness: 50,
        visibleThickness: 4,
        color: '#565f89'
      },
      despawnBelowFloor: 0.5
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      scene?.setMousePosition(e.clientX - rect.left, e.clientY - rect.top);
    });

    await scene.initializeFonts('/fonts/');

    // "Welcome to Blorkfield" - centered
    const welcomeResult = await scene.addTextObstacles({
      text: 'Welcome to Blorkfield',
      x: centerX,
      y: WELCOME_Y,
      align: 'center',
      letterSize: 60,
      pressureThreshold: { value: 9 },
      weight: { value: 10 },
      shadow: { opacity: 0.3 },
      clickToFall: { clicks: 2 },
      tags: ['grabable']
    });

    // "Build Stuff" - left-aligned with Welcome text
    const robotoFont = scene.getAvailableFonts().find(f => f.name === 'Roboto');
    const buildFontSize = 40;
    const buildY = welcomeResult.bounds.bottom + VERTICAL_GAP + (buildFontSize * 0.8);
    let buildBottom = buildY + buildFontSize * 0.2;

    if (robotoFont?.fontUrl) {
      const buildResult = await scene.addTTFTextObstacles({
        text: 'Build Stuff',
        x: welcomeResult.bounds.left,
        y: buildY,
        align: 'left',
        fontSize: buildFontSize,
        fontUrl: robotoFont.fontUrl,
        fillColor: '#8BA4C7',
        pressureThreshold: { value: 9 },
        weight: { value: 10 },
        shadow: { opacity: 0.3 },
        clickToFall: { clicks: 2 },
        tags: ['grabable']
      });
      buildBottom = buildResult.bounds.bottom;
    }

    // Content box - centered, below Build Stuff
    const boxRect = contentBox.getBoundingClientRect();
    const boxX = centerX;
    const boxY = buildBottom + VERTICAL_GAP + boxRect.height / 2;

    scene.spawnObject({
      element: contentBox,
      x: boxX,
      y: boxY,
      width: boxRect.width,
      height: boxRect.height,
      tags: ['content-obstacle', 'grabable'],
      pressureThreshold: { value: 100 },
      weight: 1000 ,
      shadow: { opacity: 0.3 },
      clickToFall: { clicks: 10 }
    });

    // Minimum height needed to fit content
    const minContentHeight = boxY + boxRect.height / 2 + MIN_FLOOR_PADDING;

    wrapper.style.height = `${minContentHeight}px`;
    canvas.height = minContentHeight;
    scene.resize(width, minContentHeight);

    const rainConfig: RainEffectConfig = {
      id: 'rain',
      type: 'rain',
      enabled: true,
      spawnRate: 3,
      objectConfigs: [{
        objectConfig: {
          imageUrl: '/bf_koban_512.png',
          tags: ['falling', 'grabable'],
          weight: 3
        },
        probability: 1,
        minScale: 1,
        maxScale: 1,
        baseRadius: 10
      }]
    };

    scene.setEffect(rainConfig);
    scene.start();

    const recalculateHeight = () => {
      if (!scene || !container || !wrapper) return;

      const newWidth = container.clientWidth;
      wrapper.style.height = `${minContentHeight}px`;
      canvas.height = minContentHeight;
      scene.resize(newWidth, minContentHeight);
    };

    const resizeObserver = new ResizeObserver(recalculateHeight);
    resizeObserver.observe(container);
    window.addEventListener('resize', recalculateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', recalculateHeight);
    };
  });

  onDestroy(() => {
    scene?.destroy();
  });
</script>

<div class="overlay-wrapper" bind:this={wrapper}>
  <div class="overlay-container" bind:this={container}></div>
  <div class="content-box" bind:this={contentBox}>
    <h2>What We Do</h2>
    <p>We build front-end tooling for 2D and 3D applications. Our libraries sit between raw browser APIs and application code—canvas rendering, WebGL pipelines, physics integration, and scene management. The kind of infrastructure you'd otherwise write yourself or cobble together from a dozen unmaintained packages.</p>

    <h2>Games & Tools</h2>
    <p>We develop video games and the systems that power them. Sprite batching, collision broadphase, input handling, asset loading—we've built these enough times that we started shipping them as standalone libraries. Everything we release comes out of actual production work, not spec-driven design docs.</p>

    <h2>Architecture</h2>
    <p>Our tools target the browser runtime but don't assume your stack. No framework lock-in, no build step requirements, minimal dependencies. Tree-shakeable ESM builds, TypeScript definitions, and enough configuration surface to fit into whatever mess you've already got running.</p>

    <h2>Open Source</h2>
    <p>Most of what we build ends up public. Check out the <a href="/products">products page</a> to see what's shipped and what's in progress.</p>
  </div>
</div>

<style>
  .overlay-wrapper {
    position: relative;
    width: 100%;
    overflow: clip;
  }

  .overlay-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .content-box {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 500px;
    max-width: 90%;
    background: var(--bg-card);
    border: 2px solid var(--text-muted);
    border-radius: 8px;
    padding: 1.5rem 2rem;
    pointer-events: none;
  }

  .content-box h2 {
    color: var(--accent-blue);
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    margin-top: 1rem;
  }

  .content-box h2:first-child {
    margin-top: 0;
  }

  .content-box p {
    color: var(--text-primary);
    font-size: 0.9rem;
    line-height: 1.6;
    margin-bottom: 0.5rem;
  }
</style>
