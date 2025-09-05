import { NotesProvider } from './context/NotesContext.jsx';
import NotesPage from './pages/NotesPage.jsx';
import { AxiosInstance } from './components/auth/AxiosInstance.jsx';

function App() {
  return (
    <NotesProvider>
      <AxiosInstance />
      <div className="App">
        <NotesPage />
      </div>
    </NotesProvider>
  );
}

export default App;
