import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchCurrentUser = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  const token = localStorage.getItem('accessToken');
  if (!token) return rejectWithValue('No token');
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const { data } = await api.get('/users/me');
    return data.user;
  } catch {
    localStorage.removeItem('accessToken');
    return rejectWithValue('Session expired');
  }
});

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('accessToken', data.accessToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('accessToken', data.accessToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try { await api.post('/auth/logout'); } catch {}
  localStorage.removeItem('accessToken');
  delete api.defaults.headers.common['Authorization'];
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, loading: true, error: null },
  reducers: {
    clearError: state => { state.error = null; },
    updateUser: (state, action) => { state.user = { ...state.user, ...action.payload }; },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCurrentUser.pending, state => { state.loading = true; })
      .addCase(fetchCurrentUser.fulfilled, (state, { payload }) => { state.user = payload; state.loading = false; })
      .addCase(fetchCurrentUser.rejected, state => { state.user = null; state.loading = false; })
      .addCase(loginUser.pending, state => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, { payload }) => { state.user = payload; state.loading = false; })
      .addCase(loginUser.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(registerUser.pending, state => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, { payload }) => { state.user = payload; state.loading = false; })
      .addCase(registerUser.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(logoutUser.fulfilled, state => { state.user = null; });
  }
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
