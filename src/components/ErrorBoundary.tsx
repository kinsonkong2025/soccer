import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Box } from '@mui/material';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('前端错误:', error, errorInfo);
        this.setState({ errorInfo });
        
        // 发送错误到监控服务
        if (window.navigator.onLine) {
            fetch('/api/log-error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: error.toString(),
                    stack: errorInfo.componentStack,
                    url: window.location.href,
                    timestamp: new Date().toISOString()
                })
            });
        }
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return this.props.fallback || (
                <Box sx={{ p: 3 }}>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        抱歉，系統發生錯誤
                    </Alert>
                    <Button 
                        variant="contained" 
                        onClick={() => window.location.reload()}
                    >
                        重新載入
                    </Button>
                </Box>
            );
        }

        return this.props.children;
    }
}