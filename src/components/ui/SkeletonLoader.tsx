import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  lines = 1
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-none';
      case 'rounded':
        return 'rounded-lg';
      case 'text':
      default:
        return 'rounded';
    }
  };

  const getSkeletonClasses = () =>
    cn(
      'animate-pulse bg-muted',
      getVariantClasses(),
      className
    );

  const style = {
    width: width || (variant === 'text' ? '100%' : '40px'),
    height: height || (variant === 'text' ? '1rem' : '40px'),
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'animate-pulse bg-muted rounded',
              index === lines - 1 ? 'w-3/4' : 'w-full'
            )}
            style={{ height: height || '1rem' }}
          />
        ))}
      </div>
    );
  }

  return <div className={getSkeletonClasses()} style={style} />;
};

// Pre-built skeleton components for common patterns
export const CardSkeleton: React.FC = () => (
  <div className="bg-background border border-border rounded-lg p-6 space-y-4">
    <div className="flex items-center space-x-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton width="40%" height={20} />
        <Skeleton width="60%" height={16} />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton lines={2} height={14} />
    </div>
  </div>
);

export const StatCardSkeleton: React.FC = () => (
  <div className="bg-background border border-border rounded-lg p-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton width={40} height={40} variant="circular" />
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={24} />
      </div>
    </div>
  </div>
);

export const NotificationSkeleton: React.FC = () => (
  <div className="p-3 rounded-lg border border-border space-y-3">
    <div className="flex items-start gap-3">
      <Skeleton variant="circular" width={16} height={16} />
      <div className="flex-1 space-y-2">
        <Skeleton width="70%" height={14} />
        <Skeleton lines={2} height={12} />
        <div className="flex items-center justify-between">
          <Skeleton width={80} height={12} />
          <Skeleton width={60} height={20} />
        </div>
      </div>
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-2">
    {/* Header */}
    <div className="flex space-x-4 p-4 border-b border-border">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} width={100} height={16} />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4 p-4 border-b border-border">
        {Array.from({ length: 4 }).map((_, colIndex) => (
          <div key={colIndex} className="flex-1">
            <Skeleton width={120} height={14} />
          </div>
        ))}
      </div>
    ))}
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <StatCardSkeleton key={index} />
      ))}
    </div>
    
    {/* Notifications Section */}
    <div className="bg-background border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton width={200} height={20} />
        <Skeleton width={20} height={20} variant="circular" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <NotificationSkeleton key={index} />
        ))}
      </div>
    </div>
    
    {/* Main Content Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    </div>
  </div>
);
