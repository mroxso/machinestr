import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDVMProvider } from '@/hooks/useDVMProviders';
import { useDVMProviderJobs } from '@/hooks/useDVMProviderJobs';
import { getJobKindInfo, isResultKind, isFeedbackKind } from '@/lib/dvmTypes';
import { parseJobRequest, parseJobResult, parseJobFeedback, getStatusColor, getStatusIcon } from '@/lib/dvmUtils';
import { ArrowLeft, ExternalLink, Sparkles, Activity, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import type { NostrEvent } from '@nostrify/nostrify';

export default function DVMDetailsPage() {
  const { pubkey } = useParams<{ pubkey: string }>();
  const navigate = useNavigate();
  const { data: provider, isLoading: providerLoading } = useDVMProvider(pubkey!);
  const { data: jobs, isLoading: jobsLoading } = useDVMProviderJobs(pubkey!);

  if (!pubkey) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Invalid provider ID</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (providerLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/dvm')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to DVM Interface
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Provider not found. This provider may not have published their service information.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const initials = provider.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || provider.pubkey.slice(0, 2).toUpperCase();

  const completedJobs = jobs?.filter(j => 
    j.responses.some(r => isResultKind(r.kind))
  ).length || 0;

  const processingJobs = jobs?.filter(j => {
    const hasResult = j.responses.some(r => isResultKind(r.kind));
    const latestFeedback = j.responses
      .filter(r => isFeedbackKind(r.kind))
      .sort((a, b) => b.created_at - a.created_at)[0];
    const feedback = latestFeedback ? parseJobFeedback(latestFeedback) : null;
    return !hasResult && feedback?.status === 'processing';
  }).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" onClick={() => navigate('/dvm')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to DVM Interface
        </Button>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={provider.picture} alt={provider.name || 'Provider'} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3 min-w-0">
                <div>
                  <CardTitle className="text-3xl mb-2">{provider.name || 'Anonymous Provider'}</CardTitle>
                  {provider.nip05 && (
                    <CardDescription className="text-sm flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      {provider.nip05}
                    </CardDescription>
                  )}
                </div>

                {provider.about && (
                  <p className="text-muted-foreground">{provider.about}</p>
                )}

                <div className="flex flex-wrap gap-2 items-center">
                  <Badge variant="outline" className="text-xs">
                    {provider.pubkey.slice(0, 8)}...{provider.pubkey.slice(-8)}
                  </Badge>
                  {provider.lud16 && (
                    <Badge variant="outline" className="text-xs">
                      ⚡ {provider.lud16}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => navigate(`/dvm?provider=${provider.pubkey}`)}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Create Job
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.open(`https://njump.me/${provider.pubkey}`, '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Profile
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Supported Services
              </h3>
              <div className="flex flex-wrap gap-2">
                {provider.supportedKinds.map((kind) => {
                  const info = getJobKindInfo(kind);
                  return (
                    <Badge key={kind} variant="secondary">
                      {info.name}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {provider.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {provider.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Statistics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{completedJobs}</p>
                      <p className="text-sm text-muted-foreground">Completed Jobs</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">{processingJobs}</p>
                      <p className="text-sm text-muted-foreground">Processing</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{jobs?.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Total Jobs</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Recent Jobs
          </h2>

          {jobsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : jobs && jobs.length > 0 ? (
            <div className="space-y-3">
              {jobs.map((job) => (
                <JobCard key={job.request.id} request={job.request} responses={job.responses} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No jobs found for this provider yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function JobCard({ request, responses }: { request: NostrEvent; responses: NostrEvent[] }) {
  const jobRequest = parseJobRequest(request);
  const kindInfo = getJobKindInfo(request.kind);
  
  const results = responses.filter(r => isResultKind(r.kind));
  const feedbacks = responses.filter(r => isFeedbackKind(r.kind));
  
  type JobStatus = 'pending' | 'processing' | 'payment-required' | 'error' | 'success' | 'partial' | 'completed';
  let status: JobStatus = 'pending';
  if (results.length > 0) {
    status = 'completed';
  } else if (feedbacks.length > 0) {
    const latestFeedback = parseJobFeedback(feedbacks[feedbacks.length - 1]);
    status = (latestFeedback?.status || 'pending') as JobStatus;
  }

  const formattedDate = new Date(request.created_at * 1000).toLocaleString();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="truncate">{kindInfo.name}</span>
              <Badge variant="outline" className={getStatusColor(status)}>
                {getStatusIcon(status)} {status}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs mt-1 flex items-center gap-2">
              <Clock className="h-3 w-3" />
              {formattedDate}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {jobRequest.inputs.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-1">Inputs:</p>
            <div className="space-y-1">
              {jobRequest.inputs.slice(0, 2).map((input, i) => (
                <div key={i} className="text-sm text-muted-foreground flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {input.type}
                  </Badge>
                  <span className="truncate flex-1">{input.data}</span>
                </div>
              ))}
              {jobRequest.inputs.length > 2 && (
                <p className="text-xs text-muted-foreground">+{jobRequest.inputs.length - 2} more inputs</p>
              )}
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-1">Result:</p>
            <div className="bg-muted p-2 rounded text-xs font-mono line-clamp-2">
              {parseJobResult(results[0])?.payload || 'Result available'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
