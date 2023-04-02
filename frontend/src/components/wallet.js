import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Text,
  Flex,
  Icon,
  Spinner,
} from "@chakra-ui/react";
import Identicon from "./identicon";
import { formatBigNumber, truncateMidText } from "../utils";
import { BiExit } from "react-icons/bi";
import { BsPersonCircle } from "react-icons/bs";

const Wallet = ({ address, amount, symbol, destroy }) => {
  return (
    <Menu>
      <MenuButton
        px={4}
        py={2}
        transition="all 0.2s"
        borderRadius="sm"
        borderWidth="2px"
        borderColor={"gray.200"}
        _hover={{ bg: "gray.200", color: "gray.900" }}
        _expanded={{ bg: "blue.400" }}
      >
        <Flex columnGap={2} alignItems={"center"}>
          {amount ? (
            <Text fontWeight={"bold"}>
              {formatBigNumber(amount)} {symbol}
            </Text>
          ) : (
            <Spinner size="sm" />
          )}
          <Identicon address={address} size="28" />
        </Flex>
      </MenuButton>
      <MenuList boxShadow={"2xl"} bg={"gray.900"} color={"gray.200"}>
        <MenuItem
          columnGap={"1"}
          _hover={{ bg: "gray.200", color: "gray.900", fontWeight: "semibold" }}
          _focus={{ bg: "gray.200", color: "gray.900", fontWeight: "semibold" }}
        >
          <Icon as={BsPersonCircle} width="6" height="6" />
          <Text>{truncateMidText(address)}</Text>
        </MenuItem>
        <MenuDivider />
        <MenuItem
          columnGap={"1"}
          _hover={{ bg: "gray.200", color: "gray.900", fontWeight: "semibold" }}
          _focus={{ bg: "gray.200", color: "gray.900", fontWeight: "semibold" }}
          onClick={destroy}
        >
          <Icon as={BiExit} width="6" height="6" />
          <Text>Disconnect</Text>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default Wallet;
