import { Box, Flex, Text } from "@chakra-ui/react";
import Card from "./card";

const Versus = ({ latestBattle, address }) => {
  const nft1 = latestBattle?.players[0].nft;
  const nft2 = latestBattle?.players[1].nft;

  const getCardProps = (nft) => {
    if (!latestBattle.winner) return {};

    if (nft.owner === latestBattle.winner)
      return { borderColor: "green.500", borderWidth: "2px" };

    return { borderColor: "red.500", borderWidth: "2px" };
  };

  const renderAvatars = () => (
    <Flex w={"full"} justifyContent={"space-between"}>
      <Card
        nft={nft1}
        maxW={"330px"}
        minW="200px"
        w="50%"
        {...getCardProps(nft1)}
      />

      <Text
        bg="gray.200"
        p="5"
        borderRadius={"3xl"}
        fontSize={["2xl", "4xl"]}
        fontWeight={"bold"}
        h="min-content"
        alignSelf={"center"}
      >
        VS
      </Text>

      {nft2 ? (
        <Card
          nft={nft2}
          maxW={"330px"}
          minW="200px"
          w="50%"
          {...getCardProps(nft2)}
        />
      ) : (
        <Flex
          maxW={"330px"}
          w="50%"
          minW="200px"
          color={"gray.200"}
          borderWidth="1.5px"
          borderColor={"gray.600"}
          borderRadius="md"
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Text fontWeight={"bold"} fontSize={"8xl"}>
            ?
          </Text>
        </Flex>
      )}
    </Flex>
  );

  const renderResult = () => {
    const isWinner = latestBattle.winner === address;

    return (
      <Flex
        color="gray.200"
        flexDir={"column"}
        alignItems={"center"}
        py="10"
        rowGap={"5"}
      >
        <Box>
          <Text textAlign={"center"}>Started at:</Text>
          <Text fontWeight={"bold"} fontSize={"xl"} textAlign={"center"}>
            {latestBattle.createdAt.toString()}
          </Text>
        </Box>
        <Box>
          {!latestBattle.winner ? (
            <Text textAlign={"center"} fontWeight={"semibold"}>
              Waiting for opponent to join battle....
            </Text>
          ) : (
            <>
              <Text textAlign={"center"}>RESULT:</Text>
              <Text
                letterSpacing={"widest"}
                fontWeight={"bold"}
                fontSize={"5xl"}
                textAlign={"center"}
                color={isWinner ? "green.500" : "red.500"}
              >
                {isWinner ? "WINNER" : "LOSER"}
              </Text>
            </>
          )}
        </Box>
      </Flex>
    );
  };

  return (
    <>
      {renderAvatars()}
      {renderResult()}
    </>
  );
};

export default Versus;
