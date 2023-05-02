import { RouterProvider } from "react-router-dom"; // Import RouterProvider from react-router-dom for routing
import { useContractKit } from "@celo-tools/use-contractkit"; // Import useContractKit hook for Celo contract interactions
import Cover from "./components/cover"; // Import Cover component
import router from "./routes"; // Import router configuration
import "./App.css"; // Import CSS file for styling

const App = () => {
  const { address, connect } = useContractKit(); // Destructure address and connect function from useContractKit hook

  if (!address) return <Cover connect={connect} />; // If address is not available, render Cover component with connect function as prop

  return <RouterProvider router={router} />; // Render RouterProvider with router configuration as prop
};

export default App; // Export the App component as default

