import React, { useMemo } from 'react';
import {
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    Radar, Legend, Tooltip, ResponsiveContainer
} from 'recharts';
import { PredictionSet } from '../../types';

interface PredictionRadarProps {
    predictions: PredictionSet;
    type: '1x2' | 'halfFull' | 'correctScore' | 'handicap';
}

const PredictionRadar: React.FC<PredictionRadarProps> = ({ predictions, type }) => {
    // 1. 根据预测类型转换数据
    const chartData = useMemo(() => {
        switch (type) {
            case '1x2':
                return [
                    { subject: '主勝', probability: predictions?.matchOutcome?.homeWin?.probability || 0 },
                    { subject: '和局', probability: predictions?.matchOutcome?.draw?.probability || 0 },
                    { subject: '客勝', probability: predictions?.matchOutcome?.awayWin?.probability || 0 }
                ];
            case 'halfFull':
                // 半全场9种组合
                return predictions?.halfFull?.map(pred => ({
                    subject: pred.combination,
                    probability: pred.probability,
                    odds: pred.odds
                })) || [];
            // 其他类型处理...
            default:
                return [];
        }
    }, [predictions, type]);

    // 2. 计算置信区间
    const confidenceIntervals = useMemo(() => {
        return chartData.map(item => ({
            ...item,
            min: Math.max(0, item.probability - 0.1),
            max: Math.min(1, item.probability + 0.1)
        }));
    }, [chartData]);

    // 3. 自定义Tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <Paper elevation={3} sx={{ p: 1 }}>
                    <Typography variant="body2">{data.subject}</Typography>
                    <Typography variant="h6" color="primary">
                        {(data.probability * 100).toFixed(1)}%
                    </Typography>
                    {data.odds && (
                        <Typography variant="caption" color="text.secondary">
                            預期賠率: {data.odds.toFixed(2)}
                        </Typography>
                    )}
                </Paper>
            );
        }
        return null;
    };

    if (chartData.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary">暫無預測數據</Typography>
            </Box>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={confidenceIntervals}>
                <PolarGrid stroke="#ddd" />
                <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fontSize: 12 }}
                />
                <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 1]}
                    tickFormatter={(value) => `${(value * 100)}%`}
                />
                
                <Radar
                    name="預測概率"
                    dataKey="probability"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                />
                
                <Radar
                    name="置信區間"
                    dataKey="max"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.2}
                />
                
                <Legend />
                <Tooltip content={<CustomTooltip />} />
            </RadarChart>
        </ResponsiveContainer>
    );
};

export default PredictionRadar;