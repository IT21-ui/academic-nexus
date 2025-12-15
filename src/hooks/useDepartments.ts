import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentApi } from "@/services/departmentApi";
import { Department } from "@/types/models";

export const useDepartments = (
  page: number = 1,
  perPage: number = 15,
  search: string = ""
) => {
  return useQuery({
    queryKey: ["departments", page, perPage, search],
    queryFn: () => departmentApi.getDepartments(page, perPage, search),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useDepartment = (id: number) => {
  return useQuery({
    queryKey: ["department", id],
    queryFn: () => departmentApi.getDepartment(id),
    enabled: !!id,
    staleTime: 20 * 60 * 1000, // 20 minutes
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: departmentApi.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, departmentData }: { id: number; departmentData: Partial<Department> }) =>
      departmentApi.updateDepartment(id, departmentData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["department", id] });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: departmentApi.deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
};
