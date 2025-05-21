'use client';

import { AuthProvider } from '@/context/AuthContext';
import { Content } from '@carbon/react';
import BasicHeader from '@/components/BasicHeader/BasicHeader';
import BasicFooter from '@/components/BasicFooter/BasicFooter';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <div className="layout">
        <BasicHeader />
        <main className="content">
          {children}
        </main>
        <BasicFooter />
      </div>
    </AuthProvider>
  );
}
