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
import { Plus, Pencil, Trash2 } from "lucide-react";

const Ministerios = () => {
  const [ministerios] = useState([
    { id: 1, nome: "Louvor", responsavel: "João Silva", membros: 15, status: "Ativo" },
    { id: 2, nome: "Infantil", responsavel: "Maria Santos", membros: 8, status: "Ativo" },
    { id: 3, nome: "Recepção", responsavel: "Pedro Costa", membros: 12, status: "Ativo" },
    { id: 4, nome: "Mídia", responsavel: "Ana Paula", membros: 6, status: "Ativo" },
    { id: 5, nome: "Intercessão", responsavel: "José Lima", membros: 10, status: "Ativo" },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ministérios</h1>
          <p className="text-muted-foreground mt-2">Gerencie os ministérios da igreja</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Novo Ministério
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ministérios</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Membros</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ministerios.map((ministerio) => (
                <TableRow key={ministerio.id}>
                  <TableCell className="font-medium">{ministerio.nome}</TableCell>
                  <TableCell>{ministerio.responsavel}</TableCell>
                  <TableCell>{ministerio.membros}</TableCell>
                  <TableCell>
                    <Badge variant={ministerio.status === "Ativo" ? "default" : "secondary"}>
                      {ministerio.status}
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

export default Ministerios;
