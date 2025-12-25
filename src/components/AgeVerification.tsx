import React, { useState, useEffect } from 'react';
import { 
    Modal, Paper, Typography, Button, Box,
    FormControlLabel, Checkbox
} from '@mui/material';

const AgeVerification: React.FC = () => {
    const [verified, setVerified] = useState<boolean>(
        () => localStorage.getItem('ageVerified') === 'true'
    );
    const [open, setOpen] = useState<boolean>(!verified);
    const [agreed, setAgreed] = useState<boolean>(false);

    const handleVerify = (): void => {
        if (agreed) {
            localStorage.setItem('ageVerified', 'true');
            setVerified(true);
            setOpen(false);
        }
    };

    // 每24小时重新验证
    useEffect(() => {
        const lastVerified = localStorage.getItem('verificationTimestamp');
        if (lastVerified) {
            const hoursSince = (Date.now() - parseInt(lastVerified)) / (1000 * 60 * 60);
            if (hoursSince > 24) {
                setOpen(true);
            }
        }
    }, []);

    if (verified) return null;

    return (
        <Modal open={open} onClose={() => {}}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '90%', md: 500 }
            }}>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h5" gutterBottom color="error">
                        ⚠️ 年齡驗證與責任聲明
                    </Typography>
                    
                    <Box sx={{ my: 3, maxHeight: '40vh', overflow: 'auto' }}>
                        <Typography paragraph>
                            1. 本系統僅提供賽事數據分析與預測，不涉及任何真實投注功能
                        </Typography>
                        <Typography paragraph>
                            2. 您必須年滿18歲方可使用本系統
                        </Typography>
                        <Typography paragraph>
                            3. 所有預測結果基於歷史數據與AI模型計算，僅供參考，不構成投注建議
                        </Typography>
                        <Typography paragraph>
                            4. 足球博彩具有風險，請理性對待，自負盈虧
                        </Typography>
                        <Typography paragraph color="error">
                            5. 如需戒賭幫助，請撥打: 0800-000-123 (24小時免費專線)
                        </Typography>
                    </Box>
                    
                    <FormControlLabel
                        control={
                            <Checkbox 
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                            />
                        }
                        label="我確認已年滿18歲，並理解以上風險聲明"
                    />
                    
                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button 
                            variant="contained" 
                            color="primary"
                            onClick={handleVerify}
                            disabled={!agreed}
                            fullWidth
                        >
                            確認進入
                        </Button>
                        <Button 
                            variant="outlined"
                            onClick={() => window.location.href = 'https://www.google.com'}
                            fullWidth
                        >
                            離開網站
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Modal>
    );
};