<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { OverlayScene, type RainEffectConfig } from '@blorkfield/overlay-core';

  let wrapper: HTMLDivElement;
  let container: HTMLDivElement;
  let contentBox: HTMLDivElement;
  let scene: OverlayScene | null = null;

  // Layout constants
  const WELCOME_Y = 80;
  const BUILD_STUFF_Y = WELCOME_Y + 90;
  const CONTENT_BOX_TOP = BUILD_STUFF_Y + 100;
  const FLOOR_PADDING = 60;

  onMount(async () => {
    await new Promise(r => setTimeout(r, 10));

    const contentBoxHeight = contentBox.offsetHeight;
    const totalHeight = CONTENT_BOX_TOP + contentBoxHeight + FLOOR_PADDING;

    wrapper.style.height = `${totalHeight}px`;

    const width = container.clientWidth;
    const height = totalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    scene = new OverlayScene(canvas, {
      bounds: { top: 0, bottom: height, left: 0, right: width },
      gravity: 1,
      wrapHorizontal: true,
      background: '#1a1b26',
      floorConfig: {
        segments: 10,
        threshold: 100
      },
      despawnBelowFloor: 0.5
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      scene?.setMousePosition(e.clientX - rect.left, e.clientY - rect.top);
    });

    await scene.initializeFonts('/fonts/');

    const welcomeX = width * 0.3;

    await scene.addTextObstacles({
      text: 'Welcome to Blorkfield',
      x: welcomeX,
      y: WELCOME_Y,
      letterSize: 60,
      pressureThreshold: { value: 9 },
      weight: { value: 10 },
      shadow: { opacity: 0.3 },
      clickToFall: { clicks: 2 },
      tags: ['grabable']
    });

    const robotoFont = scene.getAvailableFonts().find(f => f.name === 'Roboto');
    if (robotoFont?.fontUrl) {
      await scene.addTTFTextObstacles({
        text: 'Build Stuff',
        x: welcomeX,
        y: BUILD_STUFF_Y,
        fontSize: 40,
        fontUrl: robotoFont.fontUrl,
        fillColor: '#8BA4C7',
        pressureThreshold: { value: 9 },
        weight: { value: 10 },
        shadow: { opacity: 0.3 },
        clickToFall: { clicks: 2 },
        tags: ['grabable']
      });
    }

    const boxRect = contentBox.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const boxX = boxRect.left - containerRect.left + boxRect.width / 2;
    const boxY = boxRect.top - containerRect.top + boxRect.height / 2;

    scene.spawnObject({
      x: boxX,
      y: boxY,
      width: boxRect.width,
      height: boxRect.height,
      fillStyle: 'transparent',
      tags: ['content-obstacle', 'grabable'],
      pressureThreshold: { value: 100 },
      weight: { value: 1000 },
      shadow: true,
      clickToFall: { clicks: 10 }
    });

    const rainConfig: RainEffectConfig = {
      id: 'rain',
      type: 'rain',
      enabled: true,
      spawnRate: 3,
      objectConfigs: [{
        objectConfig: {
          imageUrl: '/bf_koban_512.png',
          tags: ['falling', 'grabable']
        },
        probability: 1,
        minScale: 1,
        maxScale: 1,
        baseRadius: 10
      }]
    };

    scene.setEffect(rainConfig);
    scene.start();

    const resizeObserver = new ResizeObserver(() => {
      if (scene && container) {
        const newWidth = container.clientWidth;
        scene.resize(newWidth, totalHeight);
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  });

  onDestroy(() => {
    scene?.destroy();
  });
</script>

<div class="overlay-wrapper" bind:this={wrapper}>
  <div class="overlay-container" bind:this={container}></div>
  <div class="content-box" bind:this={contentBox} style="top: {CONTENT_BOX_TOP}px;">
    <h2>What We Do</h2>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>

    <h2>Our Mission</h2>
    <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>

    <h2>Why Choose Us</h2>
    <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</p>

    <h2>Our Approach</h2>
    <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.</p>

    <h2>Get Started Today</h2>
    <p>Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.</p>

    <h2>Our Services</h2>
    <p>Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.</p>

    <h2>Contact Us</h2>
    <p>Eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
  </div>
</div>

<style>
  .overlay-wrapper {
    position: relative;
    width: 100%;
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
