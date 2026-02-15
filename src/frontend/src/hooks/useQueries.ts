import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Submission, School, Region, SchoolCategory, Attendance } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetMySubmissions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Submission[]>({
    queryKey: ['mySubmissions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMySubmissions();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      schoolId: bigint;
      attendance: Attendance | null;
      classControl: boolean;
      teacherControl: boolean;
      parentResponse: boolean;
      programExecution: boolean;
      problemSolving: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createSubmission(
        params.schoolId,
        params.attendance,
        params.classControl,
        params.teacherControl,
        params.parentResponse,
        params.programExecution,
        params.problemSolving
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['activeSchools'] });
    },
  });
}

export function useGetActiveSchools() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<School[]>({
    queryKey: ['activeSchools'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveSchools();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetDashboardStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDashboardStats();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetTopSchools(limit: number = 10) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<School[]>({
    queryKey: ['topSchools', limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopSchools(BigInt(limit));
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetSchoolDetails(schoolId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['schoolDetails', schoolId?.toString()],
    queryFn: async () => {
      if (!actor || !schoolId) throw new Error('Actor or schoolId not available');
      return actor.getSchoolDetails(schoolId);
    },
    enabled: !!actor && !actorFetching && schoolId !== null,
  });
}

export function useAssignKepsekProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      kepsekPrincipal: Principal;
      displayName: string;
      schoolName: string;
      region: Region;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignKepsekProfile(
        params.kepsekPrincipal,
        params.displayName,
        params.schoolName,
        params.region
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSchools'] });
    },
  });
}

export function useCreateSchool() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      region: Region;
      schoolCategory: SchoolCategory;
      principalId: Principal;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createSchool(
        params.name,
        params.region,
        params.schoolCategory,
        params.principalId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSchools'] });
    },
  });
}

export function useGetAllSubmissions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Submission[]>({
    queryKey: ['allSubmissions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSubmissions();
    },
    enabled: !!actor && !actorFetching,
  });
}
