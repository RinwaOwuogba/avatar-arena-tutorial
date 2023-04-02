import { Button, Icon, Text, useDisclosure } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import CreateAvatarModal from "./create-avatar-modal";

const CreateAvatarButton = () => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <>
      <Button onClick={onToggle}>
        <Icon as={FaPlus} mr="2" width={"3"} height={"3"} />
        <Text>New Avatar</Text>
      </Button>

      <CreateAvatarModal isOpen={isOpen} onClose={onToggle} />
    </>
  );
};

export default CreateAvatarButton;
