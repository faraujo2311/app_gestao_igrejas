import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PermissionGuard } from '@/components/PermissionGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit2, Plus, Lock, Eye, Eye as LockIcon } from 'lucide-react';

interface Profile {
  id: string;
  code: string;
  description: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export default function Perfis() {
  const navigate = useNavigate();
  const permissions = usePermissions('Perfis');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({ code: '', description: '', status: true });

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (profile?: Profile) => {
    if (profile) {
      setEditingProfile(profile);
      setFormData({
        code: profile.code,
        description: profile.description,
        status: profile.status,
      });
    } else {
      setEditingProfile(null);
      setFormData({ code: '', description: '', status: true });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.code || !formData.description) {
        alert('Preencha todos os campos');
        return;
      }

      if (editingProfile) {
        // Atualizar
        const { error } = await supabase
          .from('profiles')
          .update({
            code: formData.code,
            description: formData.description,
            status: formData.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingProfile.id);

        if (error) {
          console.error('Erro ao atualizar perfil:', error);
          throw new Error(error.message || 'Erro ao atualizar perfil');
        }
      } else {
        // Criar
        const { error } = await supabase
          .from('profiles')
          .insert([{
            code: formData.code,
            description: formData.description,
            status: formData.status,
          }]);

        if (error) {
          console.error('Erro ao criar perfil:', error);
          throw new Error(error.message || 'Erro ao criar perfil');
        }
      }

      setOpenDialog(false);
      loadProfiles();
    } catch (error: any) {
      const errorMsg = error.message || 'Erro ao salvar perfil';
      console.error('Erro completo:', errorMsg);
      alert(errorMsg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este perfil?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadProfiles();
    } catch (error) {
      console.error('Erro ao deletar perfil:', error);
      alert('Erro ao deletar perfil');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Perfis</h1>
          <p className="text-gray-500 mt-2">Gereneie os perfis de usuário e suas permissões</p>
        </div>
        <PermissionGuard
          moduleName="Perfis"
          action="create"
          fallback={<Button disabled className="gap-2 cursor-not-allowed"><Lock className="w-4 h-4" />Sem permissão</Button>}
        >
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Perfil
          </Button>
        </PermissionGuard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Perfis</CardTitle>
          <CardDescription>
            {profiles.length} perfil(is) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionGuard moduleName="Perfis" action="read">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <p className="text-gray-500">Carregando...</p>
              </div>
            ) : profiles.length === 0 ? (
              <div className="flex justify-center items-center h-32">
                <p className="text-gray-500">Nenhum perfil cadastrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead className="w-32">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">{profile.code}</TableCell>
                        <TableCell>{profile.description}</TableCell>
                        <TableCell>
                          <Badge variant={profile.status ? 'default' : 'secondary'}>
                            {profile.status ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <PermissionGuard
                              moduleName="Perfis"
                              action="update"
                              fallback={
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled
                                  title="Sem permissão"
                                  className="gap-1 text-gray-400"
                                >
                                  <Lock className="w-4 h-4" />
                                </Button>
                              }
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/admin/perfis/${profile.id}`)}
                                title="Gerenciar Permissões"
                                className="gap-1"
                              >
                                <Lock className="w-4 h-4" />
                                <span className="hidden sm:inline">Permissões</span>
                              </Button>
                            </PermissionGuard>
                            <PermissionGuard
                              moduleName="Perfis"
                              action="update"
                              fallback={
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled
                                  title="Sem permissão"
                                >
                                  <Edit2 className="w-4 h-4 text-gray-400" />
                                </Button>
                              }
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDialog(profile)}
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </PermissionGuard>
                            <PermissionGuard
                              moduleName="Perfis"
                              action="delete"
                              fallback={
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled
                                  title="Sem permissão"
                                >
                                  <Trash2 className="w-4 h-4 text-gray-400" />
                                </Button>
                              }
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(profile.id)}
                                title="Deletar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </PermissionGuard>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </PermissionGuard>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProfile ? 'Editar Perfil' : 'Novo Perfil'}</DialogTitle>
            <DialogDescription>
              {editingProfile ? 'Atualize as informações do perfil' : 'Crie um novo perfil de usuário'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Código do Perfil</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="ex: ADMIN, MODERADOR, USUARIO"
                disabled={!!editingProfile}
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do perfil"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="status"
                checked={formData.status}
                onCheckedChange={(status) => setFormData({ ...formData, status })}
              />
              <Label htmlFor="status" className="cursor-pointer">
                Perfil Ativo
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingProfile ? 'Atualizar' : 'Criar'} Perfil
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
