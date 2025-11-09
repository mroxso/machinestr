import { useSeoMeta } from '@unhead/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoginArea } from '@/components/auth/LoginArea';
import { Sparkles, Zap, Shield, Globe, ArrowRight, Languages, Image, Search, FileText, Settings } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  useSeoMeta({
    title: 'machinestr - Data Vending Machines',
    description:
      'Find and use digital vending machines for data and compute — request work, receive results, and optionally pay for what you use.',
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-3 rounded-2xl shadow-lg">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              machinestr
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <LoginArea className="max-w-60" />
          </div>
        </header>

        <section className="text-center mb-20 space-y-6">
          <div className="inline-block">
            <Badge variant="outline" className="mb-4 px-4 py-2 text-sm">
              <Zap className="h-3 w-3 mr-2" />
              Data Vending Machines
            </Badge>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
            Digital vending machines
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              for data — simple, fast, and shared
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Think of a DVM like a vending machine — but for data and compute. Pick a service (a model, a dataset, or a
            transformation), drop a request, and get back results. Some providers may ask for payment (like buying a snack),
            but many keep things simple and pay-as-you-go.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" onClick={() => navigate('/dvm')} className="gap-2 px-8">
              Explore DVMs
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/dvm')} className="gap-2">
              <Sparkles className="h-5 w-5" />
              Browse Providers
            </Button>
          </div>
        </section>

        <section className="mb-20">
          <h3 className="text-2xl font-bold text-center mb-12">What you can get from a DVM</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl w-fit mb-2">
                  <Languages className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Model Inference</CardTitle>
                <CardDescription>Run models remotely (text, image, audio inference)</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl w-fit mb-2">
                  <Image className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Dataset Access</CardTitle>
                <CardDescription>Purchase or query curated datasets and feeds</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-xl w-fit mb-2">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Transformations</CardTitle>
                <CardDescription>Summarize, translate, or otherwise transform your data</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl w-fit mb-2">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Discovery</CardTitle>
                <CardDescription>Find providers, pipelines, and live data feeds</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        <section className="mb-20">
          <h3 className="text-2xl font-bold text-center mb-12">Why machinestr?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-purple-600 mb-3" />
                <CardTitle>Decentralized</CardTitle>
                <CardDescription>
                  No central authority. Service providers compete to deliver the best results for your tasks.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-amber-600 mb-3" />
                <CardTitle>Pay as You Go</CardTitle>
                <CardDescription>
                  Only pay for results you're satisfied with. Set maximum bids and receive Lightning invoices.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Globe className="h-10 w-10 text-blue-600 mb-3" />
                <CardTitle>Open Protocol</CardTitle>
                <CardDescription>
                  Built on Nostr (NIP-90). Interoperable with other clients and accessible to anyone.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        <section className="text-center py-16 px-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-3xl">
          <h3 className="text-3xl font-bold mb-4">How it works — quick</h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Tap a provider, send a request, and the machine hands you the result — like getting a snack from a vending
            machine, but digital. Results can be summaries, images, model outputs, or datasets. If the service costs
            something, you'll get a small invoice and then the output — quick and pay-as-you-go.
          </p>
          <Button size="lg" onClick={() => navigate('/dvm')} className="gap-2 px-8">
            Launch Interface
            <ArrowRight className="h-5 w-5" />
          </Button>
        </section>

        <footer className="mt-20 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            Built with{' '}
            <a
              href="https://soapbox.pub/mkstack"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              MKStack
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
