export interface SurveySummary {
  id: string;
  storeId: string;
  storeName: string;
  storeBranch?: string;
  storePrefecture: string;
  storeArea?: string;
  storeIndustry: string;
  storeGenre?: string;
  visitedPeriod: string;
  workType: string;
  age: number;
  specScore: number;
  waitTimeHours: number;
  averageEarning: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
  helpfulCount?: number;
  customerComment?: string;
  staffComment?: string;
  workEnvironmentComment?: string;
  emailAddress?: string;
  imageUrls?: string[];
}

export type SurveyDetail = SurveySummary;

export interface SurveyListResponse {
  items: SurveySummary[];
  page: number;
  limit: number;
  total: number;
}

export interface StoreSummary {
  id: string;
  storeName: string;
  branchName?: string;
  prefecture: string;
  area?: string;
  category: string;
  genre?: string;
  createdAt?: string;
  updatedAt?: string;
  averageRating: number;
  averageEarning: number;
  averageEarningLabel?: string;
  waitTimeHours: number;
  waitTimeLabel?: string;
  surveyCount: number;
  helpfulCount?: number;
  reviewCount?: number; // 旧API互換
}

export interface StoreDetail extends StoreSummary {
  genre?: string;
  businessHours?: {
    open: string;
    close: string;
  };
  createdAt?: string;
  updatedAt?: string;
  surveys: SurveySummary[];
}
