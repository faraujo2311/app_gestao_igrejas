/**
 * Helper para gerenciar permissões de usuário
 */

import { supabase } from '@/integrations/supabase/client';

export interface UserPermissions {
  userId: string;
  profileCode: string;
  permissions: Map<string, Set<string>>; // Map<moduleId, Set<functionId>>
}

let cachedPermissions: UserPermissions | null = null;

/**
 * Carrega as permissões do usuário autenticado
 */
export async function loadUserPermissions(): Promise<UserPermissions | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Verificar cache
    if (cachedPermissions && cachedPermissions.userId === user.id) {
      return cachedPermissions;
    }

    // Buscar perfil do usuário
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('profile_id, profiles(code)')
      .eq('user_id', user.id)
      .single();

    if (!userProfile) return null;

    const profileId = (userProfile as any).profile_id;
    const profileCode = (userProfile as any).profiles?.code || '';

    // Buscar permissões do perfil
    const { data: permissions } = await supabase
      .from('profile_module_permissions')
      .select('module_id, function_id')
      .eq('profile_id', profileId);

    if (!permissions) return null;

    // Organizar permissões por módulo
    const permMap = new Map<string, Set<string>>();
    permissions.forEach((perm: any) => {
      if (!permMap.has(perm.module_id)) {
        permMap.set(perm.module_id, new Set());
      }
      permMap.get(perm.module_id)!.add(perm.function_id);
    });

    cachedPermissions = {
      userId: user.id,
      profileCode,
      permissions: permMap,
    };

    return cachedPermissions;
  } catch (error) {
    console.error('Erro ao carregar permissões:', error);
    return null;
  }
}

/**
 * Verifica se o usuário tem permissão para uma função em um módulo
 */
export async function hasPermission(
  moduleName: string,
  functionSlug: string
): Promise<boolean> {
  try {
    const userPerms = await loadUserPermissions();
    if (!userPerms) return false;

    // Buscar ID do módulo pelo nome
    const { data: modules } = await supabase
      .from('modules')
      .select('id')
      .eq('name', moduleName)
      .single();

    if (!modules) return false;

    // Buscar ID da função pelo slug
    const { data: functions } = await supabase
      .from('functions')
      .select('id')
      .eq('slug', functionSlug)
      .single();

    if (!functions) return false;

    const modulePerms = userPerms.permissions.get((modules as any).id);
    return modulePerms?.has((functions as any).id) ?? false;
  } catch (error) {
    console.error('Erro ao verificar permissão:', error);
    return false;
  }
}

/**
 * Verifica se o usuário é super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  const userPerms = await loadUserPermissions();
  return userPerms?.profileCode === 'SUPER_ADMIN';
}

/**
 * Limpa o cache de permissões (chamar ao fazer logout)
 */
export function clearPermissionsCache() {
  cachedPermissions = null;
}

/**
 * Obtém as permissões em um formato mais simples para usar em condicionals
 */
export async function canRead(moduleName: string): Promise<boolean> {
  return hasPermission(moduleName, 'read');
}

export async function canCreate(moduleName: string): Promise<boolean> {
  return hasPermission(moduleName, 'create');
}

export async function canUpdate(moduleName: string): Promise<boolean> {
  return hasPermission(moduleName, 'update');
}

export async function canDelete(moduleName: string): Promise<boolean> {
  return hasPermission(moduleName, 'delete');
}

export async function canReport(moduleName: string): Promise<boolean> {
  return hasPermission(moduleName, 'report');
}
