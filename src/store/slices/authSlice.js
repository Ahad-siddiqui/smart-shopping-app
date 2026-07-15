import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../../services/authService';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../../utils/constants';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  status: 'idle', // idle | loading | succeeded | failed
  bootstrapped: false, // whether we've finished checking AsyncStorage on app start
  error: null,
};

const persistSession = async (token, user) => {
  if (token) await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
  if (user) await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

const clearSession = async () => {
  await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
  await AsyncStorage.removeItem(USER_STORAGE_KEY);
};

// Runs once on app start: reads any saved session from AsyncStorage and
// verifies it's still valid by calling /auth/me.
export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async (_, { rejectWithValue }) => {
  const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) return null;

  try {
    const data = await authService.getCurrentUser();
    return { token, user: data.user || data };
  } catch (err) {
    await clearSession();
    return rejectWithValue(err.message);
  }
});

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    return await authService.login(credentials);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    return await authService.register(data);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await authService.logout();
  } catch {
    // ignore - we clear the local session regardless
  }
  await clearSession();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      persistSession(state.token, state.user);
    },
  },
  extraReducers: (builder) => {
    builder
      // Bootstrap
      .addCase(bootstrapAuth.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.bootstrapped = true;
        state.status = 'idle';
        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.isAuthenticated = true;
          persistSession(action.payload.token, action.payload.user);
        }
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.bootstrapped = true;
        state.status = 'idle';
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        persistSession(action.payload.token, action.payload.user);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Login failed';
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload?.token) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          persistSession(action.payload.token, action.payload.user);
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Registration failed';
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.status = 'idle';
      });
  },
});

export const { clearAuthError, updateUser } = authSlice.actions;
export default authSlice.reducer;
