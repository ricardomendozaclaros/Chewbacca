import { useEffect, useState } from "react";
import { GetSignatureProcesses } from "../api/signatureProcess";
import TotalsCardComponent from "../components/Dashboard/TotalsCardComponent";
import LineChart from "../components/Dashboard/LineChart";
import TransactionTable from "../components/Dashboard/TransactionTable";
import PieChart from "../components/Dashboard/PieChart";
export default function About() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const result = await GetSignatureProcesses();
      setData(result);
    };

    loadData();
  }, []);

  return (
    <>
      {/* <main> */}
      <div className="pagetitle">
        <h1>Transacciones</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="index.html">Home</a>
            </li>
            <li className="breadcrumb-item active">Transacciones</li>
          </ol>
        </nav>
      </div>

      <section className="section dashboard">
        <div className="row">
          <div className="col-lg-8">
            <div className="row">
              <div className="col-12">
                <h5 className="text-center">Autentic</h5>
              </div>

              <div className="col-xxl-4 col-md-6">
                <TotalsCardComponent title="Promocionales" />
              </div>

              <div className="col-xxl-4 col-md-6">
                <TotalsCardComponent title="No Promocionales"/>
              </div>

              <div className="col-xxl-4 col-xl-12">
                <TotalsCardComponent title="Sub Total"/>
              </div>

              <div className="col-12">
                <h5 className=" text-center">Certicamara</h5>
              </div>

              <div className="col-xxl-4 col-md-6">
                <TotalsCardComponent title="Promocionales" />
              </div>

              <div className="col-xxl-4 col-md-6">
                <TotalsCardComponent title="No Promocionales"/>
              </div>

              <div className="col-xxl-4 col-xl-12">
                <TotalsCardComponent title="Sub Total"/>
              </div>
            </div>
            <div className="col-12">
              <TotalsCardComponent title="Autentic + Certicamara"/>
            </div>
            <div className="row">
              <div className="col-12">
                <LineChart />
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <TransactionTable data={data} title="Transacciones y consumo por metodo de validacion" />

            <PieChart />
          </div>
        </div>
      </section>
      {/* </main> */}
    </>
  );
}
