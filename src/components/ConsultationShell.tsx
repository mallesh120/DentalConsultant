'use client';

import { useState } from 'react';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, User, Stethoscope, Printer, ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import { usePersona, useLocale } from './Providers';
import { PatientResponseSchema, ClinicianResponseSchema, type DentalResponse } from '@/lib/schemas';
import { PatientView } from './PatientView';
import { ClinicianView } from './ClinicianView';
import { ThemeToggle } from '@/components/theme-toggle';

export function ConsultationShell() {
  const { persona, setPersona } = usePersona();
  const { locale, setLocale } = useLocale();
  const [query, setQuery] = useState('');
  
  const [feedbackState, setFeedbackState] = useState<'idle' | 'rating' | 'submitted'>('idle');
  const [isPositive, setIsPositive] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

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
    setFeedbackState('idle');
    setIsPositive(null);
    setComment('');
    submit({ procedure: query, persona, language: locale });
  };

  const submitFeedback = async (positive: boolean, finalComment: string = '') => {
    setIsSubmittingFeedback(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          procedure: query,
          persona,
          language: locale,
          isPositive: positive,
          comment: finalComment
        })
      });
      setFeedbackState('submitted');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8 print:p-0">
      {/* Header & Toggle */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 gap-4 print:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dental Consultant AI</h1>
        
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full md:w-auto mt-2 md:mt-0">
          <ThemeToggle />
          <select 
            className="text-sm border rounded-md p-1.5 flex-1 sm:flex-none bg-background"
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

          {/* Feedback UI */}
          {object && feedbackState !== 'submitted' && (
            <div className="mt-8 p-6 bg-muted rounded-lg border flex flex-col items-center gap-4 print:hidden">
              <h3 className="font-semibold text-lg">Was this consultation helpful?</h3>
              {feedbackState === 'idle' && (
                <div className="flex gap-4">
                  <Button variant="outline" size="lg" className="gap-2" onClick={() => { setIsPositive(true); setFeedbackState('rating'); }}>
                    <ThumbsUp className="w-5 h-5" /> Yes
                  </Button>
                  <Button variant="outline" size="lg" className="gap-2" onClick={() => { setIsPositive(false); setFeedbackState('rating'); }}>
                    <ThumbsDown className="w-5 h-5" /> No
                  </Button>
                </div>
              )}
              {feedbackState === 'rating' && (
                <div className="w-full max-w-md flex flex-col gap-3">
                  <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                    {isPositive ? <ThumbsUp className="w-4 h-4 text-green-600" /> : <ThumbsDown className="w-4 h-4 text-red-600" />}
                    <span>{isPositive ? 'Glad it was helpful!' : 'Sorry to hear that.'} Any additional feedback? (Optional)</span>
                  </div>
                  <Textarea 
                    placeholder="Tell us what you think..." 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="bg-background"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setFeedbackState('idle')}>Cancel</Button>
                    <Button onClick={() => submitFeedback(isPositive!, comment)} disabled={isSubmittingFeedback}>
                      {isSubmittingFeedback ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                      Submit Feedback
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isLoading && object && feedbackState === 'submitted' && (
            <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800 text-center print:hidden">
              Thank you for your feedback!
            </div>
          )}

          {/* Medical Disclaimer */}
          {object && (
            <div className="mt-8 text-xs text-muted-foreground text-center print:text-left print:mt-4 p-4 border rounded-md bg-slate-50 dark:bg-slate-900/50">
              <p><strong>Disclaimer:</strong> This application is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always seek the advice of your dentist, physician, or other qualified health provider with any questions you may have regarding a medical condition. The doctor's word is final and overrides any information provided by this AI.</p>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
