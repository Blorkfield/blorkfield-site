import type { CardItem } from "./card-item";

export interface Product extends CardItem {
  repository?: string;
  npmPackage?: string;
  dockerImage?: string;
}
