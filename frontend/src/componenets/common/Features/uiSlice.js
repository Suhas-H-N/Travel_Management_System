import { uiSlice } from './bookingSlice';
export const { showNotification, clearNotification, toggleDrawer, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
