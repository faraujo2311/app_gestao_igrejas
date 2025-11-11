import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Total de Membros",
      value: "450",
      icon: Users,
      trend: "+12% este mês",
      color: "text-blue-600",
    },
    {
      title: "Eventos Agendados",
      value: "8",
      icon: Calendar,
      trend: "3 esta semana",
      color: "text-green-600",
    },
    {
      title: "Receita Mensal",
      value: "R$ 45.230",
      icon: DollarSign,
      trend: "+8% vs mês anterior",
      color: "text-amber-600",
    },
    {
      title: "Células Ativas",
      value: "24",
      icon: TrendingUp,
      trend: "+2 novas células",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Visão geral da gestão da igreja</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Novo membro cadastrado</p>
                    <p className="text-xs text-muted-foreground">Há 2 horas</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Culto de Celebração", date: "Domingo, 19h" },
                { name: "Reunião de Células", date: "Quarta, 20h" },
                { name: "Ensaio do Louvor", date: "Quinta, 19h" },
                { name: "Escola Bíblica", date: "Sábado, 10h" },
              ].map((event, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.name}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
