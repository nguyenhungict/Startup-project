import type { PropsWithChildren } from 'react';
import React from 'react';
import Navbar from "../components/ui/navbar.tsx";
import Footer from '../components/ui/footer.tsx';

const AppLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return <div>
    <Navbar /> {children}
    <Footer /></div>;
};

export default AppLayout;

