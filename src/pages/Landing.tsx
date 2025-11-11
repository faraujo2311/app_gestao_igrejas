import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Facebook, Instagram, Youtube, ArrowRight, Heart, Users, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-church.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary/70" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Bem-vindo à Nossa Igreja
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto animate-fade-in">
            Um lugar de comunhão, adoração e transformação
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button size="lg" variant="default" className="bg-accent hover:bg-accent/90 text-white shadow-glow">
              Visite-nos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              Conheça Mais
            </Button>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="absolute bottom-8 right-8 flex gap-4 z-10">
          <a href="#" className="text-white hover:text-accent transition-colors">
            <Facebook className="h-6 w-6" />
          </a>
          <a href="#" className="text-white hover:text-accent transition-colors">
            <Instagram className="h-6 w-6" />
          </a>
          <a href="#" className="text-white hover:text-accent transition-colors">
            <Youtube className="h-6 w-6" />
          </a>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-foreground mb-6">Sobre Nós</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Somos uma comunidade de fé dedicada a viver e compartilhar o amor de Cristo. 
              Nossa missão é transformar vidas através do poder do evangelho, promovendo 
              comunhão, crescimento espiritual e serviço ao próximo.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-medium hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">Comunidade</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Valorizamos os relacionamentos e o crescimento juntos como uma família.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-medium hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">Adoração</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Nossos cultos são momentos de celebração vibrante e encontro com Deus.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-medium hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Globe className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">Serviço</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Buscamos servir nossa cidade e o mundo com amor e compaixão.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Junte-se a Nós</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Venha fazer parte desta família e experimentar o amor de Deus em comunidade
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white shadow-glow">
              Visitar Igreja
            </Button>
            <Link to="/blog">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Ver Blog
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Nossa Igreja</h3>
              <p className="text-white/80">
                Uma comunidade dedicada a viver e compartilhar o amor de Cristo.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contato</h3>
              <p className="text-white/80">
                Email: contato@igreja.com.br<br />
                Tel: (00) 0000-0000
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Redes Sociais</h3>
              <div className="flex gap-4">
                <a href="#" className="text-white/80 hover:text-accent transition-colors">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="text-white/80 hover:text-accent transition-colors">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="text-white/80 hover:text-accent transition-colors">
                  <Youtube className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-white/60">
            <p>&copy; 2025 Nossa Igreja. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
