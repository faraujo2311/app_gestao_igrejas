import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';

interface Module {
  id: string;
  name: string;
  description: string;
  order_index: number;
}

interface Function {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface ModuleFunction {
  id: string;
  module_id: string;
  function_id: string;
}

interface Permission {
  profile_id: string;
  module_id: string;
  function_id: string;
}

export default function PerfilDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [functions, setFunctions] = useState<Function[]>([]);
  const [modulePermissions, setModulePermissions] = useState<ModuleFunction[]>([]);
  const [currentPermissions, setCurrentPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Carregar módulos
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .order('order_index', { ascending: true });

      if (modulesError) throw modulesError;
      setModules(modulesData || []);

      // Carregar funções
      const { data: functionsData, error: functionsError } = await supabase
        .from('functions')
        .select('*');

      if (functionsError) throw functionsError;
      setFunctions(functionsData || []);

      // Carregar relacionamento module_functions
      const { data: moduleFuncData, error: moduleFuncError } = await supabase
        .from('module_functions')
        .select('*');

      if (moduleFuncError) throw moduleFuncError;
      setModulePermissions(moduleFuncData || []);

      // Carregar permissões do perfil
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('profile_module_permissions')
        .select('*')
        .eq('profile_id', id);

      if (permissionsError) throw permissionsError;

      const permissionSet = new Set(
        (permissionsData || []).map(
          (p) => `${p.module_id}|${p.function_id}`
        )
      );
      setCurrentPermissions(permissionSet);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModuleFunctions = (moduleId: string) => {
    return modulePermissions
      .filter((mp) => mp.module_id === moduleId)
      .map((mp) => {
        const func = functions.find((f) => f.id === mp.function_id);
        return { id: mp.function_id, name: func?.name, slug: func?.slug };
      })
      .filter((f) => f.name);
  };

  const togglePermission = (moduleId: string, functionId: string) => {
    const permKey = `${moduleId}|${functionId}`;
    const newPermissions = new Set(currentPermissions);

    if (newPermissions.has(permKey)) {
      newPermissions.delete(permKey);
    } else {
      newPermissions.add(permKey);
    }

    setCurrentPermissions(newPermissions);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      console.log('Salvando permissões para perfil:', id);
      console.log('Permissões selecionadas:', Array.from(currentPermissions));

      // Deletar todas as permissões antigas
      console.log('Deletando permissões antigas...');
      const { error: deleteError } = await supabase
        .from('profile_module_permissions')
        .delete()
        .eq('profile_id', id);

      if (deleteError) {
        console.error('Erro ao deletar permissões antigas:', deleteError);
        throw deleteError;
      }

      // Inserir novas permissões
      const newPermissions = Array.from(currentPermissions).map((perm) => {
        const [moduleId, functionId] = perm.split('|');
        return {
          profile_id: id,
          module_id: moduleId,
          function_id: functionId,
        };
      });

      if (newPermissions.length > 0) {
        console.log('Inserindo novas permissões:', newPermissions);
        const { error: insertError } = await supabase
          .from('profile_module_permissions')
          .insert(newPermissions);

        if (insertError) {
          console.error('Erro ao inserir permissões:', insertError);
          throw insertError;
        }
      }

      alert('Permissões salvas com sucesso!');
      navigate('/admin/perfis');
    } catch (error: any) {
      const errorMsg = error.message || 'Erro ao salvar permissões';
      console.error('Erro completo ao salvar permissões:', errorMsg);
      alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Perfil não encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/perfis')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{profile.code}</h1>
          <p className="text-gray-500">{profile.description}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permissões por Módulo</CardTitle>
          <CardDescription>
            Selecione quais funções este perfil pode executar em cada módulo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {modules.map((module) => {
              const moduleFuncs = getModuleFunctions(module.id);
              return (
                <div key={module.id}>
                  <h3 className="font-semibold text-lg mb-3">{module.name}</h3>
                  {module.description && (
                    <p className="text-sm text-gray-500 mb-3">{module.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {moduleFuncs.map((func) => (
                      <div key={func.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`${module.id}|${func.id}`}
                          checked={currentPermissions.has(`${module.id}|${func.id}`)}
                          onCheckedChange={() =>
                            togglePermission(module.id, func.id)
                          }
                        />
                        <label
                          htmlFor={`${module.id}|${func.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {func.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  <Separator className="mt-4" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate('/admin/perfis')}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Permissões'}
        </Button>
      </div>
    </div>
  );
}
