export interface IMutuo {
  id: number;
  year: number;
  month: number;
  price: number;
}

export interface ILuce {
  id: number;
  year: number;
  month_ref: string;
  month: number;
  price: number;
}

export interface IGas extends ILuce {
  mc: number;
}

export interface IAsset {
  id: number;
  name: string;
  ticker: string;
  color: string;
  shares: number;
  currentPrice: number; // Arriva dal BE tramite JOIN
  totalValue?: number;  // Calcolato nel FE (shares * currentPrice)
}

export interface IPortfolioHistory {
  date: string;
  total_value: number;
}