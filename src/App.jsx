import {
  Box,
} from '@chakra-ui/react';

import Header from './components/Header';
import Main from './components/Main';

function App() {

  return (
    <Box w="100vw" h="100vh">
      <Header />
      <Main />
    </Box>
  );
}

export default App;
