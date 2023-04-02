import { useContract } from "./useContract";
import AvatarArenaAbi from "../contracts/AvatarArena.json";
import AvatarArenaContractAddress from "../contracts/AvatarArena-address.json";

const useArenaContract = () =>
  useContract(AvatarArenaAbi.abi, AvatarArenaContractAddress.AvatarArena);

export default useArenaContract;
