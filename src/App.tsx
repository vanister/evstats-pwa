import { useState } from 'react';
import { Box, Card, Heading, Stack, Tabs } from '@chakra-ui/react';
import { VehicleManager } from '@/screens/vehicles/VehicleManager';
import { SessionForm } from '@/screens/sessions/SessionForm';
import { SessionList } from '@/screens/sessions/SessionList';
import { useDb } from '@/hooks/useDb';

function App() {
  useDb();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSessionAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Box p={8} maxW="1400px" mx="auto">
      <Stack gap={6}>
        <Heading size="2xl" color="brand.solid">
          EV Charge Tracker
        </Heading>

        <Tabs.Root defaultValue="sessions" variant="enclosed">
          <Tabs.List>
            <Tabs.Trigger value="sessions">Sessions</Tabs.Trigger>
            <Tabs.Trigger value="add-session">Add Session</Tabs.Trigger>
            <Tabs.Trigger value="vehicles">Vehicles</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="sessions" pt={4}>
            <SessionList key={refreshKey} />
          </Tabs.Content>

          <Tabs.Content value="add-session" pt={4}>
            <Card.Root>
              <Card.Header>
                <Heading size="lg">Add Charging Session</Heading>
              </Card.Header>
              <Card.Body>
                <SessionForm onSuccess={handleSessionAdded} />
              </Card.Body>
            </Card.Root>
          </Tabs.Content>

          <Tabs.Content value="vehicles" pt={4}>
            <VehicleManager />
          </Tabs.Content>
        </Tabs.Root>
      </Stack>
    </Box>
  );
}

export default App;
