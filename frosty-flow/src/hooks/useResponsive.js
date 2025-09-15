// 响应式设计Hook
import { useState, useEffect } from 'react';

const breakpoints = {
  mobile: 640,   // 对应 CSS @media (max-width: 640px) - 手机和小屏设备
  tablet: 1023,  // 对应 CSS @media (max-width: 1023px) - 平板设备
  desktop: 1024, // 桌面端起始点
  large: 1400
};

export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  const [deviceType, setDeviceType] = useState('desktop');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });

      // 设备类型判断 - 修复逻辑
      if (width <= breakpoints.mobile) {
        setDeviceType('mobile');
        setIsMobile(true);
        setIsTablet(false);
        setIsDesktop(false);
      } else if (width <= breakpoints.tablet) {
        setDeviceType('tablet');
        setIsMobile(false);
        setIsTablet(true);
        setIsDesktop(false);
      } else {
        setDeviceType('desktop');
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      }
      
      console.log('Screen width:', width, 'Device type:', width <= breakpoints.mobile ? 'mobile' : width <= breakpoints.tablet ? 'tablet' : 'desktop');
    };

    // 初始化
    handleResize();

    // 添加事件监听
    window.addEventListener('resize', handleResize);

    // 清理
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 检测是否为触摸设备
  const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  // 检测是否为iOS设备
  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  };

  // 检测是否为Android设备
  const isAndroid = () => {
    return /Android/.test(navigator.userAgent);
  };

  // 获取安全区域
  const getSafeArea = () => {
    if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 };
    
    const computedStyle = getComputedStyle(document.documentElement);
    return {
      top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)')) || 0,
      bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
      left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)')) || 0,
      right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)')) || 0,
    };
  };

  return {
    screenSize,
    deviceType,
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice: isTouchDevice(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    safeArea: getSafeArea(),
    breakpoints
  };
};

// 媒体查询Hook
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event) => setMatches(event.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

// 滑动手势Hook
export const useSwipe = (onSwipeLeft, onSwipeRight, threshold = 50) => {
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e) => {
    if (!startX || !startY) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const deltaX = startX - endX;
    const deltaY = startY - endY;

    // 只有水平滑动距离大于垂直滑动距离时才触发
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        onSwipeLeft && onSwipeLeft();
      } else {
        onSwipeRight && onSwipeRight();
      }
    }

    setStartX(0);
    setStartY(0);
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd
  };
};