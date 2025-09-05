import { createContext, useContext, useReducer, useEffect } from 'react';
import { notesAPI, categoriesAPI } from '../services/api.js';

const NotesContext = createContext();

const initialState = {
  notes: [],
  categories: [],
  loading: false,
  error: null,
  filters: {
    category: '',
    archived: '',
  },
};

const notesReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_NOTES':
      return { ...state, notes: action.payload, loading: false };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'ADD_NOTE': {
      let note = { ...action.payload };
      if (note.category) {
        const category = state.categories.find(c => c.id === note.category);
        note.Category = category; 
      }
      return { ...state, notes: [...state.notes, note], loading: false };
    }
    case 'UPDATE_NOTE': {
      let note = { ...action.payload };
      if (note.category) {
        const category = state.categories.find(c => c.id === note.category || c.id === note.category?.id);
        note.Category = category;
      }
      return {
        ...state,
        notes: state.notes.map(n => n.id === note.id ? note : n),
        loading: false,
      };
    }
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(note => note.id !== action.payload),
        loading: false,
      };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(cat =>
          cat.id === action.payload.id ? action.payload : cat
        ),
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(cat => cat.id !== action.payload),
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    default:
      return state;
  }
};

export const NotesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notesReducer, initialState);

  const fetchNotes = async (filters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const params = {};
      
      if (filters.category !== undefined && filters.category !== '') {
        params.category = filters.category;
      }
      if (filters.archived !== undefined && filters.archived !== '') {
        params.archived = filters.archived;
      }
      
      const response = await notesAPI.getAll(params);
      dispatch({ type: 'SET_NOTES', payload: response.payload || response });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      dispatch({ type: 'SET_CATEGORIES', payload: response.payload || response });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const createNote = async (noteData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await notesAPI.create(noteData);
      dispatch({ type: 'ADD_NOTE', payload: response.payload || response });
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateNote = async (id, noteData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await notesAPI.update(id, noteData);
      dispatch({ type: 'UPDATE_NOTE', payload: response.payload || response });
      fetchNotes(state.filters);
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteNote = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await notesAPI.delete(id);
      dispatch({ type: 'DELETE_NOTE', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createCategory = async (catData) => {
    const response = await categoriesAPI.create(catData);
    dispatch({ type: 'ADD_CATEGORY', payload: response.payload || response });
    return response;
  };

  const updateCategory = async (id, catData) => {
    const response = await categoriesAPI.update(id, catData);
    dispatch({ type: 'UPDATE_CATEGORY', payload: response.payload || response });
    fetchNotes(state.filters);
    return response;
  };

  const deleteCategory = async (id) => {
    await categoriesAPI.delete(id);
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
    fetchNotes(state.filters);
  };

  const setFilters = (filters) => {
    const newFilters = { ...state.filters, ...filters };
    dispatch({ type: 'SET_FILTERS', payload: newFilters });
    fetchNotes(newFilters);
  };

  useEffect(() => {
    fetchNotes();
    fetchCategories();
  }, []);

  const value = {
    ...state,
    fetchNotes,
    fetchCategories,
    createNote,
    updateNote,
    deleteNote,
    createCategory,
    updateCategory,
    deleteCategory,
    setFilters,
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};