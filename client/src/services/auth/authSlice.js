import { createSlice } from '@reduxjs/toolkit';

const defaultState = {
  user: {
    id: null,
    email: null,
    name: null,
    role: null,
    isEmailVerified: null,
  },
  tokens: {
    access: {
      token: null,
      expires: null,
    },
    refresh: {
      token: null,
      expires: null,
    },
  },
};

const getInitialState = () => {
  const user = localStorage.getItem('user');
  const tokens = localStorage.getItem('tokens');

  try {
    if (user && tokens) {
      return {
        user: JSON.parse(user),
        tokens: JSON.parse(tokens),
      };
    }
  } catch (e) {
    return defaultState;
  }
  return defaultState;
};

const initialState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, tokens } = action.payload;
      state.user = user;
      state.tokens = tokens;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('tokens', JSON.stringify(tokens));
    },
    setTokens: (state, action) => {
      state.tokens = action.payload;
      localStorage.setItem('tokens', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = defaultState.user;
      state.tokens = defaultState.tokens;
      localStorage.removeItem('user');
      localStorage.removeItem('tokens');
    },
  },
});

export const { setCredentials, logout, setTokens } = authSlice.actions;

export default authSlice.reducer;

export function selectUser(state) {
  return state.auth.user;
}
export function selectUserId(state) {
  return state.auth.user.id;
}
export function selectUserEmail(state) {
  return state.auth.user.email;
}
export function selectUserName(state) {
  return state.auth.user.name;
}
export function selectUserRole(state) {
  return state.auth.user.role;
}
export function selectUserEmailVerified(state) {
  return state.auth.user.isEmailVerified;
}
export function selectTokens(state) {
  return state.auth.tokens;
}
export function selectAccessToken(state) {
  return state.auth.tokens.access.token;
}
export function selectRefreshToken(state) {
  return state.auth.tokens.refresh.token;
}
