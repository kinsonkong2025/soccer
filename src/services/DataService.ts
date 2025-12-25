// 复制这个代码到文件中
import axios from 'axios';

const API_KEY = process.env.REACT_APP_FOOTBALL_API_KEY;
const BASE_URL = 'https://api.football-data.org/v4';

export class DataService {
  static async getMatches(): Promise<any[]> {
    try {
      const response = await axios.get(`${BASE_URL}/matches`, {
        headers: { 'X-Auth-Token': API_KEY },
        params: {
          status: 'LIVE,SCHEDULED',
          limit: 20
        }
      });
      return response.data.matches || [];
    } catch (error) {
      console.error('获取比赛数据失败:', error);
      return [];
    }
  }

  static generatePrediction(): any {
    // 模拟预测数据（实际项目会用AI模型）
    return {
      homeWin: Math.random() * 0.6 + 0.3,
      draw: Math.random() * 0.3,
      awayWin: Math.random() * 0.3,
      confidence: Math.random() * 0.3 + 0.7
    };
  }
}