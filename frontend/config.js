// 足球預測系統配置文件
const Config = {
    // API 配置
    API: {
        FOOTBALL_DATA: {
            BASE_URL: 'https://api.football-data.org/v4', // 使用官方推荐的v4接口[citation:3]
            API_KEY: 'd32d44ccb25d4562bbe9ac66939dac91', // 务必将引号内的内容换成你的密钥
            // 免费套餐限制：通常为每分钟10次请求[citation:2]
        }
        
        // 備用 API：OpenFootball（不需要 API Key）
        OPEN_FOOTBALL: {
            BASE_URL: 'https://api.openfootball.org',
            COMPETITIONS: '/competitions.json',
            MATCHES: '/matches.json'
        },
        
        // 天氣 API
        WEATHER: {
            BASE_URL: 'https://api.openweathermap.org/data/2.5',
            API_KEY: '' // 可選
        }
    },
    
    // 本地配置
    LOCAL: {
        USE_LOCAL_DATA: true, // 首次使用本地數據
        CACHE_DURATION: 5 * 60 * 1000, // 5分鐘緩存
        BACKUP_FILE: 'data/backup-matches.json'
    },
    
    // 預測配置
    PREDICTION: {
        MODEL_VERSION: '1.0',
        UPDATE_INTERVAL: 60 * 1000, // 每分鐘更新
        MIN_CONFIDENCE: 0.6 // 最小信心度
    },
    
    // 界面配置
    UI: {
        DEFAULT_TIMEZONE: 'Asia/Hong_Kong',
        LANGUAGE: 'zh-Hant',
        THEME: 'light'
    }
};

// 檢查環境
Config.isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1';

export default Config;