import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { createTodo, updateTodo, deleteTodo } from './graphql/mutations';
import { listTodos } from './graphql/queries';

const initialState = { id: '', name: '', description: '' };
const client = generateClient();

const App = () => {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

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
      console.log('error fetching todos', err);
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
        variables: { input: todo }
      });
      fetchTodos();
    } catch (err) {
      console.log('error creating todo:', err);
    }
  }

  async function editTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todo = { ...formState };
      await client.graphql({
        query: updateTodo,
        variables: { input: todo }
      });
      setFormState(initialState);
      setIsEditing(false);
      fetchTodos();
    } catch (err) {
      console.log('error updating todo:', err);
    }
  }

  async function removeTodo(id) {
    try {
      await client.graphql({
        query: deleteTodo,
        variables: { input: { id } }
      });
      fetchTodos();
    } catch (err) {
      console.log('error deleting todo:', err);
    }
  }

  function startEdit(todo) {
    setFormState(todo);
    setIsEditing(true);
  }

  return (
    <div style={styles.container}>
      <h2>Amplify Todos</h2>
      <input
        onChange={(event) => setInput('name', event.target.value)}
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <input
        onChange={(event) => setInput('description', event.target.value)}
        style={styles.input}
        value={formState.description}
        placeholder="Description"
      />
      <button style={styles.button} onClick={isEditing ? editTodo : addTodo}>
        {isEditing ? 'Update Todo' : 'Create Todo'}
      </button>
      {todos.map((todo, index) => (
        <div key={todo.id ? todo.id : index} style={styles.todo}>
          <p style={styles.todoName}>{todo.name}</p>
          <p style={styles.todoDescription}>{todo.description}</p>
          <button style={styles.editButton} onClick={() => startEdit(todo)}>Edit</button>
          <button style={styles.deleteButton} onClick={() => removeTodo(todo.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    width: 400,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 20
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
  todoDescription: { marginBottom: 0 },
  button: {
    backgroundColor: 'black',
    color: 'white',
    outline: 'none',
    fontSize: 18,
    padding: '12px 0px',
    marginBottom: 10
  },
  editButton: {
    backgroundColor: 'blue',
    color: 'white',
    outline: 'none',
    fontSize: 14,
    padding: '8px 10px',
    marginRight: 10
  },
  deleteButton: {
    backgroundColor: 'red',
    color: 'white',
    outline: 'none',
    fontSize: 14,
    padding: '8px 10px'
  }
};

export default App;
