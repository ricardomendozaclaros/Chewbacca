import LineChart from "../components/Dashboard/LineChart";
import PieChart from "../Dashboard/PieChart";
import TotalsCardComponent from "../Dashboard/TotalsCardComponent";
import TransactionTable from "../Dashboard/TransactionTable";

const DynamicComponentRenderer = ({ item }) => {
  if (item.i.includes("transactionTable")) return <TransactionTable data={item.data} title={item.title} subTitle={item.subTitle} description={item.description} />;
  if (item.i.includes("pieChart")) return <PieChart data={item.data} title={item.title} subTitle={item.subTitle} description={item.description}/>;
  if (item.i.includes("totalsCard")) return <TotalsCardComponent data={item.data} title={item.title} subTitle={item.subTitle} description={item.description} />;
  if (item.i.includes("lineChart")) return <LineChart data={item.data} title={item.title} subTitle={item.subTitle} description={item.description} />;
  return null;
};

export default DynamicComponentRenderer;
