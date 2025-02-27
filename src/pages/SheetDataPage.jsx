import React from 'react';
import GoogleSheetsReader from '../components/GoogleSheetsReader';


const SheetDataPage = () => {
  // Manejador para cuando se cargan datos (opcional)
  const handleDataLoaded = (data) => {
    // Este método se puede usar para procesar datos adicionales si es necesario
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Visualizador de Datos de Google Sheets</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <GoogleSheetsReader
          configName="nuevaHoja"
          onDataLoaded={handleDataLoaded}
        />
      </div>
    </>


  );
};

export default SheetDataPage;