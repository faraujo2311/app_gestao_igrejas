import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, User } from "lucide-react";

const Blog = () => {
  const posts = [
    {
      id: 1,
      title: "A Importância da Comunhão",
      excerpt: "Descubra como a comunhão fortalece nossa fé e nos aproxima de Deus...",
      date: "15 Jan 2025",
      author: "Pastor João Silva",
    },
    {
      id: 2,
      title: "Vivendo uma Vida de Adoração",
      excerpt: "A adoração vai além dos momentos no templo. Veja como adorar em espírito...",
      date: "10 Jan 2025",
      author: "Pr. Maria Santos",
    },
    {
      id: 3,
      title: "Servindo com Propósito",
      excerpt: "Como encontrar seu chamado e servir o Reino de Deus com excelência...",
      date: "05 Jan 2025",
      author: "Pastor João Silva",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-white py-6 shadow-medium">
        <div className="container mx-auto px-4">
          <Link to="/">
            <Button variant="ghost" className="text-white hover:text-accent hover:bg-white/10 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Button>
          </Link>
          <h1 className="text-4xl font-bold">Blog</h1>
          <p className="text-white/80 mt-2">Reflexões, ensinamentos e novidades da nossa comunidade</p>
        </div>
      </header>

      {/* Blog Posts */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="aspect-video bg-gradient-hero rounded-lg mb-4" />
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Ler Mais
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
