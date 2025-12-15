import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/services/userApi";
import { User, UserRole } from "@/types/models";

export const useUsers = (
  page: number = 1,
  perPage: number = 15,
  role?: UserRole,
  search: string = ""
) => {
  return useQuery({
    queryKey: ["users", page, perPage, role, search],
    queryFn: () => userApi.getUsers(page, perPage, role, search),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => userApi.getUser(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useStudents = (
  page: number = 1,
  perPage: number = 15,
  search: string = ""
) => {
  return useQuery({
    queryKey: ["students", page, perPage, search],
    queryFn: () => userApi.getStudents(page, perPage, search),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTeachers = (
  page: number = 1,
  perPage: number = 15,
  search: string = ""
) => {
  return useQuery({
    queryKey: ["teachers", page, perPage, search],
    queryFn: () => userApi.getTeachers(page, perPage, search),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRegistrationRequests = (
  status?: "pending" | "approved" | "denied",
  page: number = 1,
  perPage: number = 15
) => {
  return useQuery({
    queryKey: ["registration-requests", status, page, perPage],
    queryFn: () => userApi.getRegistrationRequests(status, page, perPage),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, userData }: { id: number; userData: Partial<User> }) =>
      userApi.updateUser(id, userData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", id] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
};

export const useApproveRegistrationRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.approveRegistrationRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration-requests"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const useRejectRegistrationRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      userApi.rejectRegistrationRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration-requests"] });
    },
  });
};
