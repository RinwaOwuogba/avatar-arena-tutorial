import { Box } from "@chakra-ui/react";
import Header from "./header";

const Layout = ({ children }) => {
  return (
    <Box bg="gray.900" px="10" pb="20" minH={"100vh"}>
      <Header maxW="1600px" marginX="auto" />

      <Box maxW={"1200px"} width={["90%", "70%"]} marginX="auto">
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
