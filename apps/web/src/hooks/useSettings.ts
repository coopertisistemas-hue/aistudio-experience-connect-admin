import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/settings';
import type { TenantProfile, UserTenantWithUser } from '@/services/settings';

export function useTenant(tenantId: string | undefined) {
  return useQuery<TenantProfile>({
    queryKey: ['tenant', tenantId],
    queryFn: () => settingsService.getTenant(tenantId!),
    enabled: !!tenantId,
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: string; data: Partial<TenantProfile> }) =>
      settingsService.updateTenant(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, settings }: { tenantId: string; settings: Record<string, unknown> }) =>
      settingsService.updateSettings(tenantId, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
    },
  });
}

export function useUpdateBranding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, branding }: { tenantId: string; branding: Record<string, unknown> }) =>
      settingsService.updateBranding(tenantId, branding),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
    },
  });
}

export function useTeam(tenantId: string | undefined) {
  return useQuery<UserTenantWithUser[]>({
    queryKey: ['team', tenantId],
    queryFn: () => settingsService.listTeam(tenantId!),
    enabled: !!tenantId,
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, email, role }: { tenantId: string; email: string; role: string }) =>
      settingsService.inviteMember(tenantId, email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      settingsService.updateMemberRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      settingsService.removeMember(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
}
