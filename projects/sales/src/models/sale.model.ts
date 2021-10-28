export interface SalesModel {
  soldBy: {
    username: string;
  };
  id: string;
  idTra?: string;
  createdAt?: any;
  updatedAt?: any;
  date: any;
  timer: any;
  product: string;
  category: string;
  unit: string;
  quantity: number;
  amount: number;
  customer: string;
  cartId?: string;
  discount: number;
  user: string;
  refund?: {
    amount: number,
    quantity: number,
    user: {
      firstname: string,
      lastname: string,
      username: string
    }
  };
  sellerObject: {
    username: string;
    lastname: string;
    firstname: string;
    email: string;
  };
  channel: 'whole' | 'retail' | 'invoice' | 'online' | string;
  stock: {
    id?: string;
    product: string;
    type: 'simple' | 'grouped';
    retailPrice: number;
    wholesalePrice: number;
    creditPrice?: number;
    unit: string;
    category: string;
    quantity: number;
    wholesaleQuantity: number;
    purchase: number;
    supplier: string;
    expire: string;
    stockable: boolean;
  };
  batch?: string;
  stockId: string;
  customerObject: {
    phone?: string;
    email?: string;
    company?: string;
    street?: string;
    payNumber?: string;
    payRef?: string;
    displayName: string;
    tin?: string;
    id?: string;
  };
}
