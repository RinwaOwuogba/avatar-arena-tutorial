import { Flex, Skeleton, Text, useToast } from "@chakra-ui/react";
import { useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import useArenaContract from "../hooks/useArenaContract";
import { useContractKit } from "@celo-tools/use-contractkit";
import { fetchLatestBattle, startBattle } from "../utils/arena";
import StartBattleButton from "../components/start-battle-button";
import Versus from "../components/versus";

const ArenaRoute = () => {
  const { performActions, address } = useContractKit();
  const arenaContract = useArenaContract();
  const [searchParams, setSearchParams] = useSearchParams();
  const tokenId = searchParams.get("tokenId");
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [latestBattle, setLatestBattle] = useState(null);

  const shouldShowStartBattleButton =
    !latestBattle || (latestBattle && latestBattle.winner);

  const getAssets = useCallback(async () => {
    try {
      setLoading(true);

      let battleResult = await fetchLatestBattle(arenaContract);

      if (tokenId) {
        if (!battleResult || battleResult.winner) {
          toast({
            title: "Starting battle..",
            position: "top",
            status: "info",
            duration: 5000,
            variant: "top-accent",
          });
          await startBattle(arenaContract, performActions, tokenId);

          toast({
            title: "Fetching battle result",
            position: "top",
            status: "info",
            duration: 5000,
            variant: "top-accent",
          });

          battleResult = await fetchLatestBattle(arenaContract);
        } else {
          toast({
            title:
              "Cannot start a new battle until current battle is completed.",
            position: "top",
            status: "error",
            duration: 5000,
            variant: "top-accent",
          });
        }
      }

      setLatestBattle(battleResult);
    } catch (error) {
      console.log({ error });
      toast({
        title: "Failed to load data",
        description: error.message,
        position: "top",
        status: "error",
        duration: 5000,
        variant: "top-accent",
      });
    } finally {
      setSearchParams({});
      setLoading(false);
    }
  }, [arenaContract, performActions, setSearchParams, toast, tokenId]);

  useEffect(() => {
    if (address && arenaContract) getAssets();
  }, [arenaContract, address, getAssets]);

  const renderNoBattle = () => {
    return (
      <Flex
        w="full"
        flexDir={"column"}
        color={"gray.200"}
        borderWidth="1.5px"
        borderColor={"white"}
        // borderColor={"gray.600"}
        borderRadius="md"
        alignItems={"center"}
        p="10"
        rowGap={"5"}
      >
        <Text fontWeight={"semibold"} fontSize={"xl"}>
          You haven't participated in a battle yet
        </Text>
      </Flex>
    );
  };

  if (loading) {
    return (
      <Flex maxW="1024px" rowGap="5" marginX="auto" flexDirection={"column"}>
        <Skeleton startColor="gray.700" endColor="gray.800" height="50px" />
        <Skeleton startColor="gray.700" endColor="gray.800" height="400px" />
        <Skeleton startColor="gray.700" endColor="gray.800" height="200px" />
      </Flex>
    );
  }

  return (
    <Flex maxW="1024px" marginX="auto" flexDirection={"column"}>
      <Flex my="5" justifyContent={"space-between"}>
        <Text color="gray.200" fontSize={"2xl"} fontWeight={"bold"}>
          Arena
        </Text>

        {shouldShowStartBattleButton ? <StartBattleButton /> : null}
      </Flex>

      {!latestBattle ? (
        renderNoBattle()
      ) : (
        <Versus latestBattle={latestBattle} address={address} />
      )}
    </Flex>
  );
};

export default ArenaRoute;
