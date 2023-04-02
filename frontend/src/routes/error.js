import { Flex, Heading, Text } from "@chakra-ui/react";
import { useRouteError } from "react-router-dom";
import Layout from "../components/layout";

const ErrorRoute = () => {
  const error = useRouteError();

  return (
    <Layout>
      <Flex
        flexDir={"column"}
        color={"gray.200"}
        alignItems={"center"}
        justifyContent={"center"}
        pt="20%"
      >
        <Heading mb={"10"} size="4xl">
          Oops!
        </Heading>
        <Text mb="5">Sorry, an unexpected error has occurred</Text>
        <Text fontWeight="semibold" fontSize={"xl"}>
          {error.statusText || error.message}
        </Text>
      </Flex>
    </Layout>
  );
};

export default ErrorRoute;
