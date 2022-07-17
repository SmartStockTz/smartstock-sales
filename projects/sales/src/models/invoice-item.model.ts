export type InvoiceItemModel = {
  amount: number;
  quantity: number;
  stock: {
    purchase: number;
    product: string;
    category: string;
    supplier: string;
    unit: string;
    stockable: boolean;
    retailPrice?: number,
    wholesalePrice?: number,
    // saleable: boolean;
    // purchasable: boolean;
    id: string;
  }
};
