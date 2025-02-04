import { useState, useEffect } from "react";
import {
  Authenticator,
  Button,
  Text,
  TextField,
  Heading,
  Flex,
  View,
  Grid,
  Divider,
} from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { DataStore } from "@aws-amplify/datastore";
import { Note } from "./models"; // Import your Note model from the generated models
import outputs from "./aws-exports";

// Configure Amplify with your settings
Amplify.configure(outputs);

export default function App() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      const notes = await DataStore.query(Note);
      setNotes(notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  }

  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    // const imageFile = form.get("image");

    try {
      // Create new note using DataStore
      const newNote = await DataStore.save(
        new Note({
          name: form.get("name"),
          description: form.get("description"),
          // No image handling
        })
      );

      console.log(newNote);

      fetchNotes(); // Refresh notes after creation
      event.target.reset();
    } catch (error) {
      console.error('Error creating note:', error);
    }
  }

  async function deleteNote(note) {
    try {
      // Delete note using DataStore
      const toBeDeletedNote = await DataStore.query(Note, note.id);
      if (toBeDeletedNote) {
        await DataStore.delete(toBeDeletedNote);
      }

      fetchNotes(); // Refresh notes after deletion
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }

  return (
    <Authenticator>
      {({ signOut }) => (
        <Flex
          className="App"
          justifyContent="center"
          alignItems="center"
          direction="column"
          width="70%"
          margin="0 auto"
        >
          <Heading level={1}>Anushka's Journal</Heading>
          <View as="form" margin="3rem 0" onSubmit={createNote}>
            <Flex
              direction="column"
              justifyContent="center"
              gap="2rem"
              padding="2rem"
            >
              <TextField
                name="name"
                placeholder="Title"
                label="Note Name"
                labelHidden
                variation="quiet"
                required
              />
              <TextField
                name="description"
                placeholder="Description"
                label="Note Description"
                labelHidden
                variation="quiet"
                required
              />
              {/* Removed image input */}
              <Button type="submit" variation="primary">
                Create Note
              </Button>
            </Flex>
          </View>
          <Divider />
          <Heading level={2}>Current Notes</Heading>
          <Grid
            margin="3rem 0"
            autoFlow="column"
            justifyContent="center"
            gap="2rem"
            alignContent="center"
          >
            {notes.map((note) => (
              <Flex
                key={note.id || note.name}
                direction="column"
                justifyContent="center"
                alignItems="center"
                gap="2rem"
                border="1px solid #ccc"
                padding="2rem"
                borderRadius="5%"
                className="box"
              >
                <View>
                  <Heading level="3">{note.name}</Heading>
                </View>
                <Text fontStyle="italic">{note.description}</Text>
                {/* Removed image display */}
                <Button
                  variation="destructive"
                  onClick={() => deleteNote(note)}
                >
                  Delete note
                </Button>
              </Flex>
            ))}
          </Grid>
          <Button onClick={signOut}>Sign Out</Button>
        </Flex>
      )}
    </Authenticator>
  );
}
