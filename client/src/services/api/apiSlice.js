import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setTokens, logout } from '../auth/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/v1',
  prepareHeaders: (headers, { getState }) => {
    const { token } = getState().auth.tokens.access;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    const refreshResult = await baseQuery(
      {
        url: '/auth/refresh-tokens',
        method: 'POST',
        body: { refreshToken: api.getState().auth.tokens.refresh.token },
      },
      api,
      extraOptions,
    );
    if (refreshResult?.data) {
      api.dispatch(setTokens(refreshResult.data));
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout);
    }
  }

  return result;
};

/* eslint-disable no-unused-vars */
export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({}),
});
