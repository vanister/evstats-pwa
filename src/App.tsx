import { useState } from 'react';
import { Box, Button, Heading, Stack, Text } from '@chakra-ui/react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <Box p={8}>
      <Stack gap={4} align="flex-start">
        <Heading size="2xl" color="brand.solid">
          EV Charge Tracker
        </Heading>
        <Text color="fg.muted">
          A Progressive Web App for tracking electric vehicle charging sessions
        </Text>
        <Button
          colorPalette="brand"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </Button>
      </Stack>
    </Box>
  );
}

export default App;
