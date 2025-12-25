import Config from '../config.js';

class ApiService {
    constructor() {
        this.cache = new Map();
        this.apiCalls = 0;
        this.lastApiCall = Date.now();
    }

    // 獲取賽事數據（優先真實 API，失敗時使用本地數據）
async getMatches() {
    const CACHE_KEY = 'fd_matches_today';
    const CACHE_DURATION = 5 * 60 * 1000; // 缓存5分钟，避免超出API限制

    // 1. 检查有效缓存
    const cached = this.getCache(CACHE_KEY, CACHE_DURATION);
    if (cached) {
        console.log('📦 使用缓存的比赛数据');
        return cached;
    }

    // 2. 构建并发送API请求
    try {
        console.log('🌐 从Football-Data.org获取今日比赛数据...');
        const response = await fetch(`${Config.API.FOOTBALL_DATA.BASE_URL}/matches`, {
            headers: {
                'X-Auth-Token': Config.API.FOOTBALL_DATA.API_KEY // 关键：认证头[citation:2]
            }
        });

        // 3. 处理API响应
        if (!response.ok) {
            throw new Error(`API请求失败，状态码: ${response.status}`);
        }

        const data = await response.json();
        
        // 4. 将API原始数据转换为你的系统格式
        const formattedMatches = this.transformFootballData(data.matches);
        
        // 5. 保存到缓存并返回
        this.setCache(CACHE_KEY, formattedMatches);
        console.log(`✅ 成功获取 ${formattedMatches.length} 场今日比赛`);
        return formattedMatches;

    } catch (error) {
        console.error('❌ 获取真实比赛数据失败:', error);
        // 优雅降级：返回本地备份数据
        return this.getLocalBackup();
    }
}
    // 使用 Football-Data.org API
    async getFootballDataMatches() {
        if (!Config.API.FOOTBALL_DATA.API_KEY) {
            console.warn('⚠️ 未設置 Football-Data.org API Key');
            return null;
        }

        // 檢查 API 調用限制
        if (!this.canMakeApiCall()) {
            console.warn('⚠️ API 調用頻率限制，使用緩存');
            return this.getCachedMatches();
        }

        try {
            const response = await fetch(
                `${Config.API.FOOTBALL_DATA.BASE_URL}/matches`,
                {
                    headers: {
                        'X-Auth-Token': Config.API.FOOTBALL_DATA.API_KEY
                    }
                }
            );

            this.recordApiCall();

            if (!response.ok) {
                throw new Error(`API 錯誤: ${response.status}`);
            }

            const data = await response.json();
            
            // 轉換為統一格式
            return this.transformFootballData(data.matches);
            
        } catch (error) {
            console.error('Football-Data API 錯誤:', error);
            return null;
        }
    }

    // 使用 OpenFootball API（免費，不需要 API Key）
    async getOpenFootballMatches() {
        try {
            const response = await fetch(
                'https://raw.githubusercontent.com/openfootball/football.json/master/2024-25/en.1.json'
            );

            if (!response.ok) {
                throw new Error(`OpenFootball API 錯誤: ${response.status}`);
            }

            const data = await response.json();
            
            // 轉換為統一格式
            return this.transformOpenFootballData(data);
            
        } catch (error) {
            console.error('OpenFootball API 錯誤:', error);
            return null;
        }
    }

    // 轉換 Football-Data.org 格式
transformFootballData(apiMatches) {
    if (!apiMatches) return [];
    return apiMatches.map(match => ({
        id: match.id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        competition: match.competition.name,
        status: this.convertMatchStatus(match.status), // 状态映射
        date: match.utcDate,
        score: {
            home: match.score.fullTime.home,
            away: match.score.fullTime.away
        },
        venue: match.venue || null
    }));
}

