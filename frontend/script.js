import ApiService from './services/api.service.js';
import PredictionService from './services/prediction.service.js';

class FootballPredictorApp {
    constructor() {
        this.matches = [];
        this.currentPredictions = new Map();
        this.initialized = false;
        this.updateInterval = null;
    }

    // 初始化應用
    async init() {
        console.log('⚽ 足球預測系統初始化...');
        
        try {
            // 1. 加載賽事數據
            await this.loadMatches();
            
            // 2. 渲染界面
            this.renderMatches();
            
            // 3. 設置事件監聽器
            this.setupEventListeners();
            
            // 4. 開始自動更新
            this.startAutoUpdate();
            
            this.initialized = true;
            console.log('✅ 系統初始化完成');
            
        } catch (error) {
            console.error('❌ 初始化失敗:', error);
            this.showError('系統初始化失敗，請刷新頁面重試');
        }
    }

    // 加載賽事數據
    async loadMatches() {
        try {
            // 顯示加載狀態
            this.showLoading();
            
            // 從 API 服務獲取數據
            this.matches = await ApiService.getMatches();
            
            // 為每場比賽生成預測
            await this.generatePredictions();
            
            // 隱藏加載狀態
            this.hideLoading();
            
        } catch (error) {
            console.error('加載賽事數據失敗:', error);
            this.hideLoading();
            this.showError('無法獲取賽事數據，使用本地數據');
        }
    }

    // 為所有比賽生成預測
    async generatePredictions() {
        const predictionPromises = this.matches.map(async match => {
            try {
                const prediction = await PredictionService.predictMatch(
                    match.homeTeam, 
                    match.awayTeam
                );
                this.currentPredictions.set(match.id, prediction);
            } catch (error) {
                console.warn(`預測生成失敗 ${match.homeTeam} vs ${match.awayTeam}:`, error);
            }
        });
        
        await Promise.all(predictionPromises);
    }

    // 渲染賽事列表
    renderMatches() {
        const container = document.getElementById('matches-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.matches.length === 0) {
            container.innerHTML = `
                <div class="no-matches">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>暫無賽事數據</h3>
                    <p>請稍後再試，或檢查網絡連接</p>
                </div>
            `;
            return;
        }
        
        this.matches.forEach(match => {
            const prediction = this.currentPredictions.get(match.id);
            const matchElement = this.createMatchElement(match, prediction);
            container.appendChild(matchElement);
        });
    }

    // 創建賽事元素
    createMatchElement(match, prediction) {
        const element = document.createElement('div');
        element.className = 'match-card';
        element.dataset.matchId = match.id;
        
        const matchStatus = this.getStatusText(match.status);
        const matchTime = this.formatMatchTime(match.date);
        
        const predictionData = prediction?.predictions || {
            '1x2': {
                homeWin: { probability: 33 },
                draw: { probability: 34 },
                awayWin: { probability: 33 }
            }
        };
        
        element.innerHTML = `
            <div class="match-header">
                <span class="league">${match.competition}</span>
                <span class="time">${matchTime}</span>
                <span class="status ${match.status}">
                    <i class="fas ${match.status === 'live' ? 'fa-circle' : 'fa-clock'}"></i>
                    ${matchStatus}
                </span>
            </div>
            
            <div class="teams">
                <div class="team home-team">
                    <div class="team-logo" data-team="${match.homeTeam}"></div>
                    <span>${match.homeTeam}</span>
                </div>
                <div class="vs">VS</div>
                <div class="team away-team">
                    <div class="team-logo" data-team="${match.awayTeam}"></div>
                    <span>${match.awayTeam}</span>
                </div>
            </div>
            
            ${match.status === 'live' || match.status === 'finished' ? `
                <div class="score">
                    <span class="home-score">${match.score?.home || 0}</span>
                    <span class="divider">-</span>
                    <span class="away-score">${match.score?.away || 0}</span>
                </div>
            ` : ''}
            
            <div class="predictions">
                <div class="prediction-item">
                    <span>主勝</span>
                    <div class="prediction-bar">
                        <div class="bar-fill home" style="width: ${predictionData['1x2'].homeWin.probability}%">
                            ${predictionData['1x2'].homeWin.probability}%
                        </div>
                    </div>
                </div>
                <div class="prediction-item">
                    <span>平局</span>
                    <div class="prediction-bar">
                        <div class="bar-fill draw" style="width: ${predictionData['1x2'].draw.probability}%">
                            ${predictionData['1x2'].draw.probability}%
                        </div>
                    </div>
                </div>
                <div class="prediction-item">
                    <span>客勝</span>
                    <div class="prediction-bar">
                        <div class="bar-fill away" style="width: ${predictionData['1x2'].awayWin.probability}%">
                            ${predictionData['1x2'].awayWin.probability}%
                        </div>
                    </div>
                </div>
            </div>
            
            <button class="btn-details" data-match-id="${match.id}">
                <i class="fas fa-chart-bar"></i> 詳細分析
            </button>
        `;
        
        // 添加球隊圖標
        this.addTeamLogos(element);
        
        return element;
    }

    // 添加球隊圖標
    addTeamLogos(element) {
        const logos = element.querySelectorAll('.team-logo');
        logos.forEach(logo => {
            const teamName = logo.dataset.team;
            const logoUrl = this.getTeamLogoUrl(teamName);
            if (logoUrl) {
                logo.style.backgroundImage = `url(${logoUrl})`;
                logo.style.backgroundSize = 'contain';
                logo.style.backgroundRepeat = 'no-repeat';
                logo.style.backgroundPosition = 'center';
                logo.style.width = '40px';
                logo.style.height = '40px';
            }
        });
    }

