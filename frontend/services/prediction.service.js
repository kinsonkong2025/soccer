import ApiService from './api.service.js';

class PredictionService {
    constructor() {
        this.history = new Map();
    }

    // 基於歷史數據的簡單預測算法
    async predictMatch(homeTeam, awayTeam) {
        try {
            // 獲取球隊信息
            const homeInfo = await ApiService.getTeamInfo(homeTeam);
            const awayInfo = await ApiService.getTeamInfo(awayTeam);
            
            // 模擬預測邏輯（實際項目應使用更複雜的算法）
            const prediction = this.calculatePrediction(homeTeam, awayTeam, homeInfo, awayInfo);
            
            // 記錄預測
            this.recordPrediction(homeTeam, awayTeam, prediction);
            
            return prediction;
            
        } catch (error) {
            console.error('預測失敗:', error);
            return this.getDefaultPrediction(homeTeam, awayTeam);
        }
    }

    // 計算預測結果
    calculatePrediction(homeTeam, awayTeam, homeInfo, awayInfo) {
        // 基礎概率
        let homeWin = 35; // 35% 基礎勝率
        let draw = 30;    // 30% 基礎平局率
        let awayWin = 35; // 35% 基礎勝率

        // 基於球隊名稱的簡單調整（示例）
        const adjustments = {
            '曼聯': { home: +10, away: -5 },
            '利物浦': { home: +5, away: 0 },
            '曼城': { home: +15, away: -5 },
            '阿森納': { home: +5, away: 0 },
            '切爾西': { home: +5, away: 0 },
            '熱刺': { home: +3, away: -3 },
            '巴塞羅那': { home: +10, away: -5 },
            '皇家馬德里': { home: +10, away: -5 },
            '拜仁慕尼黑': { home: +12, away: -7 },
            '多特蒙德': { home: +5, away: -2 }
        };

        // 應用主場優勢
        const homeAdjust = adjustments[homeTeam]?.home || 0;
        const awayAdjust = adjustments[awayTeam]?.away || 0;

        homeWin += homeAdjust;
        awayWin += awayAdjust;
        draw = 100 - homeWin - awayWin;

        // 確保百分比在合理範圍內
        homeWin = Math.max(10, Math.min(80, homeWin));
        awayWin = Math.max(10, Math.min(80, awayWin));
        draw = Math.max(5, Math.min(50, draw));

        // 正規化到100%
        const total = homeWin + draw + awayWin;
        homeWin = Math.round((homeWin / total) * 100);
        draw = Math.round((draw / total) * 100);
        awayWin = 100 - homeWin - draw;

        // 生成比分預測
        const scores = this.predictScores(homeWin, awayWin);

        return {
            homeTeam,
            awayTeam,
            predictions: {
                '1x2': {
                    homeWin: { probability: homeWin, confidence: this.calculateConfidence(homeWin) },
                    draw: { probability: draw, confidence: this.calculateConfidence(draw) },
                    awayWin: { probability: awayWin, confidence: this.calculateConfidence(awayWin) }
                },
                scores,
                halfFull: this.predictHalfFull(homeWin, draw, awayWin),
                recommendations: this.generateRecommendations(homeTeam, awayTeam, homeWin, awayWin)
            },
            factors: {
                homeAdvantage: true,
                teamForm: 'average',
                historicalPerformance: 'balanced'
            }
        };
    }

    // 預測比分
    predictScores(homeWinProb, awayWinProb) {
        const scores = [];
        
        // 基於概率生成可能的比分
        if (homeWinProb > 50) {
            scores.push({ score: '2-0', probability: 20 });
            scores.push({ score: '2-1', probability: 18 });
            scores.push({ score: '1-0', probability: 15 });
            scores.push({ score: '3-1', probability: 12 });
            scores.push({ score: '3-0', probability: 10 });
        } else if (awayWinProb > 50) {
            scores.push({ score: '0-2', probability: 20 });
            scores.push({ score: '1-2', probability: 18 });
            scores.push({ score: '0-1', probability: 15 });
            scores.push({ score: '1-3', probability: 12 });
            scores.push({ score: '0-3', probability: 10 });
        } else {
            scores.push({ score: '1-1', probability: 25 });
            scores.push({ score: '0-0', probability: 20 });
            scores.push({ score: '2-2', probability: 15 });
            scores.push({ score: '1-0', probability: 10 });
            scores.push({ score: '0-1', probability: 10 });
        }

        // 正規化概率
        const total = scores.reduce((sum, s) => sum + s.probability, 0);
        return scores.map(s => ({
            ...s,
            probability: Math.round((s.probability / total) * 100)
        }));
    }

    // 預測半全場
    predictHalfFull(homeWin, draw, awayWin) {
        return {
            'HH': Math.round(homeWin * 0.4), // 半場主勝，全場主勝
            'HD': Math.round(draw * 0.3),    // 半場主勝，全場平
            'HA': Math.round(awayWin * 0.1), // 半場主勝，全場客勝
            'DH': Math.round(homeWin * 0.2), // 半場平，全場主勝
            'DD': Math.round(draw * 0.4),    // 半場平，全場平
            'DA': Math.round(awayWin * 0.2), // 半場平，全場客勝
            'AH': Math.round(homeWin * 0.1), // 半場客勝，全場主勝
            'AD': Math.round(draw * 0.3),    // 半場客勝，全場平
            'AA': Math.round(awayWin * 0.4)  // 半場客勝，全場客勝
        };
    }

    // 計算信心度
    calculateConfidence(probability) {
        if (probability > 70) return 85;
        if (probability > 55) return 75;
        if (probability > 40) return 65;
        return 50;
    }

    // 生成建議
    generateRecommendations(homeTeam, awayTeam, homeWin, awayWin) {
        const recommendations = [];
        
        if (homeWin > 60) {
            recommendations.push(`💪 ${homeTeam} 主場優勢明顯，勝率較高`);
        } else if (awayWin > 60) {
            recommendations.push(`⚡ ${awayTeam} 近期狀態出色，值得關注`);
        } else {
            recommendations.push('⚖️ 雙方實力接近，比賽可能膠著');
        }

        if (homeWin > awayWin && homeWin < 55) {
            recommendations.push('🏠 主隊略有優勢，但優勢不大');
        }

        if (Math.abs(homeWin - awayWin) < 10) {
            recommendations.push('🎯 建議關注平局可能性');
        }

        return recommendations;
    }

    // 默認預測
    getDefaultPrediction(homeTeam, awayTeam) {
        return {
            homeTeam,
            awayTeam,
            predictions: {
                '1x2': {
                    homeWin: { probability: 33, confidence: 60 },
                    draw: { probability: 34, confidence: 60 },
                    awayWin: { probability: 33, confidence: 60 }
                },
                scores: [
                    { score: '1-1', probability: 25 },
                    { score: '1-0', probability: 20 },
                    { score: '0-1', probability: 20 },
                    { score: '2-1', probability: 15 },
                    { score: '1-2', probability: 15 }
                ],
                recommendations: ['數據不足，使用基礎預測模型']
            }
        };
    }

    // 記錄預測歷史
    recordPrediction(homeTeam, awayTeam, prediction) {
        const key = `${homeTeam}_vs_${awayTeam}`;
        this.history.set(key, {
            ...prediction,
            timestamp: Date.now()
        });
    }

    // 獲取歷史預測
    getPredictionHistory(homeTeam, awayTeam) {
        const key = `${homeTeam}_vs_${awayTeam}`;
        return this.history.get(key);
    }
}

export default new PredictionService();