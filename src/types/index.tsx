export interface Match {
  id: number;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  status: string;
  score: { home: number; away: number };
  time: Date;
  odds?: OddsData;
  predictions?: Prediction;
  liveData?: LiveData;
}

export interface OddsData {
  // 根据实际需要定义
}

export interface Prediction {
  // 根据实际需要定义
}

export interface LiveData {
  // 根据实际需要定义
}

export type PredictionType = '1x2' | 'halfFull' | 'correctScore' | 'handicap';