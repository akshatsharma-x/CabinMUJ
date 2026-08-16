import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'orange';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const baseClass = 'badge';
  const variantClass = variant === 'orange' ? 'badge-orange' : '';
  
  return (
    <span className={`${baseClass} ${variantClass} ${className}`}>
      {children}
    </span>
  );
}
