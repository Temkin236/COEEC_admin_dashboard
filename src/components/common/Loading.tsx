import React from 'react';
import { Spin } from 'antd';

interface LoadingProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
  fullScreen?: boolean;
  className?: string;
  indicator?: React.ReactElement;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'large', 
  tip, 
  fullScreen = false,
  className = '',
  indicator
}) => {
  if (fullScreen) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center bg-white/80 z-50 ${className}`}>
        <Spin indicator={indicator} size={size} tip={tip} />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center p-12 ${className}`}>
      <Spin indicator={indicator} size={size} tip={tip} />
    </div>
  );
};

export default Loading;
