import type { PropsWithChildren } from 'react';
import React from 'react';
import Navbar from "../components/ui/navbar.tsx";

const AppLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return <div>
    <Navbar /> {children}</div>;
};

export default AppLayout;

