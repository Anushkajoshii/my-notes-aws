import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { createTodo } from './graphql/mutations';
import { listTodos } from './graphql/queries';

import '@aws-amplify/ui-react/styles.css';
import { withAuthenticator, Button, View } from '@aws-amplify/ui-react';

const initialState = { name: '', description: '' };
const client = generateClient();

const App = ({ signOut }) => {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetchTodos();
  }, []);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  async function fetchTodos() {
    try {
      const todoData = await client.graphql({
        query: listTodos
      });
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
    } catch (err) {
      console.log('error fetching todos');
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todo = { ...formState };
      setTodos([...todos, todo]);
      setFormState(initialState);
      await client.graphql({
        query: createTodo,
        variables: {
          input: todo
        }
      });
    } catch (err) {
      console.log('error creating todo:', err);
    }
  }

  return (
    <View className='App'>
      <div style={styles.container}>
        <h2>Anushka's NotesApp</h2>
        <input
          onChange={(event) => setInput('name', event.target.value)}
          style={styles.input}
          value={formState.name}
          placeholder="Title"
        />
        <input
          onChange={(event) => setInput('description', event.target.value)}
          style={styles.input}
          value={formState.description}
          placeholder="Description"
        />
        <button style={styles.button} onClick={addTodo}>
          Create 
        </button>
        {todos.map((todo, index) => (
          <div key={todo.id ? todo.id : index} style={styles.todo}>
            <p style={styles.todoName}>{todo.name}</p>
            <p style={styles.todoDescription}>{todo.description}</p>
          </div>
        ))}
      </div>
      <Button style={styles.signOutButton} onClick={signOut}>Sign Out</Button>
    </View>
  );
};

const styles = {
  container: {
    width: 400,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 20,
    position: 'relative'
  },
  todo: { marginBottom: 15 },
  input: {
    border: 'none',
    backgroundColor: '#ddd',
    marginBottom: 10,
    padding: 8,
    fontSize: 18
  },
  todoName: { fontSize: 20, fontWeight: 'bold' },
  todoDescription: {
    marginBottom: 0,
    whiteSpace: 'pre-wrap', // allows text to wrap based on line breaks and spaces
    wordWrap: 'break-word', // ensures words break within the container
  },
  button: {
    backgroundColor: '#008080',
    color: 'white',
    outline: 'none',
    fontSize: 18,
    padding: '12px 0px'
  },
  signOutButton: {
    position: 'absolute',
    bottom: 700,
    right: 20,
    backgroundColor: 'red',
    color: 'white'
  }
};

export default withAuthenticator(App);
