import axios from 'axios';

const API_KEY = process.env.REACT_APP_FOOTBALL_API_KEY || '';
const BASE_URL = 'https://api.football-data.org/v4';

export class DataService {
  static async getLiveMatches() {
    try {
      // 如果有API密钥，使用真实数据
      if (API_KEY && API_KEY !== '你的API密钥') {
        const response = await axios.get(`${BASE_URL}/matches`, {
          headers: { 
            'X-Auth-Token': API_KEY,
            'Content-Type': 'application/json'
          },
          params: {
            status: 'LIVE',
            limit: 10
          }
        });
        return response.data.matches || [];
      } else {
        // 否则返回模拟数据
        return this.getSampleMatches();
      }
    } catch (error) {
      console.error('获取实时比赛失败:', error);
      return this.getSampleMatches();
    }
  }

  static async getUpcomingMatches() {
    try {
      if (API_KEY && API_KEY !== '你的API密钥') {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        
        const response = await axios.get(`${BASE_URL}/matches`, {
          headers: { 'X-Auth-Token': API_KEY },
          params: {
            status: 'SCHEDULED',
            dateFrom: today,
            dateTo: tomorrow,
            limit: 20
          }
        });
        return response.data.matches || [];
      } else {
        return this.getSampleMatches();
      }
    } catch (error) {
      console.error('获取即将比赛失败:', error);
      return this.getSampleMatches();
    }
  }

  static generatePrediction() {
    // 生成随机预测数据
    const homeWin = Math.random() * 0.6 + 0.2;
    const draw = Math.random() * 0.3;
    const awayWin = 1 - homeWin - draw;
    
    return {
      homeWin: Math.max(0, homeWin),
      draw: Math.max(0, draw),
      awayWin: Math.max(0, awayWin),
      confidence: Math.random() * 0.3 + 0.7 // 70-100%信心度
    };
  }

  private static getSampleMatches() {
    return [
      {
        id: 1,
        homeTeam: { name: '曼联' },
        awayTeam: { name: '曼城' },
        competition: { name: '英超联赛' },
        status: 'SCHEDULED',
        score: { fullTime: { home: 0, away: 0 } },
        utcDate: new Date(Date.now() + 3600000).toISOString()
      },
      {
        id: 2,
        homeTeam: { name: '皇家马德里' },
        awayTeam: { name: '巴塞罗那' },
        competition: { name: '西甲联赛' },
        status: 'LIVE',
        score: { fullTime: { home: 1, away: 1 } },
        utcDate: new Date().toISOString()
      },
      {
        id: 3,
        homeTeam: { name: '拜仁慕尼黑' },
        awayTeam: { name: '多特蒙德' },
        competition: { name: '德甲联赛' },
        status: 'SCHEDULED',
        score: { fullTime: { home: 0, away: 0 } },
        utcDate: new Date(Date.now() + 7200000).toISOString()
      }
    ];
  }
}

export default DataService;