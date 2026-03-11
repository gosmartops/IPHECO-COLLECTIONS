
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  description: string;
  sizes: string[];
  colors: string[];
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

export interface StylistResponse {
  advice: string;
  recommendedProductIds: string[];
}

export type Category = 
  | 'All' | 'Polo' | 'T-shirt' | 'Jeans' | 'Turkey jeans' | 'Shorts' | 'Jackets' | 'Swede shirt' 
  | 'Palm slippers' | 'Shoes' | 'Corporate shoes' | 'Sneakers' | 'Sandals' | 'Boxers' | 'Singlet' | 'Belt' 
  | 'Wristwatches' | 'Jewelries' | 'Bangles and bracelets' | 'Hoodie' | 'Sun glasses' | 'Jean chains' | 'Socks'
  | 'Traveling box' | 'Traveling bags' | 'Caps' | 'Head warmer' 
  | 'Sleeveless sweater and jackets' | 'Crossing bags';
