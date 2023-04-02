import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, useDisclosure } from "@chakra-ui/react";
import StartBattleModal from "./start-battle-modal";

const StartBattleButton = () => {
  const { isOpen, onToggle } = useDisclosure();
  const [searchParams] = useSearchParams();
  const tokenId = searchParams.get("tokenId");

  useEffect(() => {
    if (!!tokenId && isOpen) onToggle();
  }, [tokenId, isOpen, onToggle]);

  return (
    <>
      <Button onClick={onToggle} w="max-content" size="lg" color="gray.900">
        Start Battle
      </Button>

      <StartBattleModal isOpen={isOpen} onToggle={onToggle} />
    </>
  );
};

export default StartBattleButton;
