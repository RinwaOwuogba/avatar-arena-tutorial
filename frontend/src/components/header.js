import { NavLink } from "react-router-dom";
import { useContractKit } from "@celo-tools/use-contractkit";
import { Flex, Heading, Icon, Text } from "@chakra-ui/react";
import { GiBattleGear } from "react-icons/gi";
import Wallet from "./wallet";
import { useBalance } from "../hooks/useBalance";

const pages = [
  {
    text: "Arena",
    link: "/arena",
  },
  {
    text: "All Avatars",
    link: "/all-avatars",
  },
  {
    text: "My Avatars",
    link: "/my-avatars",
  },
];

const Header = ({ ...props }) => {
  const { address, destroy } = useContractKit();
  const { balance } = useBalance();

  return (
    <Flex
      color={"gray.200"}
      py="5"
      justifyContent="space-between"
      alignItems="center"
      {...props}
    >
      <Flex alignItems="center" columnGap="1">
        <Icon as={GiBattleGear} width="8" height="8" />
        <Heading size="md" textTransform="uppercase">
          Avatar Arena
        </Heading>
      </Flex>

      <Flex columnGap={10} alignItems={"center"}>
        <Flex columnGap={10}>
          {pages.map((page) => (
            <NavLink to={page.link}>
              {({ isActive }) => (
                <Text
                  fontWeight={isActive ? "bold" : "medium"}
                  textTransform="uppercase"
                  color={isActive ? "gray.200" : "gray.500"}
                  _hover={{
                    color: "gray.200",
                    fontWeight: "bold",
                  }}
                >
                  {page.text}
                </Text>
              )}
            </NavLink>
          ))}
        </Flex>

        <Wallet
          address={address}
          amount={balance.CELO}
          symbol={"CELO"}
          destroy={destroy}
        />
      </Flex>
    </Flex>
  );
};

export default Header;
