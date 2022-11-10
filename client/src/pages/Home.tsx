import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Group, Paper, Stack, TextInput, Text, Flex, Container } from "@mantine/core";

import { useSessionStore } from "../store";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const session = useSessionStore();

  const [username, setUsername] = React.useState(session.username);
  const [error, setError] = React.useState("");

  const handleUsernameChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setUsername(event.currentTarget.value);
  };

  const validateUsername = () => {
    if (username.length === 0) {
      setError("Please provide an username");
      return false;
    } else if (username.length < 4) {
      setError("Username should be atleast 4 characters");
      return false;
    } else {
      setError("");
      return true;
    }
  };

  const handleLogin = (url: string) => {
    const valid = validateUsername();
    if (!valid) return;
    session.initialize(username);
    navigate(url);
  };

  const handleLoginAsStreamer = () => handleLogin("/stream");

  const handleLoginAsViewer = () => handleLogin("/watch");

  return (
    <Flex mih="100vh" align="center" justify="stretch" bg="gray.3">
      <Container size="xs" w="100%">
        <Paper radius="md" p="xl" withBorder>
          <Text size="lg" align="center" weight={500} mb="lg">
            Welcome to Stremeo
          </Text>
          <Stack>
            <TextInput required label="Username" error={error} value={username} onChange={handleUsernameChange} />
          </Stack>
          <Group position="right" mt="xl">
            <Button onClick={handleLoginAsStreamer}>Login as Streamer</Button>
            <Button type="submit" onClick={handleLoginAsViewer} variant="light">
              Login as Viewer
            </Button>
          </Group>
        </Paper>
      </Container>
    </Flex>
  );
};

export default HomePage;