    // 轉換 OpenFootball 格式
    transformOpenFootballData(data) {
        if (!data || !data.matches) return [];
        
        return data.matches.map(match => ({
            id: `open_${match.date}_${match.team1}_${match.team2}`.replace(/\s+/g, '_'),
            homeTeam: match.team1,
            awayTeam: match.team2,
            competition: data.name || '未知聯賽',
            status: this.getMatchStatus(match.status || 'SCHEDULED'),
            date: match.date,
            score: match.score || { home: 0, away: 0 },
            venue: match.venue || null
        }));
    }

    // 獲取比賽狀態
    getMatchStatus(apiStatus) {
        const statusMap = {
            'SCHEDULED': 'upcoming',
            'LIVE': 'live',
            'IN_PLAY': 'live',
            'PAUSED': 'live',
            'FINISHED': 'finished',
            'POSTPONED': 'cancelled',
            'SUSPENDED': 'cancelled',
            'CANCELLED': 'cancelled'
        };
        
        return statusMap[apiStatus] || 'upcoming';
    }

    // 獲取本地備份數據
    async getLocalBackup() {
        try {
            const response = await fetch(Config.LOCAL.BACKUP_FILE);
            if (!response.ok) throw new Error('本地數據加載失敗');
            
            const data = await response.json();
            console.log(`📂 從本地加載 ${data.length} 場賽事`);
            return data;
        } catch (error) {
            console.error('本地數據加載錯誤:', error);
            return this.getFallbackMatches();
        }
    }

    // 最終備用數據
    getFallbackMatches() {
        return [
            {
                id: 'fallback_1',
                homeTeam: '曼聯',
                awayTeam: '利物浦',
                competition: '英超聯賽',
                status: 'upcoming',
                date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                score: { home: 0, away: 0 },
                venue: '老特拉福德球場'
            }
        ];
    }

    // 更新本地備份
    updateLocalBackup(matches) {
        try {
            localStorage.setItem('football_matches_backup', JSON.stringify({
                data: matches,
                timestamp: Date.now(),
                source: 'api'
            }));
        } catch (error) {
            console.warn('本地存儲失敗:', error);
        }
    }

    // 獲取緩存數據
    getCachedMatches() {
        try {
            const cached = localStorage.getItem('football_matches_cache');
            if (!cached) return null;
            
            const { data, timestamp } = JSON.parse(cached);
            
            // 檢查是否過期（5分鐘）
            if (Date.now() - timestamp > Config.LOCAL.CACHE_DURATION) {
                return null;
            }
            
            return data;
        } catch (error) {
            return null;
        }
    }

    // 記錄 API 調用
    recordApiCall() {
        this.apiCalls++;
        this.lastApiCall = Date.now();
        
        // 每分鐘重置計數器
        setTimeout(() => {
            this.apiCalls = Math.max(0, this.apiCalls - 1);
        }, 60000);
    }

    // 檢查是否可以調用 API
    canMakeApiCall() {
        const timeSinceLastCall = Date.now() - this.lastApiCall;
        return timeSinceLastCall > 6000 && this.apiCalls < 9; // 6秒間隔，最多9次/分鐘
    }

    // 獲取球隊詳細信息
    async getTeamInfo(teamName) {
        // 簡化的球隊數據庫
        const teams = {
            '曼聯': { 
                country: '英格蘭', 
                stadium: '老特拉福德',
                founded: 1878,
                colors: ['紅色', '白色', '黑色']
            },
            '利物浦': { 
                country: '英格蘭', 
                stadium: '安菲爾德',
                founded: 1892,
                colors: ['紅色']
            },
            '巴塞羅那': { 
                country: '西班牙', 
                stadium: '諾坎普',
                founded: 1899,
                colors: ['藍色', '紅色']
            },
            '皇家馬德里': { 
                country: '西班牙', 
                stadium: '伯納烏',
                founded: 1902,
                colors: ['白色']
            }
        };
        
        return teams[teamName] || { country: '未知', stadium: '未知' };
    }
}

export default new ApiService();