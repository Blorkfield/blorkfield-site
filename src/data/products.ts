import type { Product } from "../types/product";

export const products: Product[] = [
    {
    id: "overlay",
    title: "Overlay Core",
    bannerImage: "overlay_core.png",
    description: "2d overlay created using TypeScript and Matter.js",
    link: "https://overlay.blorkfield.com"
  },
  {
    id: "debugger",
    title: "Asset Debugger",
    bannerImage: "asset_debugger.png",
    description: "3D asset debugger to preview assets as they will appear in ThreeJS scenes",
    link: "https://debugger.blorkfield.com"
  }
];
