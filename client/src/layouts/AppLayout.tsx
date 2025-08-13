import type { PropsWithChildren } from 'react';
import React from 'react';

const AppLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return <div>{children}</div>;
};

export default AppLayout;

