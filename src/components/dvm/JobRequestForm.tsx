import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { useCreateDVMJob } from '@/hooks/useCreateDVMJob';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { DVM_JOB_KINDS } from '@/lib/dvmTypes';
import type { DVMInput, DVMParam, DVMProvider } from '@/lib/dvmTypes';
import { X, Plus, Loader2 } from 'lucide-react';

interface JobRequestFormProps {
  selectedProvider?: DVMProvider;
  onJobCreated?: (jobId: string) => void;
}

export function JobRequestForm({ selectedProvider, onJobCreated }: JobRequestFormProps) {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const { mutate: createJob, isPending } = useCreateDVMJob();

  const [jobKind, setJobKind] = useState<number>(5000);
  const [inputs, setInputs] = useState<DVMInput[]>([{ data: '', type: 'text' }]);
  const [params, setParams] = useState<DVMParam[]>([]);
  const [output, setOutput] = useState('text/plain');
  const [bid, setBid] = useState('');

  const jobInfo = DVM_JOB_KINDS[jobKind];

  const addInput = () => {
    setInputs([...inputs, { data: '', type: 'text' }]);
  };

  const removeInput = (index: number) => {
    setInputs(inputs.filter((_, i) => i !== index));
  };

  const updateInput = (index: number, field: keyof DVMInput, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = { ...newInputs[index], [field]: value };
    setInputs(newInputs);
  };

  const addParam = () => {
    setParams([...params, { key: '', value: '' }]);
  };

  const removeParam = (index: number) => {
    setParams(params.filter((_, i) => i !== index));
  };

  const updateParam = (index: number, field: keyof DVMParam, value: string) => {
    const newParams = [...params];
    newParams[index] = { ...newParams[index], [field]: value };
    setParams(newParams);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to create job requests',
        variant: 'destructive',
      });
      return;
    }

    const validInputs = inputs.filter((i) => i.data.trim() !== '');
    if (validInputs.length === 0) {
      toast({
        title: 'Input required',
        description: 'Please add at least one input',
        variant: 'destructive',
      });
      return;
    }

    const validParams = params.filter((p) => p.key.trim() !== '' && p.value.trim() !== '');

    createJob(
      {
        kind: jobKind,
        inputs: validInputs,
        params: validParams.length > 0 ? validParams : undefined,
        output: output || undefined,
        bid: bid ? parseInt(bid) : undefined,
        serviceProviders: selectedProvider ? [selectedProvider.pubkey] : undefined,
      },
      {
        onSuccess: (event) => {
          toast({
            title: 'Job request created',
            description: 'Your job request has been published to the network',
          });
          onJobCreated?.(event.id);
          // Reset form
          setInputs([{ data: '', type: 'text' }]);
          setParams([]);
          setBid('');
        },
        onError: (error) => {
          toast({
            title: 'Failed to create job',
            description: error instanceof Error ? error.message : 'Unknown error occurred',
            variant: 'destructive',
          });
        },
      }
    );
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="py-12 px-8 text-center">
          <p className="text-muted-foreground mb-4">Please log in to create job requests</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Create Job Request</CardTitle>
          <CardDescription>Submit a task to be processed by DVM service providers</CardDescription>
          {selectedProvider && (
            <Badge variant="outline" className="w-fit mt-2">
              Target: {selectedProvider.name || 'Anonymous Provider'}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="job-kind">Job Type</Label>
            <Select value={jobKind.toString()} onValueChange={(v) => setJobKind(parseInt(v))}>
              <SelectTrigger id="job-kind">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DVM_JOB_KINDS).map(([kind, info]) => (
                  <SelectItem key={kind} value={kind}>
                    {info.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">{jobInfo?.description}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Inputs</Label>
              <Button type="button" size="sm" variant="outline" onClick={addInput}>
                <Plus className="h-4 w-4 mr-1" />
                Add Input
              </Button>
            </div>
            {inputs.map((input, index) => (
              <div key={index} className="flex gap-2">
                <Select
                  value={input.type}
                  onValueChange={(value) => updateInput(index, 'type', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="job">Job</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder={`${input.type === 'text' ? 'Enter text' : input.type === 'url' ? 'Enter URL' : 'Enter ID'}`}
                  value={input.data}
                  onChange={(e) => updateInput(index, 'data', e.target.value)}
                  className="flex-1"
                />
                {inputs.length > 1 && (
                  <Button type="button" size="icon" variant="ghost" onClick={() => removeInput(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Parameters (Optional)</Label>
              <Button type="button" size="sm" variant="outline" onClick={addParam}>
                <Plus className="h-4 w-4 mr-1" />
                Add Parameter
              </Button>
            </div>
            {params.map((param, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Key"
                  value={param.key}
                  onChange={(e) => updateParam(index, 'key', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Value"
                  value={param.value}
                  onChange={(e) => updateParam(index, 'value', e.target.value)}
                  className="flex-1"
                />
                <Button type="button" size="icon" variant="ghost" onClick={() => removeParam(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="output">Output Format (Optional)</Label>
            <Input id="output" placeholder="e.g., text/plain, text/markdown" value={output} onChange={(e) => setOutput(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bid">Maximum Bid in sats (Optional)</Label>
            <Input
              id="bid"
              type="number"
              placeholder="e.g., 100"
              value={bid}
              onChange={(e) => setBid(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Maximum amount you're willing to pay for this job</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isPending ? 'Creating Job...' : 'Create Job Request'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
