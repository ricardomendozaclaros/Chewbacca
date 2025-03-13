import { useState, useEffect } from 'react';
import { GetSignatureProcessDetail } from '../api/signatureProcessPublic';
import TransactionTable from './Dashboard/TransactionTable';

const FormTabs = ({ activeFormTab, setActiveFormTab }) => (
    <ul className="nav nav-tabs flex-row border-0" style={{ minWidth: '200px' }}>
      <li className="nav-item">
        <button 
          className={`nav-link border-0 ${activeFormTab === 'process' ? 'active text-primary' : 'text-muted'}`}
          onClick={() => setActiveFormTab('process')}
          style={{ 
            backgroundColor: 'transparent',
            borderBottom: activeFormTab === 'process' ? '2px solid #0d6efd' : 'none'
          }}
        >
          Información del Proceso
        </button>
      </li>
      <li className="nav-item">
        <button 
          className={`nav-link border-0 ${activeFormTab === 'user' ? 'active text-primary' : 'text-muted'}`}
          onClick={() => setActiveFormTab('user')}
          style={{ 
            backgroundColor: 'transparent',
            borderBottom: activeFormTab === 'user' ? '2px solid #0d6efd' : 'none'
          }}
        >
          Información del Usuario
        </button>
      </li>
    </ul>
  );
  
  const TableTabs = ({ activeTableTab, setActiveTableTab }) => (
    <ul className="nav nav-tabs flex-row border-0" style={{ minWidth: '200px' }}>
      <li className="nav-item">
        <button 
          className={`nav-link border-0 ${activeTableTab === 'signers' ? 'active text-primary' : 'text-muted'}`}
          onClick={() => setActiveTableTab('signers')}
          style={{ 
            backgroundColor: 'transparent',
            borderBottom: activeTableTab === 'signers' ? '2px solid #0d6efd' : 'none'
          }}
        >
          Firmantes
        </button>
      </li>
      <li className="nav-item">
        <button 
          className={`nav-link border-0 ${activeTableTab === 'files' ? 'active text-primary' : 'text-muted'}`}
          onClick={() => setActiveTableTab('files')}
          style={{ 
            backgroundColor: 'transparent',
            borderBottom: activeTableTab === 'files' ? '2px solid #0d6efd' : 'none'
          }}
        >
          Archivos
        </button>
      </li>
    </ul>
  );
  

