'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DentalResponse } from '@/lib/schemas';
import { Stethoscope, FileText, Pill, AlertTriangle } from 'lucide-react';

export function ClinicianView({ data }: { data: Partial<NonNullable<DentalResponse['clinicianData']>> }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center space-x-2">
            <Stethoscope className="text-primary h-5 w-5" />
            <CardTitle>Clinical Indications</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {(data?.clinicalIndications || []).map((ind, idx) => (
                <li key={idx} className="text-sm">{ind}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-x-2">
            <AlertTriangle className="text-destructive h-5 w-5" />
            <CardTitle>Contraindications</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {(data?.contraindications || []).map((con, idx) => (
                <li key={idx} className="text-sm">{con}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center space-x-2">
          <FileText className="text-primary h-5 w-5" />
          <CardTitle>ADA CDT Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {(data?.cdtCodes || []).map((codeObj, idx) => (
              <div key={idx} className="flex items-start space-x-4 p-3 bg-muted rounded-md">
                <span className="font-mono font-bold">{codeObj?.code || '...'}</span>
                <span className="text-sm text-muted-foreground">{codeObj?.description || '...'}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center space-x-2">
          <Pill className="text-primary h-5 w-5" />
          <CardTitle>Pharmacology & Anesthesia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-1">Anesthesia Protocol</h4>
            <p className="text-sm text-muted-foreground">{data?.pharmacology?.anesthesia || '...'}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">Common Prescriptions</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {(data?.pharmacology?.prescriptions || []).map((rx, idx) => (
                <li key={idx}>{rx}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-50 dark:bg-slate-900 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">SOAP Note Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm font-mono">
          <div>
            <span className="font-bold">S (Subjective):</span> {data?.soapNoteTemplate?.subjective || '...'}
          </div>
          <div>
            <span className="font-bold">O (Objective):</span> {data?.soapNoteTemplate?.objective || '...'}
          </div>
          <div>
            <span className="font-bold">A (Assessment):</span> {data?.soapNoteTemplate?.assessment || '...'}
          </div>
          <div>
            <span className="font-bold">P (Plan):</span> {data?.soapNoteTemplate?.plan || '...'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
