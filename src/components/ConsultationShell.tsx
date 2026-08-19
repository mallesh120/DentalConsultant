'use client';

import { useState } from 'react';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, User, Stethoscope, Printer } from 'lucide-react';
import { usePersona, useLocale } from './Providers';
import { PatientResponseSchema, ClinicianResponseSchema, type DentalResponse } from '@/lib/schemas';
import { PatientView } from './PatientView';
import { ClinicianView } from './ClinicianView';

export function ConsultationShell() {
  const { persona, setPersona } = usePersona();
  const { locale, setLocale } = useLocale();
  const [query, setQuery] = useState('');

  // Use the appropriate schema based on the active persona
  const currentSchema = persona === 'patient' ? PatientResponseSchema : ClinicianResponseSchema;

  const { object, submit, isLoading, error } = useObject({
    api: '/api/consult',
    schema: currentSchema,
  });

  const handleToggle = () => {
    setPersona(persona === 'patient' ? 'clinician' : 'patient');
  };

  const handleConsult = () => {
    if (!query.trim()) return;
    submit({ procedure: query, persona, language: locale });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8 print:p-0">
      {/* Header & Toggle */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 gap-4 print:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dental Consultant AI</h1>
        
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full md:w-auto mt-2 md:mt-0">
          <select 
            className="text-sm border rounded-md p-1.5 flex-1 sm:flex-none"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
          >
            <option value="English">English</option>
            <option value="Spanish">Español</option>
            <option value="French">Français</option>
            <option value="Mandarin">中文</option>
          </select>

          <div className="flex items-center justify-between sm:justify-start space-x-2 bg-muted p-2 rounded-lg flex-1 sm:flex-none">
            <User className={persona === 'patient' ? 'text-primary' : 'text-muted-foreground'} size={20} />
            <Label htmlFor="persona-mode" className="sr-only">Toggle Persona</Label>
            <Switch 
              id="persona-mode" 
              checked={persona === 'clinician'} 
              onCheckedChange={handleToggle} 
            />
            <Stethoscope className={persona === 'clinician' ? 'text-primary' : 'text-muted-foreground'} size={20} />
            <span className="text-sm font-medium w-16 sm:w-20 text-center">
              {persona === 'patient' ? 'Patient' : 'Clinician'}
            </span>
          </div>
        </div>
      </header>

      {/* Input Section */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 print:hidden">
        <Input 
          placeholder="e.g., Root Canal, Wisdom Tooth..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleConsult()}
          className="w-full text-base"
        />
        <Button onClick={handleConsult} disabled={isLoading} className="w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm">
          {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
          Analyze
        </Button>
      </div>

      {/* Results Rendering Area */}
      {error && (
        <div className="text-destructive p-4 border border-destructive rounded-md bg-destructive/10 print:hidden">
          An error occurred while analyzing: {error.message}
        </div>
      )}

      {object && (
        <main className="mt-8">
          <div className="flex justify-end mb-4 print:hidden">
            <Button variant="outline" onClick={() => window.print()} className="gap-2">
              <Printer className="w-4 h-4" />
              Save as PDF / Print
            </Button>
          </div>
          
          <div className={isLoading ? "opacity-70 transition-opacity" : ""}>
            {persona === 'patient' ? (
              <PatientView data={object as any} />
            ) : (
              <ClinicianView data={object as any} />
            )}
          </div>
        </main>
      )}
    </div>
  );
}
