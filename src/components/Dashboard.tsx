import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Grid, Box, Paper, Typography, Chip, ToggleButtonGroup,
    ToggleButton, useMediaQuery, useTheme
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService } from '../services/DataService';
import { Match, PredictionType } from '../types';

// 子组件导入
import MatchList from './MatchList';
import OddsComparison from './OddsComparison';
import PredictionRadar from './visualizations/PredictionRadar';
import ScoreHeatmap from './visualizations/ScoreHeatmap';
import OddsTrendChart from './visualizations/OddsTrendChart';
import RiskIndicator from './RiskIndicator';

const Dashboard: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isLargeScreen = useMediaQuery('(min-width: 1920px)');

    // 状态管理
    const [matches, setMatches] = useState<Match[]>([]);
    const [liveMatches, setLiveMatches] = useState<Match[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [predictionType, setPredictionType] = useState<PredictionType>('1x2');
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    // 1. 初始化数据加载
    useEffect(() => {
        const loadInitialData = async () => {
            const [upcoming, live] = await Promise.all([
                dataService.getUpcomingMatches(),
                dataService.getLiveMatches()
            ]);
            
            setMatches(upcoming);
            setLiveMatches(live);
            
            if (upcoming.length > 0) {
                setSelectedMatch(upcoming[0]);
            }
        };

        loadInitialData();
        
        // 每30秒更新一次非实时数据
        const interval = setInterval(() => {
            dataService.getUpcomingMatches().then(setMatches);
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // 2. 实时数据监听
    useEffect(() => {
        const handleDataUpdate = (event: Event) => {
            const { type, data } = (event as CustomEvent).detail;
            
            switch (type) {
                case 'match':
                    // 更新特定比赛
                    setMatches(prev => prev.map(m => 
                        m.id === data.id ? { ...m, ...data } : m
                    ));
                    setLiveMatches(prev => prev.map(m => 
                        m.id === data.id ? { ...m, ...data } : m
                    ));
                    break;
                    
                case 'event':
                    // 处理红黄牌等事件
                    if (selectedMatch?.id === data.matchId) {
                        showLiveEventNotification(data);
                    }
                    break;
            }
            
            setLastUpdate(new Date());
        };

        window.addEventListener('footballDataUpdate', handleDataUpdate);
        return () => window.removeEventListener('footballDataUpdate', handleDataUpdate);
    }, [selectedMatch]);

    // 3. 响应式布局配置
    const gridConfig = useMemo(() => {
        if (isMobile) {
            return { left: 12, center: 12, right: 12 };
        }
        if (isLargeScreen) {
            return { left: 3, center: 6, right: 3 };
        }
        return { left: 4, center: 5, right: 3 };
    }, [isMobile, isLargeScreen]);

    // 4. 虚拟滚动优化的大型列表
    const MemoizedMatchList = useMemo(() => (
        <MatchList 
            matches={matches}
            liveMatches={liveMatches}
            selectedId={selectedMatch?.id}
            onSelectMatch={setSelectedMatch}
        />
    ), [matches, liveMatches, selectedMatch?.id]);

    // 5. 预测类型切换处理
    const handlePredictionTypeChange = useCallback((
        _event: React.MouseEvent<HTMLElement>,
        newType: PredictionType | null
    ) => {
        if (newType !== null) {
            setPredictionType(newType);
        }
    }, []);

    return (
        <Box sx={{ 
            p: { xs: 1, md: 2 },
            maxWidth: '100vw',
            overflowX: 'hidden'
        }}>
            {/* 顶部状态栏 */}
            <Paper elevation={2} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" component="h1">
                    足智彩實時賽事分析與預測系統
                </Typography>
                <Box>
                    <Chip 
                        label={`${liveMatches.length} 場進行中`}
                        color="error"
                        size="small"
                    />
                    <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
                        最後更新: {lastUpdate.toLocaleTimeString()}
                    </Typography>
                </Box>
            </Paper>

            {/* 主仪表板网格 */}
            <Grid container spacing={2}>
                {/* 左侧面板 (30%) - 赛事列表 */}
                <Grid item xs={12} md={gridConfig.left}>
                    <Paper elevation={1} sx={{ p: 2, height: '85vh', overflow: 'hidden' }}>
                        <Typography variant="subtitle1" gutterBottom>
                            賽事列表
                        </Typography>
                        <Box sx={{ height: 'calc(85vh - 60px)', overflow: 'auto' }}>
                            {MemoizedMatchList}
                        </Box>
                    </Paper>
                </Grid>

                {/* 中央区域 (50%) - 赛事详情与可视化 */}
                <Grid item xs={12} md={gridConfig.center}>
                    <AnimatePresence mode="wait">
                        {selectedMatch ? (
                            <motion.div
                                key={selectedMatch.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* 比赛基本信息 */}
                                <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="h6">
                                                {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {selectedMatch.competition} • 
                                                {selectedMatch.time.toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                        <Chip 
                                            label={selectedMatch.status}
                                            color={selectedMatch.status === 'LIVE' ? 'error' : 'default'}
                                        />
                                    </Box>
                                </Paper>

                                {/* 预测类型选择器 */}
                                <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                                    <ToggleButtonGroup
                                        value={predictionType}
                                        exclusive
                                        onChange={handlePredictionTypeChange}
                                        size="small"
                                        fullWidth
                                    >
                                        <ToggleButton value="1x2">主客和</ToggleButton>
                                        <ToggleButton value="halfFull">半全場</ToggleButton>
                                        <ToggleButton value="correctScore">精準比分</ToggleButton>
                                        <ToggleButton value="handicap">讓球盤</ToggleButton>
                                    </ToggleButtonGroup>
                                </Paper>

                                {/* 可视化图表区域 */}
                                <Grid container spacing={2}>
                                    <Grid item xs={12} lg={6}>
                                        <Paper elevation={1} sx={{ p: 2, height: 300 }}>
                                            <PredictionRadar 
                                                predictions={selectedMatch.predictions}
                                                type={predictionType}
                                            />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} lg={6}>
                                        <Paper elevation={1} sx={{ p: 2, height: 300 }}>
                                            {predictionType === 'correctScore' ? (
                                                <ScoreHeatmap 
                                                    predictions={selectedMatch.predictions.scorePredictions}
                                                />
                                            ) : (
                                                <OddsTrendChart 
                                                    oddsHistory={selectedMatch.odds?.history || []}
                                                />
                                            )}
                                        </Paper>
                                    </Grid>
                                </Grid>

                                {/* 赔率比较 */}
                                <Box sx={{ mt: 2 }}>
                                    <OddsComparison odds={selectedMatch.odds} />
                                </Box>
                            </motion.div>
                        ) : (
                            <Paper sx={{ p: 4, textAlign: 'center' }}>
                                <Typography color="text.secondary">
                                    請選擇一場賽事查看詳細分析
                                </Typography>
                            </Paper>
                        )}
                    </AnimatePresence>
                </Grid>

                {/* 右侧面板 (20%) - AI预测摘要 */}
                <Grid item xs={12} md={gridConfig.right}>
                    <Paper elevation={1} sx={{ p: 2, height: '85vh', overflow: 'auto' }}>
                        {selectedMatch && (
                            <>
                                <Typography variant="subtitle1" gutterBottom>
                                    AI預測摘要
                                </Typography>
                                
                                <RiskIndicator 
                                    confidence={selectedMatch.predictions.confidence}
                                    accuracy={selectedMatch.predictions.historicalAccuracy}
                                    riskLevel={selectedMatch.predictions.riskAssessment.level}
                                />

                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        模型信心度
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box sx={{ flexGrow: 1, mr: 1 }}>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={selectedMatch.predictions.confidence * 100}
                                                color={
                                                    selectedMatch.predictions.confidence > 0.7 ? 'success' :
                                                    selectedMatch.predictions.confidence > 0.5 ? 'warning' : 'error'
                                                }
                                            />
                                        </Box>
                                        <Typography variant="body2">
                                            {(selectedMatch.predictions.confidence * 100).toFixed(1)}%
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        歷史準確率
                                    </Typography>
                                    <Typography variant="h6">
                                        {(selectedMatch.predictions.historicalAccuracy * 100).toFixed(1)}%
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        基於相似賽事 {selectedMatch.predictions.sampleSize} 場樣本
                                    </Typography>
                                </Box>

                                {/* 价值投注识别 */}
                                {selectedMatch.predictions.riskAssessment.valueBetFlag && (
                                    <Paper elevation={0} sx={{ 
                                        mt: 3, 
                                        p: 2, 
                                        bgcolor: 'success.light',
                                        border: '1px solid',
                                        borderColor: 'success.main'
                                    }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            💎 價值投注機會
                                        </Typography>
                                        <Typography variant="body2">
                                            模型檢測到賠率與預測概率存在正向差距
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            預期價值: +{selectedMatch.predictions.riskAssessment.expectedValue}%
                                        </Typography>
                                    </Paper>
                                )}
                            </>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

// 辅助函数：显示实时事件通知
const showLiveEventNotification = (event: LiveEvent) => {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`⚽ ${event.type}: ${event.player}`, {
            body: event.description,
            icon: '/football-icon.png'
        });
    }
};

export default Dashboard;