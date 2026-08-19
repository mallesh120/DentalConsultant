'use client';
import { InteractiveTimeline } from './InteractiveTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DentalResponse } from '@/lib/schemas';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PatientView({ data }: { data: Partial<NonNullable<DentalResponse['patientData']>> }) {
  const readAloud = (text: string | undefined) => {
    if (text && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">What to Expect</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => readAloud(data?.simplifiedExplanation)} aria-label="Read explanation aloud">
            <Volume2 className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">{data?.simplifiedExplanation || '...'}</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Anxiety Relief Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              {(data?.anxietyReliefTips || []).map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Estimate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">
              ${data?.costRange?.min ?? '...'} - ${data?.costRange?.max ?? '...'}
            </div>
            <p className="text-sm text-muted-foreground">{data?.costRange?.notes || '...'}</p>
          </CardContent>
        </Card>
      </div>

      {data?.recoveryTimeline && <InteractiveTimeline milestones={data.recoveryTimeline as any} />}

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Important Precautions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-destructive">
            {(data?.precautions || []).map((p, idx) => (
              <li key={idx}>{p}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
