<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { OverlayScene, type RainEffectConfig } from '@blorkfield/overlay-core';

  let wrapper: HTMLDivElement;
  let container: HTMLDivElement;
  let contentBox: HTMLDivElement;
  let scene: OverlayScene | null = null;

  // Layout constants
  const WELCOME_Y = 80;
  const MIN_FLOOR_PADDING = 60; // minimum space below content box

  onMount(async () => {
    await new Promise(r => setTimeout(r, 10));

    const width = container.clientWidth;
    const centerX = width * 0.5;

    // Scale text sizes to viewport — uncapped values are tuned for ~800px+
    const letterSize = Math.round(Math.min(60, width * 0.073));
    const buildFontSize = Math.round(Math.min(40, width * 0.055));
    const VERTICAL_GAP = Math.round(Math.min(30, width * 0.04));

    const getAvailableHeight = () => {
      const header = document.querySelector<HTMLElement>('.site-header');
      const footer = document.querySelector<HTMLElement>('.site-footer');
      return window.innerHeight - (header?.offsetHeight ?? 0) - (footer?.offsetHeight ?? 0);
    };

    // Calculate correct initial height before creating the scene.
    // Estimate build text bottom using the same font math used during placement.
    const boxRect = contentBox.getBoundingClientRect();
    const estBuildBottom = WELCOME_Y + letterSize + VERTICAL_GAP + buildFontSize;
    const estMinContentHeight = estBuildBottom + VERTICAL_GAP + boxRect.height + MIN_FLOOR_PADDING;
    const initialHeight = Math.max(estMinContentHeight, getAvailableHeight());

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = initialHeight;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);
    wrapper.style.height = `${initialHeight}px`;

    scene = new OverlayScene(canvas, {
      bounds: { top: 0, bottom: initialHeight, left: 0, right: width },
      gravity: { x: 0, y: -1 },
      wrapHorizontal: true,
      recenterOnResize: true,
      background: '#1a1b26',
      floorConfig: {
        segments: 3,
        threshold: 40,
        thickness: 50,
        visibleThickness: 4,
        color: '#565f89'
      },
      despawnBelowFloor: 0.5
    });

    await scene.initializeFonts('/fonts/');

    // "Welcome to Blorkfield" - centered
    const welcomeResult = await scene.addTextObstacles({
      text: 'Welcome to Blorkfield',
      x: centerX,
      y: WELCOME_Y,
      align: 'center',
      letterSize,
      pressureThreshold: { value: 9 },
      weight: { value: 10 },
      shadow: { opacity: 0.3 },
      clickToFall: { clicks: 2 },
      tags: ['grabable']
    });

    // "Build Stuff" - left-aligned with Welcome text
    const robotoFont = scene.getAvailableFonts().find(f => f.name === 'Roboto');
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
    const boxX = centerX;
    const boxY = buildBottom + VERTICAL_GAP + boxRect.height / 2;

    scene.spawnObject({
      element: contentBox,
      x: boxX,
      y: boxY,
      width: boxRect.width,
      height: boxRect.height,
      tags: ['content-obstacle', 'static'],
      pressureThreshold: { value: 100 },
      weight: 1000,
      shadow: { opacity: 0.3 },
      clickToFall: { clicks: 10 }
    });

    contentBox.style.visibility = 'visible';

    // Minimum height needed to fit content (uses actual boxY from placement)
    const minContentHeight = boxY + boxRect.height / 2 + MIN_FLOOR_PADDING;

    const applyHeight = (w: number) => {
      const h = Math.max(minContentHeight, getAvailableHeight());
      wrapper.style.height = `${h}px`;
      canvas.height = h;
      scene!.resize(w, h);
    };

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
      applyHeight(container.clientWidth);
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
    left: 0;
    visibility: hidden;
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
