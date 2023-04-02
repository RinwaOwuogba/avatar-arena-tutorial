import { Button, Flex, Heading, Icon, Text, useToast } from "@chakra-ui/react";
import { GiBattleGear } from "react-icons/gi";

const Cover = ({ connect }) => {
  const toast = useToast();

  const handleConnectWallet = () => {
    try {
      connect();
    } catch (error) {
      console.log(error);
      toast({
        title: "Error connecting to wallet",
        description: error.message,
        position: "top",
        status: "error",
        duration: 5000,
        variant: "solid",
      });
    }
  };

  return (
    <Flex
      flexDir={"column"}
      alignItems={"center"}
      justifyContent={"center"}
      h="100vh"
      bg="gray.900"
      color="gray.200"
      rowGap={"3"}
    >
      <Icon as={GiBattleGear} width="14" height="14" />
      <Heading mb="7" size="lg" textTransform="uppercase">
        Avatar Arena
      </Heading>
      <Text fontSize={"sm"}>Connect your wallet to continue</Text>
      <Button size="md" color="gray.900" onClick={handleConnectWallet}>
        Connect Wallet
      </Button>
      <Text position={"fixed"} bottom={"10"} fontWeight={"semibold"}>
        Powered by Celo
      </Text>
    </Flex>
  );
};

export default Cover;
