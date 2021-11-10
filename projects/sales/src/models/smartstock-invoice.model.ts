export type SmartstockInvoiceModel = {
  id: string;
  amount: number;
  customer: {
    id: string;
  };
  date: string;
  month: string;
  generatedBy: string;
  projectId: string;
  shopName: string;
  updatedAt: string;
  createdAt: string;
};

