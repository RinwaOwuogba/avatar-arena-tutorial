import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import CardList from "./card-list";

const StartBattleModal = ({ isOpen, onToggle }) => {
  return (
    <Modal size="4xl" isOpen={isOpen} onClose={onToggle}>
      <ModalOverlay bg="none" backdropFilter="auto" backdropBlur="2px" />
      <ModalContent
        bg="gray.900"
        color="gray.200"
        border="1px"
        borderColor={"gray.200"}
      >
        <ModalHeader>Choose battle avatar</ModalHeader>
        <ModalCloseButton />

        <ModalBody maxH={"70vh"} overflow={"auto"}>
          <CardList
            title={"Choose avatar"}
            emptyMessage={"You haven't minted any avatars yet"}
            userNFTsOnly
          />
        </ModalBody>

        <ModalFooter>
          <Button color="gray.900" mr={3} onClick={onToggle}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default StartBattleModal;
