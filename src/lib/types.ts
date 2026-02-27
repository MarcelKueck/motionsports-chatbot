export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  price: number;
  salePrice?: number;
  currency: "EUR";
  shortDescription: string;
  detailedDescription: string;
  specifications: Record<string, string | number>;
  features: string[];
  dimensions: {
    width: number;
    height: number;
    depth: number;
    weight: number;
  };
  targetGroup: string[];
  compatibleWith?: string[];
  shopifyUrl: string;
  shopifyCartUrl: string;
  images: string[];
  inStock: boolean;
  deliveryTime: string;
  series?: string;
  tags: string[];
}

export interface ShowProductArgs {
  productId: string;
  reason?: string;
}

export interface CompareProductsArgs {
  productIds: string[];
  comparisonContext?: string;
}

export interface AddToCartArgs {
  productId: string;
  message: string;
}

export interface SuggestShowroomArgs {
  productIds: string[];
}
