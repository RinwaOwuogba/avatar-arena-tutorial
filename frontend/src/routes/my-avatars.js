import { Flex, Heading } from "@chakra-ui/react";
import CardList from "../components/card-list";
import CreateAvatarButton from "../components/create-avatar-button";

const MyAvatarsRoute = () => {
  return (
    <Flex flexDir={"column"} py="14">
      <Flex justifyContent={"space-between"}>
        <Heading size="lg" color="gray.200" mb="5">
          My avatars
        </Heading>

        <CreateAvatarButton />
      </Flex>

      <CardList
        emptyMessage="You haven't minted any Avatars yet"
        userNFTsOnly
      />
    </Flex>
  );
};

export default MyAvatarsRoute;
