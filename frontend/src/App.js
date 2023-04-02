import { RouterProvider } from "react-router-dom";
import { useContractKit } from "@celo-tools/use-contractkit";
import Cover from "./components/cover";
import router from "./routes";
import "./App.css";

const App = () => {
  const { address, connect } = useContractKit();

  if (!address) return <Cover connect={connect} />;

  return <RouterProvider router={router} />;
};

export default App;
