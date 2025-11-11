import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

const Membros = () => {
  const [membros] = useState([
    {
      id: 1,
      nome: "João Silva",
      email: "joao@email.com",
      telefone: "(11) 99999-9999",
      ministerio: "Louvor",
      status: "Ativo",
      dizimista: true,
    },
    {
      id: 2,
      nome: "Maria Santos",
      email: "maria@email.com",
      telefone: "(11) 98888-8888",
      ministerio: "Infantil",
      status: "Ativo",
      dizimista: true,
    },
    {
      id: 3,
      nome: "Pedro Costa",
      email: "pedro@email.com",
      telefone: "(11) 97777-7777",
      ministerio: "Recepção",
      status: "Ativo",
      dizimista: false,
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Membros</h1>
          <p className="text-muted-foreground mt-2">Gerencie os membros da igreja</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Novo Membro
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Membros</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar membros..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Ministério</TableHead>
                <TableHead>Dizimista</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {membros.map((membro) => (
                <TableRow key={membro.id}>
                  <TableCell className="font-medium">{membro.nome}</TableCell>
                  <TableCell>{membro.email}</TableCell>
                  <TableCell>{membro.telefone}</TableCell>
                  <TableCell>{membro.ministerio}</TableCell>
                  <TableCell>
                    <Badge variant={membro.dizimista ? "default" : "secondary"}>
                      {membro.dizimista ? "Sim" : "Não"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={membro.status === "Ativo" ? "default" : "secondary"}>
                      {membro.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Membros;