    // 獲取球隊圖標 URL
    getTeamLogoUrl(teamName) {
        const logoMap = {
            '曼聯': 'https://img.icons8.com/color/96/000000/manchester-united.png',
            '利物浦': 'https://img.icons8.com/color/96/000000/liverpool-fc.png',
            '曼城': 'https://img.icons8.com/color/96/000000/manchester-city.png',
            '阿森納': 'https://img.icons8.com/color/96/000000/arsenal-fc.png',
            '切爾西': 'https://img.icons8.com/color/96/000000/chelsea-fc.png',
            '熱刺': 'https://img.icons8.com/color/96/000000/tottenham-hotspur.png',
            '巴塞羅那': 'https://img.icons8.com/color/96/000000/fc-barcelona.png',
            '皇家馬德里': 'https://img.icons8.com/color/96/000000/real-madrid.png',
            '拜仁慕尼黑': 'https://img.icons8.com/color/96/000000/bayern-munich.png',
            '多特蒙德': 'https://img.icons8.com/color/96/000000/borussia-dortmund.png'
        };
        
        return logoMap[teamName] || null;
    }

    // 獲取狀態文字
    getStatusText(status) {
        const statusMap = {
            'upcoming': '未開始',
            'live': '進行中',
            'finished': '已結束',
            'cancelled': '已取消'
        };
        
        return statusMap[status] || status;
    }

    // 格式化比賽時間
    formatMatchTime(dateString) {
        if (!dateString) return '時間待定';
        
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffHours = Math.floor((date - now) / (1000 * 60 * 60));
            
            if (diffHours < 24) {
                return date.toLocaleTimeString('zh-HK', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            } else {
                return date.toLocaleDateString('zh-HK', { 
                    month: 'short', 
                    day: 'numeric' 
                });
            }
        } catch (error) {
            return '時間待定';
        }
    }

    // 設置事件監聽器
    setupEventListeners() {
        // 詳細分析按鈕
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-details')) {
                const matchId = e.target.closest('.btn-details').dataset.matchId;
                this.showDetailedAnalysis(matchId);
            }
        });
        
        // 刷新按鈕
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }
        
        // 設置按鈕
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }
    }

    // 顯示詳細分析
    async showDetailedAnalysis(matchId) {
        const match = this.matches.find(m => m.id === matchId);
        const prediction = this.currentPredictions.get(matchId);
        
        if (!match || !prediction) {
            this.showError('無法獲取詳細分析數據');
            return;
        }
        
        // 創建模態框
        this.createAnalysisModal(match, prediction);
    }

    // 創建分析模態框
    createAnalysisModal(match, prediction) {
        const modal = document.createElement('div');
        modal.className = 'analysis-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-chart-line"></i> ${match.homeTeam} vs ${match.awayTeam}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div class="match-info">
                        <p><strong>聯賽:</strong> ${match.competition}</p>
                        <p><strong>時間:</strong> ${this.formatMatchTime(match.date)}</p>
                        <p><strong>狀態:</strong> ${this.getStatusText(match.status)}</p>
                        ${match.venue ? `<p><strong>場地:</strong> ${match.venue}</p>` : ''}
                    </div>
                    
                    <div class="prediction-details">
                        <h4>預測分析</h4>
                        <div class="prediction-grid">
                            <div class="prediction-box">
                                <h5>最可能比分</h5>
                                ${prediction.predictions.scores.slice(0, 3).map(score => `
                                    <p class="score-item">
                                        <span>${score.score}</span>
                                        <span class="probability">${score.probability}%</span>
                                    </p>
                                `).join('')}
                            </div>
                            
                            <div class="prediction-box">
                                <h5>半全場預測</h5>
                                ${Object.entries(prediction.predictions.halfFull || {}).slice(0, 4).map(([type, prob]) => `
                                    <p class="half-full-item">
                                        <span>${type}</span>
                                        <span class="probability">${prob}%</span>
                                    </p>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="recommendations">
                        <h5><i class="fas fa-lightbulb"></i> 建議</h5>
                        <ul>
                            ${prediction.predictions.recommendations.map(rec => 
                                `<li>${rec}</li>`
                            ).join('')}
                        </ul>
                    </div>
                    
                    <div class="disclaimer">
                        <p><i class="fas fa-exclamation-triangle"></i> 注意：此預測僅供參考，實際結果可能有所不同</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 關閉按鈕
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        // 點擊外部關閉
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // 刷新數據
    async refreshData() {
        console.log('🔄 手動刷新數據...');
        await this.loadMatches();
        this.renderMatches();
        this.showNotification('數據已刷新');
    }

    // 開始自動更新
    startAutoUpdate() {
        // 清除現有定時器
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // 每5分鐘更新一次
        this.updateInterval = setInterval(async () => {
            console.log('🔄 自動更新數據...');
            await this.loadMatches();
            this.renderMatches();
        }, 5 * 60 * 1000);
    }

    // 顯示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#52c41a' : '#1890ff'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // 顯示錯誤
    showError(message) {
        this.showNotification(`❌ ${message}`, 'error');
    }

    // 顯示加載狀態
    showLoading() {
        let loader = document.getElementById('loading-indicator');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'loading-indicator';
            loader.innerHTML = `
                <div class="loader">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>加載賽事數據中...</span>
                </div>
            `;
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255,255,255,0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9998;
            `;
            document.body.appendChild(loader);
        }
    }

    // 隱藏加載狀態
    hideLoading() {
        const loader = document.getElementById('loading-indicator');
        if (loader) {
            loader.remove();
        }
    }

    // 顯示設置
    showSettings() {
        alert('設置功能開發中...');
    }
}

// 啟動應用
document.addEventListener('DOMContentLoaded', () => {
    const app = new FootballPredictorApp();
    window.footballApp = app; // 全局訪問
    app.init();
});