import { Flex, Heading } from "@chakra-ui/react";
import CreateAvatarButton from "../components/create-avatar-button";
import CardList from "../components/card-list";

const AllAvatarsRoute = () => {
  return (
    <Flex flexDir={"column"} py="14">
      <Flex justifyContent={"space-between"}>
        <Heading size="lg" color="gray.200" mb="5">
          All avatars
        </Heading>

        <CreateAvatarButton />
      </Flex>
      <CardList emptyMessage="No avatar minted yet" />;
    </Flex>
  );
};

export default AllAvatarsRoute;