export default function ProcessModal({ isOpen, onClose, processData }) {
  const [activeTab, setActiveTab] = useState('data');
  const [detailData, setDetailData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFormTab, setActiveFormTab] = useState('process');
  const [activeTableTab, setActiveTableTab] = useState('signers');

  useEffect(() => {
    const fetchDetail = async () => {
      if (isOpen && processData?.id) {
        setIsLoading(true);
        try {
          const data = await GetSignatureProcessDetail(processData.id);
          setDetailData(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchDetail();
  }, [isOpen, processData]);

  const filterObjectKeys = (obj, fieldDefinitions) => {
    if (!obj) return null;
    return fieldDefinitions.reduce((acc, [label, key]) => {
      if (obj.hasOwnProperty(key)) {
        acc[label] = obj[key];
      }
      return acc;
    }, {});
  };
  
  const renderFormSection = (title, data, fieldDefinitions) => {
    if (!data) return null;
    const filteredData = filterObjectKeys(data, fieldDefinitions);
    
    // Split data into two arrays for two columns
    const entries = Object.entries(filteredData).filter(([_, value]) => value !== null);
    const midPoint = Math.ceil(entries.length / 2);
    const firstColumn = entries.slice(0, midPoint);
    const secondColumn = entries.slice(midPoint);
  
    return (
      <div className="mb-4 bg-white rounded p-4 shadow-sm">
        <div className="row g-4">
          <div className="col-md-6">
            {firstColumn.map(([label, value]) => (
              <div key={label} className="mb-4">
                <div className="d-flex">
                  <span className="text-muted me-3" style={{minWidth: "150px"}}>
                    <strong>{label}:</strong>
                  </span>
                  <span className="flex-grow-1">
                    {typeof value === 'boolean' ? value.toString() : value}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="col-md-6">
            {secondColumn.map(([label, value]) => (
              <div key={label} className="mb-4">
                <div className="d-flex">
                  <span className="text-muted me-3" style={{minWidth: "150px"}}>
                    <strong>{label}:</strong>
                  </span>
                  <span className="flex-grow-1">
                    {typeof value === 'boolean' ? value.toString() : value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const signerColumns = [
    ["Nombre", "firstName"],
    ["Apellido", "lastName"],
    ["Email", "email"],
    ["Teléfono", "phone"],
    ["Acción", "needsTo"]
  ];

  const filesColumns = [
    ["Nombre", "fileName"],
    ["Extensión", "extension"],
    ["Estado", "state"],
    ["Fecha registro", "regDate"],
    ["ID Archivo", "idFile"],
    ["Modificación", "lastChangeDate"],
    ["Usuario", "holderUser"]
  ];

  const processFields = [
    ['Estado', 'state'],
    ['Descripción', 'description'],
    ['Registro', 'regDate'],
    ['Modificación', 'lastChangeDate'],
    ['Asunto', 'affair'],
    ['Categoría', 'signatureCategory'],
    ['Email origen', 'emailOrigin']
  ];
  
  const userFields = [
    ['Nombre', 'firstName'],
    ['Apellido', 'lastName'],
    ['Email', 'email'],
    ['Empresa', 'enterpriseName'],
    ['Teléfono', 'phone'],
    ['Fecha registro', 'regDate'],
    ['País', 'country'],
    ['Rol', 'role']
  ];


  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content border-0 shadow">
          <div className="modal-header bg-light">
            <h5 className="modal-title fw-bold">Detalle del Proceso {processData?.id}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body p-4">
            <ul className="nav nav-tabs nav-fill mb-4">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'data' ? 'active text-primary' : 'text-muted'}`}
                  onClick={() => setActiveTab('data')}
                >
                  <i className="bi bi-file-text me-2"></i>
                  Detalles
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'json' ? 'active text-primary' : 'text-muted'}`}
                  onClick={() => setActiveTab('json')}
                >
                  <i className="bi bi-code-square me-2"></i>
                  JSON
                </button>
              </li>
            </ul>

            <div className="tab-content">
              {isLoading && (
                <div className="text-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="alert alert-danger">
                  Error: {error}
                </div>
              )}

              {!isLoading && !error && detailData && (
                <>
                  {activeTab === 'data' && (
                    <div className="tab-pane fade show active">
                      <div className="mb-4">
                        <FormTabs activeFormTab={activeFormTab} setActiveFormTab={setActiveFormTab} />
                        {activeFormTab === 'process' && (
                          renderFormSection('Información del Proceso', detailData.signingProcess, processFields)
                        )}
                        {activeFormTab === 'user' && (
                          renderFormSection('Información del Usuario', detailData.userLoaded, userFields)
                        )}
                      </div>

                      <div className="mt-2">
                        <TableTabs activeTableTab={activeTableTab} setActiveTableTab={setActiveTableTab} />
                        {activeTableTab === 'signers' && (
                            <TransactionTable
                              data={detailData.signers}
                              columns={signerColumns}
                              height={200}
                              pagination={false}
                              rowsPerPage={5}
                              showTotal={false}
                            />
                        )}
                        {activeTableTab === 'files' && (
                            <TransactionTable
                              data={detailData.files}
                              columns={filesColumns}
                              height={200}
                              pagination={false}
                              rowsPerPage={5}
                              showTotal={false}
                            />
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'json' && (
                    <div className="tab-pane fade show active">
                      <pre className="bg-light p-4 rounded shadow-sm" style={{
                        maxHeight: '600px',
                        overflow: 'auto'
                      }}>
                        {JSON.stringify(detailData, null, 2)}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="modal-footer bg-light">
            <button type="button" className="btn btn-secondary px-4" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}