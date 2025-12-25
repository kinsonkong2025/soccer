import axios, { AxiosInstance, AxiosError } from 'axios';
import io, { Socket } from 'socket.io-client';
import { Match, OddsData, Prediction, LiveEvent } from '../types';

// 配置football-data.org API (请替换为您的API Key)
const FOOTBALL_DATA_API_KEY = 'd32d44ccb25d4562bbe9ac66939dac91';
const FOOTBALL_DATA_BASE_URL = 'https://api.football-data.org/v4';

class DataService {
    private httpClient: AxiosInstance;
    private socket: Socket | null = null;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;

    constructor() {
        // 初始化HTTP客户端
        this.httpClient = axios.create({
            baseURL: FOOTBALL_DATA_BASE_URL,
            headers: {
                'X-Auth-Token': FOOTBALL_DATA_API_KEY,
            },
        });

        // 初始化WebSocket连接
        this.initSocketConnection();
    }

    // 1. 初始化Socket.io连接
    private initSocketConnection(): void {
        const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_SERVER || 'http://localhost:3001';
        
        this.socket = io(SOCKET_SERVER_URL, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: this.maxReconnectAttempts,
            timeout: 10000,
        });

        // Socket事件监听
        this.socket.on('connect', () => {
            console.log('Socket.io连接成功');
            this.reconnectAttempts = 0;
        });

        this.socket.on('disconnect', (reason: string) => {
            console.warn('Socket.io连接断开:', reason);
            this.handleReconnection();
        });

        this.socket.on('matchUpdate', (data: Match) => {
            this.emitDataUpdate('match', data);
        });

        this.socket.on('oddsUpdate', (data: OddsData) => {
            this.emitDataUpdate('odds', data);
        });

        this.socket.on('liveEvent', (data: LiveEvent) => {
            this.emitDataUpdate('event', data);
        });
    }

    // 2. 指数退避重连算法
    private handleReconnection(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('达到最大重连次数，停止重连');
            return;
        }

        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        this.reconnectAttempts++;

        setTimeout(() => {
            if (this.socket && !this.socket.connected) {
                console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                this.socket.connect();
            }
        }, delay);
    }

    // 3. 获取未来24小时比赛
    async getUpcomingMatches(): Promise<Match[]> {
        try {
            const now = new Date();
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            
            const dateFrom = now.toISOString().split('T')[0];
            const dateTo = tomorrow.toISOString().split('T')[0];

            const response = await this.httpClient.get('/matches', {
                params: {
                    dateFrom,
                    dateTo,
                    status: 'SCHEDULED',
                    competitions: 'PL,CL,ELC,PD,SA,BL1,FL1', // 顶级联赛
                },
            });

            return response.data.matches.map((match: any) => this.transformMatchData(match));
        } catch (error) {
            this.handleApiError(error as AxiosError, 'getUpcomingMatches');
            return [];
        }
    }

    // 4. 获取进行中的比赛
    async getLiveMatches(): Promise<Match[]> {
        try {
            const response = await this.httpClient.get('/matches', {
                params: { status: 'LIVE' }
            });

            return response.data.matches.map((match: any) => {
                const transformed = this.transformMatchData(match);
                transformed.liveData = {
                    possession: match.score?.possession || 50,
                    shots: match.score?.shots || { home: 0, away: 0 },
                    dangerousAttacks: match.score?.dangerousAttacks || { home: 0, away: 0 },
                    events: this.parseLiveEvents(match.events || [])
                };
                return transformed;
            });
        } catch (error) {
            this.handleApiError(error as AxiosError, 'getLiveMatches');
            return [];
        }
    }

    // 5. 数据转换器
    private transformMatchData(apiData: any): Match {
        return {
            id: apiData.id,
            competition: apiData.competition?.name || '未知联赛',
            homeTeam: apiData.homeTeam?.name || '主队',
            awayTeam: apiData.awayTeam?.name || '客队',
            status: this.mapMatchStatus(apiData.status),
            score: apiData.score?.fullTime || { home: 0, away: 0 },
            time: apiData.utcDate ? new Date(apiData.utcDate) : new Date(),
            odds: this.parseOdds(apiData.odds),
            predictions: this.generatePredictions(apiData), // AI预测占位符
        };
    }

    // 6. 错误处理
    private handleApiError(error: AxiosError, context: string): void {
        console.error(`API Error in ${context}:`, {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            data: error.response?.data
        });

        // 触发错误事件供UI处理
        if (this.socket) {
            this.socket.emit('apiError', {
                context,
                message: error.message,
                timestamp: new Date()
            });
        }
    }

    // 7. 数据更新事件发射器
    private emitDataUpdate(type: string, data: any): void {
        const event = new CustomEvent(`footballDataUpdate`, {
            detail: { type, data, timestamp: new Date() }
        });
        window.dispatchEvent(event);
    }

    // 辅助方法：解析赔率、生成预测等...
    private parseOdds(oddsData: any): OddsData { /* 实现赔率解析 */ }
    private parseLiveEvents(events: any[]): LiveEvent[] { /* 解析比赛事件 */ }
    private mapMatchStatus(status: string): string { /* 状态映射 */ }
    private generatePredictions(matchData: any): Prediction { /* 生成预测数据 */ }

    // 公共方法：订阅特定比赛
    subscribeToMatch(matchId: number): void {
        if (this.socket && this.socket.connected) {
            this.socket.emit('subscribe', { matchId, channel: 'live' });
        }
    }
}

export const dataService = new DataService();