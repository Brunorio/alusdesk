import React from 'react';
import { cn } from '../../utils/cn';

export interface PageContentProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContent: React.FC<PageContentProps> = ({ children, className }) => {
  return <div className={cn('w-full flex flex-col gap-6', className)}>{children}</div>;
};

