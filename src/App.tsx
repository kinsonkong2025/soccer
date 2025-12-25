import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// 最简单的暗色主题
const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

// 最简单的仪表板组件
const SimpleDashboard = () => {
  return (
    <div style={{ padding: 20, backgroundColor: '#121212', minHeight: '100vh', color: 'white' }}>
      <h1>⚽ 足球预测平台</h1>
      <p>正在建设中...</p>
      <div style={{ background: '#1e1e1e', padding: 20, borderRadius: 8 }}>
        <h3>功能即将上线</h3>
        <ul>
          <li>实时比赛数据</li>
          <li>AI预测分析</li>
          <li>数据可视化</li>
        </ul>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SimpleDashboard />
    </ThemeProvider>
  );
}

export default App;