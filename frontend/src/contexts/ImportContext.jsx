import { createContext, useContext, useState } from 'react';

const ImportContext = createContext({});

export const useImport = () => {
  const context = useContext(ImportContext);
  if (!context) {
    throw new Error('useImport must be used within ImportProvider');
  }
  return context;
};

export const ImportProvider = ({ children }) => {
  const [importedData, setImportedData] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [importStats, setImportStats] = useState({
    totalRows: 0,
    validRows: 0,
  });

  const setData = (data) => {
    setImportedData(data);
  };

  const setErrors = (errors) => {
    setImportErrors(errors || []);
  };

  const setStats = (stats) => {
    setImportStats(stats);
  };

  const addCall = (call) => {
    setImportedData([...importedData, call]);
  };

  const updateCall = (index, updatedCall) => {
    const newData = [...importedData];
    newData[index] = updatedCall;
    setImportedData(newData);
  };

  const removeCall = (index) => {
    setImportedData(importedData.filter((_, i) => i !== index));
  };

  const clearData = () => {
    setImportedData([]);
    setImportErrors([]);
    setImportStats({ totalRows: 0, validRows: 0 });
  };

  const value = {
    importedData,
    importErrors,
    importStats,
    setData,
    setErrors,
    setStats,
    addCall,
    updateCall,
    removeCall,
    clearData,
  };

  return (
    <ImportContext.Provider value={value}>
      {children}
    </ImportContext.Provider>
  );
};
