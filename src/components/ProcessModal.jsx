import { useState, useEffect } from "react";
import { GetSignatureProcessDetail } from "../api/signatureProcessPublic";
import TransactionTable from "./Dashboard/TransactionTable";
import JSONPretty from "react-json-pretty";
import "react-json-pretty/themes/monikai.css";

export default function ProcessModal({ isOpen, onClose, processData }) {
  const [activeTab, setActiveTab] = useState("data");
  const [detailData, setDetailData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFormTab, setActiveFormTab] = useState("process");
  const [activeTableTab, setActiveTableTab] = useState("signers");
  const [jsonSearchTerm, setJsonSearchTerm] = useState("");

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
    const entries = Object.entries(filteredData).filter(
      ([_, value]) => value !== null
    );
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
                  <span
                    className="text-muted me-3"
                    style={{ minWidth: "150px" }}
                  >
                    <strong>{label}:</strong>
                  </span>
                  <span className="flex-grow-1">
                    {typeof value === "boolean" ? value.toString() : value}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="col-md-6">
            {secondColumn.map(([label, value]) => (
              <div key={label} className="mb-4">
                <div className="d-flex">
                  <span
                    className="text-muted me-3"
                    style={{ minWidth: "150px" }}
                  >
                    <strong>{label}:</strong>
                  </span>
                  <span className="flex-grow-1">
                    {typeof value === "boolean" ? value.toString() : value}
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
    ["Acción", "needsTo"],
  ];

  const handleDownload = (file) => {
    const baseUrl = 'https://autentic-sign-signed-docs-test.s3.us-west-2.amazonaws.com';
    const url = `${baseUrl}/${detailData.signingProcess.idDocOrigin}/${detailData.signingProcess.idProcess}/${file.fileName}.pdf`;
    console.log('Download URL:', url);
    window.open(url, '_blank');
  };

  const filesColumns = [
    [
      "",
      "download",
      { 
        width: "80px",
        align: "center",
        customRender: (row) => (
          <div className="d-flex justify-content-center">
            <button 
              className="btn btn-sm btn-outline-primary" 
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(row);
              }}
              style={{ padding: '0.25rem 0.5rem' }}
            >
              <i className="bi bi-download"></i>
            </button>
          </div>
        )
      }
    ],
    ["Nombre", "fileName"],
    ["Extensión", "extension"],
    ["Estado", "state"],
    ["Fecha registro", "regDate"],
    ["ID Archivo", "idFile"],
    ["Modificación", "lastChangeDate"],
    ["Usuario", "holderUser"],
  ];

  const processFields = [
    ["Estado", "state"],
    ["Descripción", "description"],
    ["Registro", "regDate"],
    ["Modificación", "lastChangeDate"],
    ["Asunto", "affair"],
    ["Categoría", "signatureCategory"],
    ["Email origen", "emailOrigin"],
  ];

  const userFields = [
    ["Nombre", "firstName"],
    ["Apellido", "lastName"],
    ["Email", "email"],
    ["Empresa", "enterpriseName"],
    ["Teléfono", "phone"],
    ["Fecha registro", "regDate"],
    ["País", "country"],
    ["Rol", "role"],
  ];

  // Add this function to filter JSON based on search term
  const filterJson = (obj) => {
    if (!jsonSearchTerm) return obj;

    const searchStr = jsonSearchTerm.toLowerCase();
    const matches = (str) => str.toLowerCase().includes(searchStr);

    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (typeof value === "object" && value !== null) {
        const filtered = filterJson(value);
        if (Object.keys(filtered).length > 0) {
          acc[key] = filtered;
        }
      } else if (matches(String(key)) || matches(String(value))) {
        acc[key] = value;
      }
      return acc;
    }, {});
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content border-0 shadow">
          <div className="modal-header bg-light">
            <h5 className="modal-title fw-bold">
              Detalle del Proceso {processData?.id}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body p-4">
            <ul className="nav nav-tabs nav-fill mb-4">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "data" ? "active" : ""}`}
                  onClick={() => setActiveTab("data")}
                >
                  <i className="bi bi-file-text me-2"></i>
                  Detalles
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "json" ? "active" : ""}`}
                  onClick={() => setActiveTab("json")}
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
                <div className="alert alert-danger">Error: {error}</div>
              )}

              {!isLoading && !error && detailData && (
                <>
                  {activeTab === "data" && (
                    <div className="tab-pane fade show active">
                      {/* First section - Process and User Info */}
                      <div className="mb-4">
                        <ul className="nav nav-tabs mb-4">
                          <li className="nav-item">
                            <button
                              className={`nav-link ${
                                activeFormTab === "process" ? "active" : ""
                              }`}
                              onClick={() => setActiveFormTab("process")}
                            >
                              Información del Proceso
                            </button>
                          </li>
                          <li className="nav-item">
                            <button
                              className={`nav-link ${
                                activeFormTab === "user" ? "active" : ""
                              }`}
                              onClick={() => setActiveFormTab("user")}
                            >
                              Información del Usuario
                            </button>
                          </li>
                        </ul>

                        <div className="tab-content p-3">
                          {activeFormTab === "process" &&
                            renderFormSection(
                              "Información del Proceso",
                              detailData.signingProcess,
                              processFields
                            )}
                          {activeFormTab === "user" &&
                            renderFormSection(
                              "Información del Usuario",
                              detailData.userLoaded,
                              userFields
                            )}
                        </div>
                      </div>

                      {/* Second section - Signers and Files */}
                      <div className="mt-4">
                        <ul className="nav nav-tabs mb-4">
                          <li className="nav-item">
                            <button
                              className={`nav-link ${
                                activeTableTab === "signers" ? "active" : ""
                              }`}
                              onClick={() => setActiveTableTab("signers")}
                            >
                              Firmantes
                            </button>
                          </li>
                          <li className="nav-item">
                            <button
                              className={`nav-link ${
                                activeTableTab === "files" ? "active" : ""
                              }`}
                              onClick={() => setActiveTableTab("files")}
                            >
                              Archivos
                            </button>
                          </li>
                        </ul>

                        <div className="tab-content p-3">
                          {activeTableTab === "signers" && (
                            <TransactionTable
                              data={detailData.signers}
                              columns={signerColumns}
                              height={300}
                              pagination={false}
                              showTotal={false}
                            />
                          )}
                          {activeTableTab === "files" && (
                            <TransactionTable
                              data={detailData.files}
                              columns={filesColumns}
                              height={300}
                              pagination={false}
                              showTotal={false}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "json" && (
                    <div className="tab-pane fade show active">
                      <div className="mb-3 d-flex justify-content-end">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Buscar en JSON..."
                          value={jsonSearchTerm}
                          onChange={(e) => setJsonSearchTerm(e.target.value)}
                          style={{ maxWidth: "300px" }}
                        />
                      </div>
                      <div
                        className="bg-light p-4 rounded shadow-sm"
                        style={{
                          maxHeight: "600px",
                          overflow: "auto",
                        }}
                      >
                        <JSONPretty
                          id="json-pretty"
                          data={
                            jsonSearchTerm ? filterJson(detailData) : detailData
                          }
                          mainStyle="padding:1em"
                          valueStyle="color:#86e2d5"
                          stringStyle="color:#86e2d5"
                          booleanStyle="color:#ac92ec"
                          numberStyle="color:#fc6e51"
                          nullStyle="color:#999"
                          keyStyle="color:#ffcd69;font-weight:bold"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="modal-footer bg-light">
            <button
              type="button"
              className="btn btn-secondary px-4"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
