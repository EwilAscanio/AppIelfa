import { Suspense } from 'react';
import ReportMemberServer from '@/components/reportes/ReportMemberServer';

const ReporteMiembro = () => {
  
  return (
    
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
  }>
    <ReportMemberServer />
  </Suspense>

  );
};

export default ReporteMiembro;