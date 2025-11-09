import { useState } from 'react';
import type { NostrEvent } from '@nostrify/nostrify';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { useDVMJobState } from '@/hooks/useDVMJobs';
import { useDVMProvider } from '@/hooks/useDVMProviders';
import { parseJobRequest, getStatusColor, getStatusIcon, formatAmount } from '@/lib/dvmUtils';
import { getJobKindInfo } from '@/lib/dvmTypes';
import { ChevronDown, ChevronUp, Clock, Zap, Bot } from 'lucide-react';

interface JobHistoryCardProps {
  job: NostrEvent;
  onViewDetails?: (jobId: string) => void;
}

export function JobHistoryCard({ job, onViewDetails }: JobHistoryCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: jobState } = useDVMJobState(job.id);
  const request = parseJobRequest(job);
  const kindInfo = getJobKindInfo(job.kind);

  // Get the provider information
  const providerPubkey = jobState?.currentProvider;
  const { data: provider } = useDVMProvider(providerPubkey || '');

  const status = jobState?.status || 'pending';
  const statusColor = getStatusColor(status);
  const statusIcon = getStatusIcon(status);

  const formattedDate = new Date(job.created_at * 1000).toLocaleString();

  const providerInitials = provider?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || (providerPubkey?.slice(0, 2).toUpperCase() || 'DV');

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="truncate">{kindInfo.name}</span>
                <Badge variant="outline" className={statusColor}>
                  {statusIcon} {status}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs mt-1 flex items-center gap-2">
                <Clock className="h-3 w-3" />
                {formattedDate}
              </CardDescription>
              {providerPubkey && (
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={provider?.picture} alt={provider?.name || 'DVM Provider'} />
                    <AvatarFallback className="text-[10px]">{providerInitials}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Bot className="h-3 w-3" />
                    {provider?.name || `${providerPubkey.slice(0, 8)}...`}
                  </span>
                </div>
              )}
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {request.inputs.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Inputs:</p>
                <div className="space-y-1">
                  {request.inputs.map((input, i) => (
                    <div key={i} className="text-sm text-muted-foreground flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {input.type}
                      </Badge>
                      <span className="truncate flex-1">{input.data}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {request.params.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Parameters:</p>
                <div className="flex flex-wrap gap-1">
                  {request.params.map((param, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {param.key}: {param.value}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {request.bid && (
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>Max bid: {formatAmount(request.bid)} sats</span>
              </div>
            )}

            {jobState?.results && jobState.results.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Results:</p>
                <div className="space-y-2">
                  {jobState.results.map((result, i) => (
                    <div key={i} className="bg-muted p-3 rounded-lg">
                      <p className="text-sm font-mono break-all line-clamp-3">{result?.payload}</p>
                      {result?.amount && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Amount requested: {formatAmount(result.amount)} sats
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {jobState?.feedback && jobState.feedback.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Feedback:</p>
                <div className="space-y-2">
                  {jobState.feedback.slice(-3).map((feedback, i) => (
                    <div key={i} className="text-sm">
                      <Badge variant="outline" className={getStatusColor(feedback!.status)}>
                        {getStatusIcon(feedback!.status)} {feedback!.status}
                      </Badge>
                      {feedback!.extraInfo && (
                        <span className="ml-2 text-muted-foreground">{feedback!.extraInfo}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {onViewDetails && (
              <Button variant="outline" size="sm" className="w-full" onClick={() => onViewDetails(job.id)}>
                View Full Details
              </Button>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function JobHistoryCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      </CardHeader>
    </Card>
  );
}
