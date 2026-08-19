'use client';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Milestone {
  id: string;
  phase: string;
  description: string;
  tasks: string[];
}

export function InteractiveTimeline({ milestones }: { milestones: Partial<Milestone>[] }) {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  if (!milestones || milestones.length === 0) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Recovery Timeline & Checklist</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {milestones.map((milestone, mIdx) => (
          <Card key={milestone?.id || `m-${mIdx}`}>
            <CardHeader>
              <CardTitle className="text-lg text-primary">{milestone?.phase || '...'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{milestone?.description || '...'}</p>
              <ul className="space-y-3">
                {(milestone?.tasks || []).map((task, idx) => {
                  const taskId = `${milestone?.id || mIdx}-task-${idx}`;
                  return (
                    <li key={taskId} className="flex items-start space-x-2">
                      <Checkbox 
                        id={taskId} 
                        checked={completedTasks.has(taskId)}
                        onCheckedChange={() => toggleTask(taskId)}
                      />
                      <label 
                        htmlFor={taskId} 
                        className={`text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${completedTasks.has(taskId) ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {task}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
