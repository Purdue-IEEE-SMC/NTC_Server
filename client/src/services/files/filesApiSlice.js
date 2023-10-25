import { apiSlice } from '../api/apiSlice';

export const filesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFiles: builder.query({
      query: ({ projectId, type }) => ({
        url: type ? `/projects/${projectId}/files?type=${type}` : `/projects/${projectId}/files`,
        method: 'GET',
      }),
      providesTags: ['File'],
    }),
    getFile: builder.query({
      query: ({ projectId, filename }) => ({
        url: `/projects/${projectId}/files/${filename}`,
        method: 'GET',
      }),
    }),
    createFile: builder.mutation({
      query: ({ projectId, formData }) => ({
        url: `/projects/${projectId}/files`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['File'],
    }),
    deleteFile: builder.mutation({
      query: ({ projectId, filename }) => ({
        url: `/projects/${projectId}/files/${filename}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['File'],
    }),
  }),
});

export const { useGetFilesQuery, useGetFileQuery, useCreateFileMutation, useDeleteFileMutation } = filesApiSlice;
