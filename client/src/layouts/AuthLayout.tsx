import type { PropsWithChildren } from 'react';
import React from 'react';

const AuthLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return <div>{children}</div>;
};

export default AuthLayout;

