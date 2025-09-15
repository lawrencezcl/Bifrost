import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ConfigProvider, theme, App as AntApp } from 'antd';
import { Provider } from 'react-redux';
import store from './store';
import AppSimple from './App-simple';
import './index.css';

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 8,
          },
        }}
      >
        <AntApp>
          <Router>
            <AppSimple />
          </Router>
        </AntApp>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
