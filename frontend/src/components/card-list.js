import { useCallback, useEffect, useState } from "react";
import { useContractKit } from "@celo-tools/use-contractkit";
import { SimpleGrid, Skeleton, Text, useToast } from "@chakra-ui/react";
import useArenaContract from "../hooks/useArenaContract";
import { getAllNfts, getMyNfts } from "../utils/arena";
import Card from "./card";
import { useLocation } from "react-router-dom";

const CardList = ({ userNFTsOnly, emptyMessage }) => {
  const location = useLocation();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const arenaContract = useArenaContract();
  const { address } = useContractKit();
  const [nfts, setNfts] = useState([]);

  const getAssets = useCallback(async () => {
    try {
      setIsLoading(true);

      const allNfts = userNFTsOnly
        ? await getMyNfts(arenaContract, address)
        : await getAllNfts(arenaContract);
      if (!allNfts) return;
      setNfts(allNfts);
    } catch (error) {
      console.log({ error });
    } finally {
      setIsLoading(false);
    }
  }, [arenaContract, address, userNFTsOnly]);

  useEffect(() => {
    try {
      if (address && arenaContract) {
        getAssets();
      }
    } catch (error) {
      toast(error);
    }
  }, [arenaContract, address, getAssets, toast, location.key]);

  const renderLoader = () => {
    return (
      <SimpleGrid minChildWidth={"250px"} spacing={"10"}>
        <Skeleton startColor="gray.700" endColor="gray.800" height="400px" />
        <Skeleton startColor="gray.700" endColor="gray.800" height="400px" />
        <Skeleton startColor="gray.700" endColor="gray.800" height="400px" />
        <Skeleton startColor="gray.700" endColor="gray.800" height="400px" />
        <Skeleton startColor="gray.700" endColor="gray.800" height="400px" />
      </SimpleGrid>
    );
  };

  const renderCards = () => {
    return nfts.length ? (
      <SimpleGrid
        minChildWidth={"250px"}
        spacing={"10"}
        justifyItems={{ base: "center", md: "flex-start" }}
      >
        {nfts.map((nft) => (
          <Card
            nft={nft}
            isOwner={nft.owner === address}
            showBattle
            maxW={{ base: "330px" }}
          />
        ))}

        {
          // Use dummy cards to pad card list in order to keep grid consistent
          // when cards are not up to 4
          Array(4)
            .fill(null)
            .map((_, idx) => (
              <div key={idx}></div>
            ))
        }
      </SimpleGrid>
    ) : (
      <Text
        mt="5%"
        color={"gray.200"}
        textAlign={"center"}
        fontWeight={"semibold"}
        fontSize={"xl"}
      >
        {emptyMessage}
      </Text>
    );
  };

  return <>{isLoading ? renderLoader() : renderCards()}</>;
};
export default CardList;
