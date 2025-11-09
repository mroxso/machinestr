import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DVMProviderCard, DVMProviderCardSkeleton } from '@/components/dvm/DVMProviderCard';
import { JobRequestForm } from '@/components/dvm/JobRequestForm';
import { JobHistoryCard, JobHistoryCardSkeleton } from '@/components/dvm/JobHistoryCard';
import { useDVMProviders, useDVMProvider } from '@/hooks/useDVMProviders';
import { useDVMJobHistory, useActiveDVMJobs } from '@/hooks/useDVMJobs';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { DVM_JOB_KINDS } from '@/lib/dvmTypes';
import type { DVMProvider } from '@/lib/dvmTypes';
import { Search, Sparkles, History, Activity } from 'lucide-react';

export default function DVMPage() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const providerParam = searchParams.get('provider');
  
  const [selectedProvider, setSelectedProvider] = useState<DVMProvider | undefined>();
  const [filterKind, setFilterKind] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('discover');

  const { data: paramProvider } = useDVMProvider(providerParam || '');

  // Set selected provider from URL param
  useEffect(() => {
    if (paramProvider) {
      setSelectedProvider(paramProvider);
      setActiveTab('create');
    }
  }, [paramProvider]);

  const { data: providers, isLoading: providersLoading } = useDVMProviders({
    kinds: filterKind !== 'all' ? [parseInt(filterKind)] : undefined,
  });

  const { data: jobHistory, isLoading: historyLoading } = useDVMJobHistory(user?.pubkey);
  const { data: activeJobs, isLoading: activeLoading } = useActiveDVMJobs(user?.pubkey);

  const filteredProviders = providers?.filter((p) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(query) ||
      p.about?.toLowerCase().includes(query) ||
      p.tags.some((t) => t.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-3 rounded-2xl shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                machinestr
              </h1>
              <p className="text-muted-foreground">Data Vending Machine Interface</p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Discover AI-powered services on Nostr. Submit tasks to decentralized service providers for text
            processing, translation, image generation, and more.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="discover" className="gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Discover</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Create Job</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
              {activeJobs && activeJobs.length > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                  {activeJobs.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search providers by name, description, or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={filterKind} onValueChange={setFilterKind}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Filter by service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      {Object.entries(DVM_JOB_KINDS).map(([kind, info]) => (
                        <SelectItem key={kind} value={kind}>
                          {info.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {providersLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <DVMProviderCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredProviders && filteredProviders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProviders.map((provider) => (
                  <DVMProviderCard
                    key={provider.pubkey}
                    provider={provider}
                    onClick={(p) => navigate(`/dvm/${p.pubkey}`)}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 px-8 text-center">
                  <div className="max-w-sm mx-auto space-y-4">
                    <p className="text-muted-foreground">
                      No DVM providers found. Try adjusting your search or check your relay connections.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            {selectedProvider && (
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  Job request will be sent to <strong>{selectedProvider.name || 'Anonymous Provider'}</strong>.{' '}
                  <button
                    onClick={() => setSelectedProvider(undefined)}
                    className="underline hover:no-underline"
                  >
                    Clear selection
                  </button>{' '}
                  to send to all providers.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <JobRequestForm
                  selectedProvider={selectedProvider}
                  onJobCreated={() => setActiveTab('history')}
                />
              </div>
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      How it works
                    </h3>
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Choose a job type and configure inputs</li>
                      <li>Optionally select a specific provider or let all compete</li>
                      <li>Set a maximum bid (payment) if desired</li>
                      <li>Submit and monitor progress in the History tab</li>
                      <li>Receive results and pay if you're satisfied</li>
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {!user ? (
              <Card className="border-dashed">
                <CardContent className="py-12 px-8 text-center">
                  <p className="text-muted-foreground">Please log in to view your job history</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {activeJobs && activeJobs.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Active Jobs
                      <span className="text-sm font-normal text-muted-foreground">
                        ({activeJobs.length})
                      </span>
                    </h2>
                    {activeLoading ? (
                      <div className="space-y-3">
                        {[1, 2].map((i) => (
                          <JobHistoryCardSkeleton key={i} />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activeJobs.map((job) => (
                          <JobHistoryCard key={job.request.id} job={job.request} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Job History
                  </h2>
                  {historyLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <JobHistoryCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : jobHistory && jobHistory.length > 0 ? (
                    <div className="space-y-3">
                      {jobHistory.map((job) => (
                        <JobHistoryCard key={job.id} job={job} />
                      ))}
                    </div>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="py-12 px-8 text-center">
                        <p className="text-muted-foreground">No job history yet. Create your first job!</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
