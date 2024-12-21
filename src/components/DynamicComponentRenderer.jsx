import LineChart from "../components/Dashboard/LineChart";
import PieChart from "../components/Dashboard/PieChart";
import TotalsCardComponent from "../components/Dashboard/TotalsCardComponent";
import TransactionTable from "../components/Dashboard/TransactionTable";

const DynamicComponentRenderer = ({ item }) => {
  if (item.i.includes("transactionTable")) return <TransactionTable title="Transacciones" data={data} />;
  if (item.i.includes("pieChart")) return <PieChart data={item.data} title={item.title} subTitle={item.subTitle} description={item.description}/>;
  if (item.i.includes("totalsCard")) return <TotalsCardComponent title="Resumen" />;
  if (item.i.includes("lineChart")) return <LineChart data={item.data} title={item.title} subTitle={item.subTitle} description={item.description} />;
  return null;
};

export default DynamicComponentRenderer;
