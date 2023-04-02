import { useEffect, useState } from "react";
import {
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Input,
  VStack,
  Textarea,
  Flex,
  Image,
  useToast,
} from "@chakra-ui/react";
import { useContractKit } from "@celo-tools/use-contractkit";
import useArenaContract from "../hooks/useArenaContract";
import {
  createNft,
  generateAvatarImage,
  uploadFileToWeb3Storage,
} from "../utils/arena";
import { useNavigate } from "react-router-dom";

const CreateAvatarModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { performActions } = useContractKit();
  const arenaContract = useArenaContract();

  const [newAvatarImage, setNewAvatarImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateAvatar = async (event) => {
    event.preventDefault();

    setIsLoading(true);
    try {
      const image = await generateAvatarImage();
      const ipfsImageUrl = await uploadFileToWeb3Storage(image);
      const data = {
        name: event.target.elements.name.value,
        description: event.target.elements.description.value,
        ipfsImage: ipfsImageUrl,
      };

      await createNft(arenaContract, performActions, data);
      setNewAvatarImage(ipfsImageUrl);
      toast({
        title: "NFT minted!",
        position: "top",
        status: "success",
        duration: 5000,
        variant: "top-accent",
      });
    } catch (error) {
      console.log({ error });
      toast({
        title: "Error minting NFT!",
        description: error.message,
        position: "top",
        status: "error",
        duration: 5000,
        variant: "top-accent",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // clear avatar image when modal reopens
  useEffect(() => setNewAvatarImage(""), [isOpen]);

  const handleClose = () => {
    onClose();

    // show user new list of avatars if user just finished
    // creating new avatar
    if (newAvatarImage) navigate("/my-avatars");
  };

  return (
    <Modal
      size="lg"
      isOpen={isOpen}
      onClose={isLoading ? () => {} : handleClose}
    >
      <ModalOverlay
        bg="none"
        backdropFilter="auto"
        backdropBlur="2px"
        // make chakra UI modal play nice with metamask
        visibility={isLoading ? "hidden" : "initial"}
      />
      <ModalContent
        bg="gray.900"
        color="gray.200"
        border="1px"
        borderColor={"gray.200"}
        // make chakra UI modal play nice with metamask
        visibility={isLoading ? "hidden" : "initial"}
      >
        <ModalHeader>Mint NFT</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Text mb="3">Create an avatar</Text>

          <form id="create-avatar" onSubmit={handleCreateAvatar}>
            <VStack gap="5">
              <FormControl>
                <FormLabel htmlFor="name">Name</FormLabel>
                <Input isRequired id="name" type="name" />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="description">
                  <Flex columnGap={"2"} alignItems={"flex-end"}>
                    <Text>Description</Text>
                    <Text fontSize={"sm"}>(max 100 chars)</Text>
                  </Flex>
                </FormLabel>
                <Textarea
                  isRequired
                  maxLength={100}
                  id="description"
                  type="description"
                />
              </FormControl>
            </VStack>
          </form>

          {newAvatarImage ? (
            <Image
              transitionDuration={"300ms"}
              src={newAvatarImage}
              alt={"new avatar"}
              width={"full"}
              maxW={"330px"}
              marginX={"auto"}
            />
          ) : null}
        </ModalBody>

        <ModalFooter>
          <Button color="gray.900" mr={3} onClick={handleClose}>
            Close
          </Button>
          <Button
            type="submit"
            form="create-avatar"
            variant="ghost"
            isLoading={isLoading}
          >
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateAvatarModal;
