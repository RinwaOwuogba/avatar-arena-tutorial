import { Box, Divider, Flex, Image, Text, Link } from "@chakra-ui/react";
import { truncateMidText } from "../utils";
import Identicon from "./identicon";
import { Link as ReactRouterLink } from "react-router-dom";

const Card = ({ nft, isOwner, showBattle, ...props }) => {
  const { image, description, owner, name, index, wins } = nft;

  const renderHeader = () => {
    return (
      <Flex
        alignItems={"center"}
        fontWeight={"semibold"}
        justifyContent={"space-between"}
        p="3"
      >
        <Flex columnGap={"3"} alignItems={"center"}>
          <Identicon address={owner} size="20" />
          <Text>{truncateMidText(owner)}</Text>
        </Flex>

        <Text bg="gray.200" color={"gray.900"} px="2" borderRadius={"md"}>
          #{index}
        </Text>
      </Flex>
    );
  };

  const renderImage = () => {
    return (
      <Box
        boxSize={"full"}
        overflow={"hidden"}
        borderX={"none"}
        borderY={"1.5px"}
        borderColor={"gray.200"}
      >
        <Image
          transitionDuration={"300ms"}
          src={image}
          alt={description}
          width={"full"}
        />
      </Box>
    );
  };

  const renderContent = () => {
    return (
      <Flex rowGap={"1"} flexDir={"column"} p="3">
        <Text fontWeight={"semibold"}>{name}</Text>
        <Text fontSize={"sm"} noOfLines={2}>
          {description}
        </Text>
        <Divider my="2" />
        <Text
          textAlign={"center"}
          fontSize={"lg"}
          textTransform={"uppercase"}
          fontWeight={"bold"}
          letterSpacing={"widest"}
        >
          Wins: {wins}
        </Text>

        {isOwner && showBattle ? (
          <Link
            as={ReactRouterLink}
            to={`/arena?tokenId=${index}`}
            mt="2"
            bg="gray.600"
            p="2"
            display={"flex"}
            borderRadius={"md"}
            fontWeight={"semibold"}
            color={"gray.400"}
            transitionDuration="300ms"
            _hover={{
              textDecoration: "none",
              bg: "gray.200",
              color: "gray.900",
            }}
            justifyContent={"center"}
            w="full"
          >
            Battle
          </Link>
        ) : null}
      </Flex>
    );
  };

  return (
    <Flex
      w="full"
      flexDir={"column"}
      color={"gray.200"}
      borderWidth="1.5px"
      borderColor={"gray.600"}
      borderRadius="md"
      className="battle-card"
      {...props}
    >
      {renderHeader()}
      {renderImage()}
      {renderContent()}
    </Flex>
  );
};

export default Card;
