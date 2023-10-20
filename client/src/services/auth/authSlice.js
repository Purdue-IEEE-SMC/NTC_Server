import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: {
    id: null,
    email: null,
    name: null,
    role: null,
    isEmailVerified: null,
  },
  tokens: {
    access: { token: null, expires: null },
    refresh: { token: null, expires: null },
  },
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, tokens } = action.payload;
      state.user = user;
      state.tokens = tokens;
    },
    setTokens: (state, action) => {
      state.tokens = action.payload;
    },
    logout: (state) => {
      state.user = initialState.user;
      state.tokens = initialState.tokens;
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
