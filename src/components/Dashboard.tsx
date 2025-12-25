import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Alert,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import { DataService } from '../services/DataService';

// 定义比赛接口
interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  status: string;
  score: { home: number; away: number };
  time: Date;
}

// 定义预测接口
interface Prediction {
  homeWin: number;
  draw: number;
  awayWin: number;
  confidence: number;
}

// 比赛卡片组件
const MatchCard: React.FC<{ match: Match; prediction: Prediction }> = ({ match, prediction }) => {
  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        {match.homeTeam} vs {match.awayTeam}
      </Typography>
      
      <Typography color="textSecondary" gutterBottom>
        {match.competition} • {new Date(match.time).toLocaleTimeString()}
      </Typography>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" gutterBottom>预测概率</Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ width: 60 }}>主胜</Typography>
          <Box sx={{ flexGrow: 1, mr: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={prediction.homeWin * 100}
              color="primary"
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
          <Typography>{(prediction.homeWin * 100).toFixed(1)}%</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ width: 60 }}>平局</Typography>
          <Box sx={{ flexGrow: 1, mr: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={prediction.draw * 100}
              color="warning"
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
          <Typography>{(prediction.draw * 100).toFixed(1)}%</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ width: 60 }}>客胜</Typography>
          <Box sx={{ flexGrow: 1, mr: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={prediction.awayWin * 100}
              color="secondary"
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
          <Typography>{(prediction.awayWin * 100).toFixed(1)}%</Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption">信心度: {(prediction.confidence * 100).toFixed(0)}%</Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: match.status === 'LIVE' ? '#ff5252' : '#757575',
            fontWeight: match.status === 'LIVE' ? 'bold' : 'normal'
          }}
        >
          {match.status === 'LIVE' ? '⚡ 进行中' : '⏰ 未开始'}
        </Typography>
      </Box>
    </Paper>
  );
};

// 主仪表板组件
export const Dashboard: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<number, Prediction>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    
    // 每30秒更新一次数据
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await DataService.getMatches();
      
      // 转换API数据
      const matchList: Match[] = data.map((item: any) => ({
        id: item.id,
        homeTeam: item.homeTeam?.name || '未知主队',
        awayTeam: item.awayTeam?.name || '未知客队',
        competition: item.competition?.name || '未知联赛',
        status: item.status || 'SCHEDULED',
        score: item.score?.fullTime || { home: 0, away: 0 },
        time: new Date(item.utcDate || new Date())
      }));

      setMatches(matchList);

      // 为每场比赛生成预测
      const preds: Record<number, Prediction> = {};
      matchList.forEach(match => {
        preds[match.id] = DataService.generatePrediction();
      });
      setPredictions(preds);

      setError(null);
    } catch (err) {
      console.error('加载数据失败:', err);
      setError('无法加载比赛数据，请检查网络连接或API密钥');
      
      // 如果API失败，显示示例数据
      if (matches.length === 0) {
        const sampleMatches: Match[] = [
          {
            id: 1,
            homeTeam: '曼联',
            awayTeam: '曼城',
            competition: '英超联赛',
            status: 'SCHEDULED',
            score: { home: 0, away: 0 },
            time: new Date(Date.now() + 3600000)
          },
          {
            id: 2,
            homeTeam: '皇马',
            awayTeam: '巴萨',
            competition: '西甲联赛',
            status: 'LIVE',
            score: { home: 1, away: 1 },
            time: new Date()
          },
          {
            id: 3,
            homeTeam: '拜仁慕尼黑',
            awayTeam: '多特蒙德',
            competition: '德甲联赛',
            status: 'SCHEDULED',
            score: { home: 0, away: 0 },
            time: new Date(Date.now() + 7200000)
          }
        ];
        
        setMatches(sampleMatches);
        const preds: Record<number, Prediction> = {};
        sampleMatches.forEach(match => {
          preds[match.id] = DataService.generatePrediction();
        });
        setPredictions(preds);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && matches.length === 0) {
    return (
      <Container sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="primary">
          正在加载比赛数据...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 头部标题 */}
      <Paper elevation={3} sx={{ 
        p: 3, 
        mb: 3, 
        background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
        borderRadius: 2
      }}>
        <Typography variant="h4" color="white" gutterBottom sx={{ fontWeight: 'bold' }}>
          ⚽ 足智彩实时赛事分析平台
        </Typography>
        <Typography variant="subtitle1" color="white">
          专业足球数据分析与AI预测 | 实时更新 | 多维度可视化
        </Typography>
      </Paper>

      {/* 错误提示 */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body2">{error}</Typography>
          <Typography variant="caption">已显示示例数据供演示使用</Typography>
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* 左侧：比赛列表 */}
        <Box sx={{ flex: { md: 2 } }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                今日赛事预测
              </Typography>
              <Typography variant="caption" color="textSecondary">
                数据更新时间: {new Date().toLocaleTimeString()}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="textSecondary" paragraph>
              基于AI模型分析的实时预测结果，数据每30秒更新
            </Typography>

            <Box sx={{ maxHeight: '70vh', overflow: 'auto', pr: 1 }}>
              {matches.map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  prediction={predictions[match.id] || {
                    homeWin: 0.33,
                    draw: 0.33,
                    awayWin: 0.34,
                    confidence: 0.5
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Box>

        {/* 右侧：统计信息和声明 */}
        <Box sx={{ flex: { md: 1 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* 统计信息 */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span role="img" aria-label="stats">📊</span> 统计信息
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pb: 2, borderBottom: '1px solid #333' }}>
              <Typography variant="body2">总比赛数</Typography>
              <Typography variant="h6">{matches.length}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pb: 2, borderBottom: '1px solid #333' }}>
              <Typography variant="body2">进行中</Typography>
              <Typography variant="h6" color="#ff5252">
                {matches.filter(m => m.status === 'LIVE').length}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">未开始</Typography>
              <Typography variant="h6">
                {matches.filter(m => m.status !== 'LIVE').length}
              </Typography>
            </Box>
          </Paper>

          {/* 重要声明 */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#ff9800' }}>
              <span role="img" aria-label="warning">⚠️</span> 重要声明
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <span style={{ color: '#4caf50', fontWeight: 'bold' }}>1.</span>
                本平台仅提供数据分析，不构成投注建议
              </Typography>
              
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <span style={{ color: '#4caf50', fontWeight: 'bold' }}>2.</span>
                预测结果基于历史数据，仅供参考
              </Typography>
              
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <span style={{ color: '#4caf50', fontWeight: 'bold' }}>3.</span>
                用户需年满18岁方可使用本服务
              </Typography>
              
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, color: '#ff5252' }}>
                <span style={{ fontWeight: 'bold' }}>4.</span>
                理性对待预测结果，自负盈亏
              </Typography>
            </Box>
          </Paper>

          {/* API状态 */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: '#1a1a1a' }}>
            <Typography variant="body2" gutterBottom>API状态</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: error ? '#ff9800' : '#4caf50',
                animation: error ? 'pulse 1.5s infinite' : 'none'
              }} />
              <Typography variant="caption">
                {error ? '使用示例数据' : '实时数据连接正常'}
              </Typography>
            </Box>
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              如需实时数据，请检查API密钥配置
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* 页脚 */}
      <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #333', textAlign: 'center' }}>
        <Typography variant="caption" color="textSecondary">
          足智彩实时赛事分析平台 © {new Date().getFullYear()} | 版本 1.0.0
        </Typography>
      </Box>
    </Container>
  );
};

// 添加CSS动画
const style = document.createElement('style');
style.innerHTML = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;
document.head.appendChild(style);

export default Dashboard;