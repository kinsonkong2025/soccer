// 等待頁面加載完成
document.addEventListener('DOMContentLoaded', function() {
    console.log('足球預測系統已加載');
    
    // 模擬數據
    const matchesData = [
        {
            id: 1,
            league: '英超聯賽',
            home: '曼聯',
            away: '利物浦',
            time: '20:00',
            status: 'live',
            homeScore: 2,
            awayScore: 1,
            predictions: { home: 45, draw: 30, away: 25 }
        },
        {
            id: 2,
            league: '西甲聯賽',
            home: '巴塞羅那',
            away: '皇家馬德里',
            time: '22:30',
            status: 'upcoming',
            predictions: { home: 40, draw: 35, away: 25 }
        },
        {
            id: 3,
            league: '德甲聯賽',
            home: '拜仁慕尼黑',
            away: '多特蒙德',
            time: '21:30',
            status: 'upcoming',
            predictions: { home: 55, draw: 25, away: 20 }
        },
        {
            id: 4,
            league: '意甲聯賽',
            home: '尤文圖斯',
            away: 'AC米蘭',
            time: '23:00',
            status: 'upcoming',
            predictions: { home: 38, draw: 32, away: 30 }
        }
    ];

    // 模擬實時更新分數
    function updateLiveScore() {
        const liveMatch = document.querySelector('.status.live');
        if (liveMatch) {
            const scoreElement = document.querySelector('.score');
            if (scoreElement) {
                // 模擬分數變化
                const currentHome = parseInt(scoreElement.querySelector('.home-score').textContent);
                const currentAway = parseInt(scoreElement.querySelector('.away-score').textContent);
                
                // 隨機增加分數（10% 機率）
                if (Math.random() < 0.1) {
                    if (Math.random() < 0.7) {
                        // 主隊進球
                        scoreElement.querySelector('.home-score').textContent = currentHome + 1;
                        showNotification('⚽ 曼聯進球了！');
                    } else {
                        // 客隊進球
                        scoreElement.querySelector('.away-score').textContent = currentAway + 1;
                        showNotification('⚽ 利物浦進球了！');
                    }
                }
            }
        }
    }

    // 顯示通知
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-bell"></i>
                <span>${message}</span>
            </div>
        `;
        
        // 添加樣式
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.background = '#1890ff';
        notification.style.color = 'white';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '10px';
        notification.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
        notification.style.zIndex = '9999';
        notification.style.animation = 'slideIn 0.5s ease';
        
        document.body.appendChild(notification);
        
        // 3秒後移除
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    // 添加 CSS 動畫
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
    `;
    document.head.appendChild(style);

    // 按鈕點擊事件
    const predictButtons = document.querySelectorAll('.btn-predict');
    predictButtons.forEach(button => {
        button.addEventListener('click', function() {
            const matchCard = this.closest('.match-card');
            const homeTeam = matchCard.querySelector('.team:first-child span').textContent;
            const awayTeam = matchCard.querySelector('.team:last-child span').textContent;
            
            // 模擬 AI 預測
            simulatePrediction(homeTeam, awayTeam);
            
            // 顯示加載動畫
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 預測中...';
            this.disabled = true;
            
            // 2秒後恢復
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-robot"></i> AI 預測';
                this.disabled = false;
            }, 2000);
        });
    });

    // 詳細分析按鈕
    const detailButtons = document.querySelectorAll('.btn-details');
    detailButtons.forEach(button => {
        button.addEventListener('click', function() {
            const matchCard = this.closest('.match-card');
            const homeTeam = matchCard.querySelector('.team:first-child span').textContent;
            const awayTeam = matchCard.querySelector('.team:last-child span').textContent;
            
            // 顯示詳細預測彈窗
            showDetailedPrediction(homeTeam, awayTeam);
        });
    });

    // 模擬 AI 預測
    function simulatePrediction(homeTeam, awayTeam) {
        // 隨機生成預測結果
        const predictions = {
            score: `${Math.floor(Math.random() * 3)}-${Math.floor(Math.random() * 3)}`,
            winProbability: Math.floor(Math.random() * 30) + 40,
            drawProbability: Math.floor(Math.random() * 30) + 20,
            loseProbability: Math.floor(Math.random() * 30) + 20
        };
        
        // 確保總和為 100%
        const total = predictions.winProbability + predictions.drawProbability + predictions.loseProbability;
        predictions.winProbability = Math.round(predictions.winProbability * 100 / total);
        predictions.drawProbability = Math.round(predictions.drawProbability * 100 / total);
        predictions.loseProbability = Math.round(predictions.loseProbability * 100 / total);
        
        // 顯示結果
        showNotification(`🤖 AI 預測 ${homeTeam} vs ${awayTeam}: ${predictions.score} (${predictions.winProbability}% 勝率)`);
    }

    // 顯示詳細預測
    function showDetailedPrediction(homeTeam, awayTeam) {
        // 創建模態彈窗
        const modal = document.createElement('div');
        modal.className = 'prediction-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-chart-bar"></i> ${homeTeam} vs ${awayTeam} 詳細分析</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="analysis-grid">
                        <div class="analysis-item">
                            <h4>歷史對戰</h4>
                            <p>近10次交鋒：${homeTeam} 5勝 2平 3負</p>
                        </div>
                        <div class="analysis-item">
                            <h4>近期狀態</h4>
                            <p>${homeTeam}: 最近5場 3勝1平1負</p>
                            <p>${awayTeam}: 最近5場 2勝2平1負</p>
                        </div>
                        <div class="analysis-item">
                            <h4>傷病情況</h4>
                            <p>${homeTeam}: 2名主力缺陣</p>
                            <p>${awayTeam}: 1名主力缺陣</p>
                        </div>
                        <div class="analysis-item">
                            <h4>天氣影響</h4>
                            <p>比賽當天：晴天，適合進攻</p>
                        </div>
                    </div>
                    
                    <div class="prediction-chart">
                        <h4>預測分布</h4>
                        <div class="chart-bars">
                            <div class="chart-bar home-win">
                                <span>${homeTeam} 勝</span>
                                <div class="bar" style="height: 45%">45%</div>
                            </div>
                            <div class="chart-bar draw">
                                <span>平局</span>
                                <div class="bar" style="height: 30%">30%</div>
                            </div>
                            <div class="chart-bar away-win">
                                <span>${awayTeam} 勝</span>
                                <div class="bar" style="height: 25%">25%</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="recommendation">
                        <h4><i class="fas fa-lightbulb"></i> 專家建議</h4>
                        <p>根據數據分析，${homeTeam}在主場表現強勢，建議關注主隊不敗。大小球方面，雙方近期進攻火力較強，建議關注大球。</p>
                    </div>
                </div>
            </div>
        `;
        
        // 添加樣式
        const modalStyle = document.createElement('style');
        modalStyle.textContent = `
            .prediction-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .modal-content {
                background: white;
                border-radius: 15px;
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                animation: slideUp 0.3s ease;
            }
            
            @keyframes slideUp {
                from {
                    transform: translateY(50px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 30px;
                border-bottom: 1px solid #e8e8e8;
                background: #1890ff;
                color: white;
                border-radius: 15px 15px 0 0;
            }
            
            .modal-header h3 {
                margin: 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .close-modal {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.3s;
            }
            
            .close-modal:hover {
                background: rgba(255,255,255,0.2);
            }
            
            .modal-body {
                padding: 30px;
            }
            
            .analysis-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .analysis-item {
                background: #f0f5ff;
                padding: 20px;
                border-radius: 10px;
            }
            
            .analysis-item h4 {
                color: #1890ff;
                margin-bottom: 10px;
            }
            
            .prediction-chart {
                margin-bottom: 30px;
            }
            
            .chart-bars {
                display: flex;
                justify-content: space-around;
                align-items: flex-end;
                height: 200px;
                padding: 20px;
                background: #fafafa;
                border-radius: 10px;
            }
            
            .chart-bar {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
            }
            
            .chart-bar .bar {
                width: 60px;
                background: #1890ff;
                color: white;
                display: flex;
                align-items: flex-end;
                justify-content: center;
                padding-bottom: 5px;
                border-radius: 5px 5px 0 0;
                font-weight: bold;
            }
            
            .chart-bar.draw .bar {
                background: #52c41a;
            }
            
            .chart-bar.away-win .bar {
                background: #f5222d;
            }
            
            .recommendation {
                background: #fffbe6;
                border: 1px solid #ffe58f;
                border-radius: 10px;
                padding: 20px;
            }
        `;
        
        document.head.appendChild(modalStyle);
        document.body.appendChild(modal);
        
        // 關閉按鈕事件
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

    // 添加自動更新
    let updateInterval;
    
    // 開始實時更新（如果是進行中的比賽）
    if (document.querySelector('.status.live')) {
        updateInterval = setInterval(updateLiveScore, 5000); // 每5秒更新
    }

    // 添加導航欄交互
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                
                // 移除所有 active 類
                navLinks.forEach(l => l.classList.remove('active'));
                
                // 添加 active 類到當前點擊的鏈接
                this.classList.add('active');
                
                // 顯示對應內容
                const linkText = this.textContent.trim();
                showSection(linkText);
            }
        });
    });

    // 顯示對應區域
    function showSection(sectionName) {
        // 這裡可以擴展功能，切換不同區域
        showNotification(`切換到: ${sectionName}`);
    }

    // 初始化動畫
    function initAnimations() {
        // 數字計數動畫
        const numbers = document.querySelectorAll('.number');
        numbers.forEach(number => {
            const finalValue = parseInt(number.textContent);
            let currentValue = 0;
            const increment = finalValue / 50;
            
            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= finalValue) {
                    number.textContent = finalValue;
                    clearInterval(timer);
                } else {
                    number.textContent = Math.round(currentValue);
                }
            }, 30);
        });
        
        // 進度條動畫
        const bars = document.querySelectorAll('.bar-fill');
        bars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.width = width;
            }, 500);
        });
    }

    // 執行初始化動畫
    setTimeout(initAnimations, 1000);

    // 頁面卸載時清理
    window.addEventListener('beforeunload', () => {
        if (updateInterval) {
            clearInterval(updateInterval);
        }
    });
});