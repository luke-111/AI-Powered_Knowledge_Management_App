import { createContext, useContext, useEffect, useReducer } from 'react';
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
  const attachCategory = (note) => {
    if (!note) return note;
    if (note.Category) return note;
    const categoryId = typeof note.category === 'object' ? note.category?.id : note.category;
    if (!categoryId) return note;
    const category = state.categories.find((cat) => cat.id === categoryId);
    return category ? { ...note, Category: category } : note;
  };

  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_NOTES':
      return { ...state, notes: action.payload, loading: false };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, attachCategory(action.payload)], loading: false };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.payload.id ? attachCategory(action.payload) : note
        ),
        loading: false,
      };
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter((note) => note.id !== action.payload),
        loading: false,
      };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((cat) => (cat.id === action.payload.id ? action.payload : cat)),
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter((cat) => cat.id !== action.payload),
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    default:
      return state;
  }
};

const unwrap = (response) => response?.payload ?? response;

export const NotesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notesReducer, initialState);

  const setLoading = (flag) => dispatch({ type: 'SET_LOADING', payload: flag });
  const setError = (message) => dispatch({ type: 'SET_ERROR', payload: message });

  const fetchNotes = async (filters = {}) => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.archived) params.archived = filters.archived;
      const response = await notesAPI.getAll(params);
      dispatch({ type: 'SET_NOTES', payload: unwrap(response) });
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      dispatch({ type: 'SET_CATEGORIES', payload: unwrap(response) });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const createNote = async (noteData) => {
    setLoading(true);
    try {
      const response = await notesAPI.create(noteData);
      dispatch({ type: 'ADD_NOTE', payload: unwrap(response) });
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const updateNote = async (id, noteData) => {
    setLoading(true);
    try {
      const response = await notesAPI.update(id, noteData);
      dispatch({ type: 'UPDATE_NOTE', payload: unwrap(response) });
      fetchNotes(state.filters);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const deleteNote = async (id) => {
    setLoading(true);
    try {
      await notesAPI.delete(id);
      dispatch({ type: 'DELETE_NOTE', payload: id });
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const createCategory = async (catData) => {
    const response = await categoriesAPI.create(catData);
    dispatch({ type: 'ADD_CATEGORY', payload: unwrap(response) });
  };

  const updateCategory = async (id, catData) => {
    const response = await categoriesAPI.update(id, catData);
    dispatch({ type: 'UPDATE_CATEGORY', payload: unwrap(response) });
    fetchNotes(state.filters);
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

  const semanticSearch = async (query) => {
    if (!query?.trim()) return [];
    const response = await notesAPI.semanticSearch(query);
    return unwrap(response);
  };

  const summarizeNote = async (id) => {
    const response = await notesAPI.summarize(id);
    return unwrap(response);
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
    semanticSearch,
    summarizeNote,
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
