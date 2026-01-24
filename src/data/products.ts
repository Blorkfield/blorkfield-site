import type { Product } from "../types/product";

export const products: Product[] = [
    {
    id: "overlay",
    title: "Overlay Core",
    bannerImage: "overlay_core.png",
    description: "2d overlay created using TypeScript and Matter.js",
    link: "https://overlay.blorkfield.com",
    repository: "https://github.com/Blorkfield/overlay-core",
    npmPackage: "https://www.npmjs.com/package/@blorkfield/overlay-core",
    dockerImage: "ghcr.io/blorkfield/overlay-core:latest"
  },
  {
    id: "debugger",
    title: "Asset Debugger",
    bannerImage: "asset_debugger.png",
    description: "3D asset debugger to preview assets as they will appear in ThreeJS scenes",
    link: "https://debugger.blorkfield.com",
    repository: "https://github.com/Blorkfield/blorktools",
    npmPackage: "https://www.npmjs.com/package/@blorkfield/asset-debugger",
    dockerImage: "ghcr.io/blorkfield/asset-debugger:latest"
  }
];
