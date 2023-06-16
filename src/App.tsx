import { ChakraProvider } from "@chakra-ui/react";
import { GamePage } from "./pages/Game";

function App() {
  return (
    <ChakraProvider>
      <GamePage />
    </ChakraProvider>
  );
}

export default App;
