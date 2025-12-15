import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subjectApi } from "@/services/subjectApi";
import { Subject } from "@/types/models";

export const useSubjects = (
  page: number = 1,
  perPage: number = 15,
  search: string = ""
) => {
  return useQuery({
    queryKey: ["subjects", page, perPage, search],
    queryFn: () => subjectApi.getSubjects(page, perPage, search),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSubject = (id: number) => {
  return useQuery({
    queryKey: ["subject", id],
    queryFn: () => subjectApi.getSubject(id),
    enabled: !!id,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: subjectApi.createSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, subjectData }: { id: number; subjectData: Partial<Subject> }) =>
      subjectApi.updateSubject(id, subjectData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["subject", id] });
    },
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: subjectApi.deleteSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
};
