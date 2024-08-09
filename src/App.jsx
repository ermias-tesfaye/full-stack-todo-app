import { useEffect, useState } from 'react';
import { ID, DB_ID, COLLECTION_ID, databases, account } from './lib/appwrite';

function App() {
  const [todos, setTodos] = useState([]);
  const [todoText, setTodoText] = useState('');
  const [session, setSession] = useState(undefined);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    getUser();
    getTodo();
  }, []);

  async function getTodo() {
    const res = await databases.listDocuments(DB_ID, COLLECTION_ID);

    setTodos(res.documents.reverse());
  }

  async function getUser() {
    try {
      const newSession = await account.get('current');
      setSession(newSession);
    } catch (e) {
      if (e.code === 401) {
        setSession(undefined);
      } else {
        console.log(e);
      }
    }
  }

  async function deleteDocument(id) {
    await databases.deleteDocument(DB_ID, COLLECTION_ID, id);

    getTodo();
  }

  async function updateDocument(id, completed) {
    await databases.updateDocument(DB_ID, COLLECTION_ID, id, {
      completed: completed,
    });

    getTodo();
  }

  async function addTodo(e) {
    e.preventDefault();

    if (todoText && session && !blocked) {
      await databases.createDocument(DB_ID, COLLECTION_ID, ID.unique(), {
        todo_text: todoText,
        owner_name: session.name,
      });

      setTodoText('');
      setBlocked(true);

      setTimeout(() => {
        setBlocked(false);
      }, 15000);

      getTodo();
    }
  }

  async function handleInput(e) {
    setTodoText(e.target.value);
  }

  async function login() {
    await account.createOAuth2Session(
      'github',
      'https://full-stack-todo-app-xi.vercel.app/',
      'https://full-stack-todo-app-xi.vercel.app/'
    );
  }

  async function logout() {
    await account.deleteSession('current');
    setSession(undefined);
  }

  return (
    <>
      <div className="max-w-3xl flex mx-auto justify-end">
        {session ? (
          <p className="flex text-lg items-center gap-2">
            Hello, <span>{session.name}</span>
            <button id="logout" onClick={logout}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-logout"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                <path d="M9 12h12l-3 -3" />
                <path d="M18 15l3 -3" />
              </svg>
            </button>
          </p>
        ) : (
          <button
            className="flex gap-2 items-center justify-center bg-black border border-slate-500 px-4 py-2 rounded transition hover:bg-white hover:text-black"
            onClick={login}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="icon icon-tabler icon-tabler-brand-github"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />
            </svg>
            Login with Github
          </button>
        )}
      </div>

      <main className="max-w-3xl w-full mx-auto">
        <h1 className="text-3xl font-semibold my-16">Todo App</h1>
        <form
          className="flex flex-col gap-4 my-6"
          onSubmit={addTodo}
          action="#"
        >
          <textarea
            className="bg-slate-800 shadow-xl w-full h-20 p-4 rounded disabled:bg-slate-900 disabled:placeholder:text-slate-500
                        disabled:cursor-not-allowed"
            name="item"
            placeholder={
              !blocked ? 'Enter your suggestion here' : 'Wait for 15s'
            }
            value={todoText}
            onInput={handleInput}
            disabled={blocked}
          ></textarea>
          <button
            className="bg-purple-900 px-6 py-2 rounded shadow ml-auto transition hover:bg-white hover:text-purple-900"
            type="submit"
          >
            Send
          </button>
        </form>

        <h2 className="text-xl font-medium mt-6 mb-4">Todos:</h2>

        <ul id="suggestions" className="space-y-4">
          {todos.map((todo) => (
            <li
              key={todo.$id}
              className="flex items-center border border-white/20 p-4 rounded shadow gap-2"
            >
              <span>{todo.completed ? '✅' : null}</span>
              <p>
                <strong>{todo.owner_name ? todo.owner_name : 'NONAME'}</strong>:{' '}
                {todo.todo_text}
              </p>
              {session?.labels.includes('admin') ? (
                <input
                  className="ml-auto"
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => updateDocument(todo.$id, !todo.completed)}
                />
              ) : null}
              {todo.$permissions.includes(`delete("user:${session?.$id}")`) ||
              session?.labels.includes('admin') ? (
                <button
                  className="text-red-500 hover:text-red-800"
                  onClick={() => deleteDocument(todo.$id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M4 7l16 0" />
                    <path d="M10 11l0 6" />
                    <path d="M14 11l0 6" />
                    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                  </svg>
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}

export default App;
