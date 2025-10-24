import { Suspense } from 'react';
import ReportFamilyServer from '@/components/reportes/ReportFamilyServer';

const ReporteMiembro = () => {
  
  return (
    
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
  }>
    <ReportFamilyServer />
  </Suspense>

  );
};

export default ReporteMiembro;

export const dynamic = 'force-dynamic';