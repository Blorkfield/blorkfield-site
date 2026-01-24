<script lang="ts">
	import type { CardItem } from "../types/card-item";

  let {
      item,
      modalWidth = 95,
      modalHeight = 95,
      onClose
  }: {
      item: CardItem;
      modalWidth?: number;
      modalHeight?: number;
      onClose: () => void;
  } = $props();

  let linkLabel = $derived.by(() => {
    try{
      return new URL(item.link).hostname
    } catch {
      return item.link;
    }
  });  

  let dockerPullCommand = $derived.by(() => {
    if (!item.dockerImage) {
      return "";
    }
    return `docker pull ${item.dockerImage}`;
  });

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			onClose();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="modal__backdrop" onclick={handleBackdropClick} role="dialog" aria-modal="true">
	<div class="modal__dialog" style="--modal-width: {modalWidth}vw; --modal-height: {modalHeight}vh">
		<button class="modal__close" onclick={onClose} aria-label="Close modal">×</button>
		{#if item.bannerImage}
			<div class="modal__banner">
				<img src={item.bannerImage} alt={item.title} />
			</div>
		{/if}
		<div class="modal__content">
			<h1 class="modal__title">{item.title}</h1>
			<p class="modal__description">{item.description}</p>
			<a href={item.link} target="_blank" rel="noopener noreferrer" class="modal__link">
				{linkLabel}
			</a>
      {#if item.repository || item.npmPackage || item.dockerImage}
        <div class="modal__secondary-links">
          {#if item.repository}
            <a href={item.repository} target="_blank" rel="noopener noreferrer">
            Repositiory →
            </a>
          {/if}
          {#if item.npmPackage}
            <a href={item.npmPackage} target="_blank" rel="noopener noreferrer">
            NPM Package →
            </a>
          {/if}
          {#if item.dockerImage}
            <div class="docker-block">
              <div class="docker-block__label">Docker Image</div>
              <div class="docker-block__code">
                <code>{dockerPullCommand}</code>
                <button 
                  class="docker-block__copy" 
                  onclick={() => navigator.clipboard.writeText(dockerPullCommand)} 
                  aria-label="Copy Docker pull command"
                >
                Copy
                </button>
              </div>
            </div>
          {/if}
        </div>
      {/if}
		</div>
	</div>
</div>

<style>
	.modal__secondary-links {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.modal__secondary-links a {
		font-size: 0.9rem;
		color: #6b7280;
		text-decoration: none;
		width: fit-content;
		transition: color 0.15s ease, transform 0.15s ease;
	}

	.modal__secondary-links a:hover {
		color: #3b82f6;
		transform: translateX(2px);
		text-decoration: underline;
	}

	/* Docker block */

	.docker-block {
		margin-top: 0.75rem;
	}

	.docker-block__label {
		font-size: 0.7rem;
		color: #9ca3af;
		margin-bottom: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.docker-block__code {
		position: relative;
		background: #0f172a;
		border: 1px solid #1e293b;
		border-radius: 6px;
		padding: 0.6rem 0.75rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.85rem;
		color: #e5e7eb;
	}

	.docker-block__copy {
		position: absolute;
		top: 6px;
		right: 6px;
		font-size: 0.7rem;
		padding: 0.25rem 0.45rem;
		border-radius: 4px;
		background: #1e293b;
		color: #e5e7eb;
		border: none;
		cursor: pointer;
		opacity: 0;
		transition: opacity 0.15s ease, background 0.15s ease;
	}

	.docker-block__code:hover .docker-block__copy {
		opacity: 1;
	}

	.docker-block__copy:hover {
		background: #334155;
	}
</style>

