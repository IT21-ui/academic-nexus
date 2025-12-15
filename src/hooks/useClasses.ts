import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { classApi } from "@/services/classApi";
import { Class } from "@/types/models";

export const useClasses = (
  page: number = 1,
  perPage: number = 15,
  search: string = ""
) => {
  return useQuery({
    queryKey: ["classes", page, perPage, search],
    queryFn: () => classApi.getClasses(page, perPage, search),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useClass = (id: number) => {
  return useQuery({
    queryKey: ["class", id],
    queryFn: () => classApi.getClass(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: classApi.createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, classData }: { id: number; classData: Partial<Class> }) =>
      classApi.updateClass(id, classData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["class", id] });
    },
  });
};

export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: classApi.deleteClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
};

export const useEnrollStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ classId, studentId }: { classId: number; studentId: number }) =>
      classApi.enrollStudent(classId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const useUnenrollStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ classId, studentId }: { classId: number; studentId: number }) =>
      classApi.unenrollStudent(classId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
};
