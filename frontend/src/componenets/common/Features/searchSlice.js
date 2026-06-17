import { searchSlice, uiSlice } from './bookingSlice';
export const { setSearchType, setSearchParams, setResults, setLoading, setError, clearResults } = searchSlice.actions;
export default searchSlice.reducer;
