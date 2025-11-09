import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import type { DVMProvider } from '@/lib/dvmTypes';
import { getJobKindInfo } from '@/lib/dvmTypes';

interface DVMProviderCardProps {
  provider: DVMProvider;
  onClick?: (provider: DVMProvider) => void;
}

export function DVMProviderCard({ provider, onClick }: DVMProviderCardProps) {
  const initials = provider.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || provider.pubkey.slice(0, 2).toUpperCase();

  return (
    <Card 
      className="transition-all hover:shadow-md cursor-pointer hover:border-primary" 
      onClick={() => onClick?.(provider)}
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={provider.picture} alt={provider.name || 'Provider'} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{provider.name || 'Anonymous Provider'}</CardTitle>
            {provider.nip05 && <CardDescription className="text-xs truncate">{provider.nip05}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {provider.about && <p className="text-sm text-muted-foreground line-clamp-2">{provider.about}</p>}

        <div>
          <p className="text-xs font-medium mb-2">Supported Services:</p>
          <div className="flex flex-wrap gap-1">
            {provider.supportedKinds.slice(0, 6).map((kind) => {
              const info = getJobKindInfo(kind);
              return (
                <Badge key={kind} variant="secondary" className="text-xs">
                  {info.name}
                </Badge>
              );
            })}
            {provider.supportedKinds.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{provider.supportedKinds.length - 6} more
              </Badge>
            )}
          </div>
        </div>

        {provider.tags.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-2">Specializations:</p>
            <div className="flex flex-wrap gap-1">
              {provider.tags.slice(0, 5).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {provider.tags.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{provider.tags.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DVMProviderCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}
