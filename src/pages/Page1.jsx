import { useEffect, useState } from "react";
import TransactionTable from "../components/Dashboard/TransactionTable";
import PieChartComponent from "../components/Dashboard/PieChartComponent";
import { GetSignatureProcesses } from "../api/signatureProcess";
import TotalsCardComponent from "../components/Dashboard/TotalsCardComponent";
export default function About() {
  const [process, setProcess] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const result = await GetSignatureProcesses();
      setProcess(result);
    };

    loadData();
  }, []);

  return (
    <>
      <h2>Transacciones</h2>
      <div className="d-flex row">
        <div className="col-md-4 mb-3">
          <div className="shadow-sm rounded">
            <TransactionTable data={process} />
          </div>
        </div>
        <div className="col-md-2 mb-3">
            <PieChartComponent data={process} />
        </div>
        <div className="col-md-2 mb-3">
          <TotalsCardComponent/>
        </div>
        <div className="col-md-4 mb-3">
         
        </div>
      </div>
    </>
  );
}
