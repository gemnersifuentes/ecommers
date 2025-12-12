import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Debounce helper
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Search suggestions
export const getSearchSuggestions = async (query) => {
    if (!query || query.trim().length < 2) {
        return { products: [], brands: [], categories: [] };
    }

    try {
        const response = await axios.get(`${API_URL}/search-suggestions.php`, {
            params: { q: query }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching search suggestions:', error);
        return { products: [], brands: [], categories: [] };
    }
};

// Search history management
const HISTORY_KEY = 'searchHistory';
const MAX_HISTORY = 10;

export const getSearchHistory = () => {
    try {
        const history = localStorage.getItem(HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('Error reading search history:', error);
        return [];
    }
};

export const saveSearchTerm = (term) => {
    if (!term || term.trim().length === 0) return;

    try {
        const history = getSearchHistory();
        const trimmedTerm = term.trim();

        // Remove if already exists and add to front
        const updated = [
            trimmedTerm,
            ...history.filter(t => t.toLowerCase() !== trimmedTerm.toLowerCase())
        ].slice(0, MAX_HISTORY);

        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Error saving search term:', error);
    }
};

export const clearSearchHistory = () => {
    try {
        localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        console.error('Error clearing search history:', error);
    }
};

export const removeSearchTerm = (term) => {
    try {
        const history = getSearchHistory();
        const updated = history.filter(t => t !== term);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Error removing search term:', error);
    }
};

// Create debounced version
export const debouncedGetSearchSuggestions = debounce(getSearchSuggestions, 300);

export default {
    getSearchSuggestions,
    debouncedGetSearchSuggestions,
    getSearchHistory,
    saveSearchTerm,
    clearSearchHistory,
    removeSearchTerm
};
