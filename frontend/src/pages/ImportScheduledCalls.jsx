import { ExcelImport } from '../components/ExcelImport';

export const ImportScheduledCalls = () => {
  return (
    <div>
      <ExcelImport onDataReady={() => console.log('Data ready')} />
    </div>
  );
};
