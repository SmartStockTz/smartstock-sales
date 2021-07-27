export interface StockModel {
  createdAt?: any;
  updatedAt?: any;
  image?: any;
  images?: any[];
  barcode?: string;
  id?: string;
  _id?: string;
  product: string;
  description?: string;
  type: 'simple' | 'grouped';
  downloadable?: boolean;
  downloads?: {
    name: string;
    type: string;
    url: any;
  }[];
  retailPrice: number;
  wholesalePrice: any;
  catalog?: any[];
  saleable: boolean;
  canExpire: boolean;
  unit: string;
  category: string;
  stockable: boolean | true;
  purchasable: boolean | true;
  quantity: number;
  wholesaleQuantity: number;
  reorder: number;
  purchase: number;
  supplier: string;
  expire: string;
}
