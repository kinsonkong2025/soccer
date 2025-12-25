import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress,
  Alert
} from '@mui/material';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      setMatches([
        {
          id: 1,
          homeTeam: '曼联',
          awayTeam: '曼城',
          competition: '英超联赛',
          status: '即将开始',
          time: new Date(Date.now() + 3600000)
        },
        {
          id: 2,
          homeTeam: '皇家马德里',
          awayTeam: '巴塞罗那',
          competition: '西甲联赛',
          status: '进行中',
          time: new Date()
        },
        {
          id: 3,
          homeTeam: '拜仁慕尼黑',
          awayTeam: '多特蒙德',
          competition: '德甲联赛',
          status: '即将开始',
          time: new Date(Date.now() + 7200000)
        }
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="primary">
          正在加载足球预测平台...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 标题 */}
      <Paper elevation={3} sx={{ 
        p: 3, 
        mb: 4, 
        background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
        borderRadius: 2
      }}>
        <Typography variant="h3" color="white" gutterBottom sx={{ fontWeight: 'bold' }}>
          ⚽ 足智彩实时赛事分析平台
        </Typography>
        <Typography variant="h6" color="white">
          专业级足球数据可视化与AI预测系统
        </Typography>
      </Paper>

      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* 比赛列表 */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          今日赛事
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {matches.map((match) => (
            <Card key={match.id} elevation={1}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6">
                      {match.homeTeam} vs {match.awayTeam}
                    </Typography>
                    <Typography color="textSecondary">
                      {match.competition}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">
                      {match.status}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {match.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </Box>
                
                {/* 模拟预测 */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>预测概率</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ width: 60 }}>主胜</Typography>
                    <Box sx={{ flexGrow: 1, mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={45}
                        color="primary"
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>
                    <Typography>45%</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ width: 60 }}>平局</Typography>
                    <Box sx={{ flexGrow: 1, mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={30}
                        color="warning"
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>
                    <Typography>30%</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ width: 60 }}>客胜</Typography>
                    <Box sx={{ flexGrow: 1, mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={25}
                        color="secondary"
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>
                    <Typography>25%</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Paper>

      {/* 功能卡片 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              📊 实时数据
            </Typography>
            <Typography variant="body2">
              实时比赛数据、控球率、射门、角球等统计
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              🤖 AI预测
            </Typography>
            <Typography variant="body2">
              基于机器学习模型的精准比分预测
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              📈 分析工具
            </Typography>
            <Typography variant="body2">
              赔率对比、价值投注识别、风险评估
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 部署状态 */}
      <Paper elevation={2} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>系统状态</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2">前端运行状态</Typography>
            <Typography variant="h6" color="success.main">正常 ✓</Typography>
          </Box>
          <Box>
            <Typography variant="body2">数据连接</Typography>
            <Typography variant="h6" color="warning.main">模拟数据</Typography>
          </Box>
          <Box>
            <Typography variant="body2">版本</Typography>
            <Typography variant="h6">v1.0.0</Typography>
          </Box>
        </Box>
      </Paper>

      {/* 免责声明 */}
      <Alert severity="info" sx={{ mt: 4, borderRadius: 2 }}>
        <Typography variant="body2">
          ⚠️ 免责声明：本平台仅提供数据分析参考，不构成投注建议。用户需年满18岁，理性对待预测结果。
        </Typography>
      </Alert>
    </Container>
  );
};

export default Dashboard;