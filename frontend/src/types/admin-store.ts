export type AdminStoreRecord = {
  id: string;
  name: string;
  branchName?: string;
  prefecture: string;
  area?: string;
  industry: string;
  genre?: string;
  unitPrice?: number | null;
  businessHours?: {
    open: string;
    close: string;
  };
  averageRating: number;
  createdAt: string;
  updatedAt: string;
};
