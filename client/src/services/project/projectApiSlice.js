import { apiSlice } from '../api/apiSlice';

export const projectApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query({
      query: () => ({
        url: '/projects',
        method: 'GET',
      }),
      providesTags: ['Project'],
    }),
    getProject: builder.query({
      query: (projectId) => ({
        url: `/projects/${projectId}`,
        method: 'GET',
      }),
      providesTags: ['Project'],
    }),
    createProject: builder.mutation({
      query: (project) => ({
        url: '/projects',
        method: 'POST',
        body: project,
      }),
      invalidatesTags: ['Project'],
    }),
    updateProject: builder.mutation({
      query: ({ _id, ...changes }) => ({
        url: `/projects/${_id}`,
        method: 'PATCH',
        body: changes,
      }),
      invalidatesTags: ['Project'],
    }),
    deleteProject: builder.mutation({
      query: (projectId) => ({
        url: `/projects/${projectId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectApiSlice;
