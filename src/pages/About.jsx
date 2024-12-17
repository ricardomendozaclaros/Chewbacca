import { useEffect, useState } from "react";
import TransactionTable from "../components/Dashboard/TransactionTable";
import PieChartComponent from "../components/Dashboard/PieChartComponent";
import { GetSignatureProcesses } from "../api/signatureProcess";
import "../assets/css/custom_table_chart.css";
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
      <div className="d-flex">
        <div className="custom-table-container">
          <TransactionTable data={process} />
        </div>
        <div className="mx-2 w-25 shadow-sm h-50 bg-body rounded">
          <PieChartComponent data={process} />
        </div>
      </div>
    </>
  );
}
