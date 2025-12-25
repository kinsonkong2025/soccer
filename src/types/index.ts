// 只保留基本类型，删除复杂类型
export interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  status: string;
  score: { home: number; away: number };
  time: Date;
}

export interface Prediction {
  homeWin: number;
  draw: number;
  awayWin: number;
  confidence: number;
}