// 复制这个代码到文件中
import React from 'react';
import { Card, CardContent, Typography, LinearProgress, Box } from '@mui/material';
import { Match, Prediction } from '../types';

interface MatchCardProps {
  match: Match;
  prediction: Prediction;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, prediction }) => {
  return (
    <Card sx={{ mb: 2, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {match.homeTeam} vs {match.awayTeam}
        </Typography>
        
        <Typography color="textSecondary" gutterBottom>
          {match.competition} • {new Date(match.time).toLocaleTimeString()}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">预测概率</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ width: 60 }}>主胜</Typography>
            <Box sx={{ flexGrow: 1, mr: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={prediction.homeWin * 100}
                color="primary"
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
              />
            </Box>
            <Typography>{(prediction.draw * 100).toFixed(1)}%</Typography>
          </Box>

          <Box sx={{ display: '-flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ width: 60 }}>客胜</Typography>
            <Box sx={{ flexGrow: 1, mr: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={prediction.awayWin * 100}
                color="secondary"
              />
            </Box>
            <Typography>{(prediction.awayWin * 100).toFixed(1)}%</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption">信心度: {(prediction.confidence * 100).toFixed(0)}%</Typography>
          <Typography variant="caption" color={match.status === 'LIVE' ? 'error' : 'textSecondary'}>
            {match.status === 'LIVE' ? '⚡ 进行中' : '⏰ 未开始'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};