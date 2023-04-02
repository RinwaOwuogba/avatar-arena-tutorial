import { Outlet } from "react-router-dom";
import Layout from "../components/layout";

const Root = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default Root;
