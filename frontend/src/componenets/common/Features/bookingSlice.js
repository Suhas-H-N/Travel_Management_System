import { createSlice } from '@reduxjs/toolkit';

// ─── Booking Slice ────────────────────────────────────────────────────────────
export const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    selectedItem: null,
    passengers: [],
    rooms: [],
    travelDate: null,
    returnDate: null,
    travelClass: 'economy',
    currentBooking: null,
    paymentStatus: null,
  },
  reducers: {
    setSelectedItem: (state, { payload }) => { state.selectedItem = payload; },
    setPassengers: (state, { payload }) => { state.passengers = payload; },
    setRooms: (state, { payload }) => { state.rooms = payload; },
    setTravelDate: (state, { payload }) => { state.travelDate = payload; },
    setReturnDate: (state, { payload }) => { state.returnDate = payload; },
    setTravelClass: (state, { payload }) => { state.travelClass = payload; },
    setCurrentBooking: (state, { payload }) => { state.currentBooking = payload; },
    setPaymentStatus: (state, { payload }) => { state.paymentStatus = payload; },
    resetBooking: state => {
      state.selectedItem = null;
      state.passengers = [];
      state.rooms = [];
      state.currentBooking = null;
      state.paymentStatus = null;
    },
  }
});

export const {
  setSelectedItem, setPassengers, setRooms, setTravelDate, setReturnDate,
  setTravelClass, setCurrentBooking, setPaymentStatus, resetBooking
} = bookingSlice.actions;

// ─── Search Slice ─────────────────────────────────────────────────────────────
export const searchSlice = createSlice({
  name: 'search',
  initialState: {
    searchType: 'flight',
    origin: '', destination: '',
    travelDate: '', returnDate: '',
    passengers: 1, rooms: 1, guests: 1,
    travelClass: 'economy',
    results: [], loading: false, error: null,
  },
  reducers: {
    setSearchType: (state, { payload }) => { state.searchType = payload; },
    setSearchParams: (state, { payload }) => { return { ...state, ...payload }; },
    setResults: (state, { payload }) => { state.results = payload; state.loading = false; },
    setLoading: (state, { payload }) => { state.loading = payload; },
    setError: (state, { payload }) => { state.error = payload; state.loading = false; },
    clearResults: state => { state.results = []; state.error = null; },
  }
});

export const { setSearchType, setSearchParams, setResults, setLoading, setError, clearResults } = searchSlice.actions;

// ─── UI Slice ─────────────────────────────────────────────────────────────────
export const uiSlice = createSlice({
  name: 'ui',
  initialState: { notification: null, drawerOpen: false, modalOpen: false, modalContent: null },
  reducers: {
    showNotification: (state, { payload }) => { state.notification = payload; }, // { type: 'success'|'error', message }
    clearNotification: state => { state.notification = null; },
    toggleDrawer: state => { state.drawerOpen = !state.drawerOpen; },
    openModal: (state, { payload }) => { state.modalOpen = true; state.modalContent = payload; },
    closeModal: state => { state.modalOpen = false; state.modalContent = null; },
  }
});

export const { showNotification, clearNotification, toggleDrawer, openModal, closeModal } = uiSlice.actions;

export default {
  booking: bookingSlice.reducer,
  search: searchSlice.reducer,
  ui: uiSlice.reducer,
};
