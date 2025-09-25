import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, Mail } from 'lucide-react';
import { MergedDate } from '@/types';
import { formatTestDate } from '@/utils/dataLoader';
import { supabase } from '@/lib/supabase';

interface RemindMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: MergedDate | null;
}

export function RemindMeModal({ isOpen, onClose, date }: RemindMeModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !email) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Save email reminder to Supabase
      const { error: insertError } = await supabase
        .from('email_subscribers')
        .insert([
          {
            email: email.trim(),
            full_name: `Reminder for ${formatTestDate(date.date)}`, // Store test date info in name field
            university: null // Optional field
          }
        ]);

      if (insertError) {
        console.error('Error saving reminder:', insertError);
        setError(`Failed to set reminder: ${insertError.message}`);
        return;
      }

      setIsSuccess(true);
      setEmail('');
      
      // Auto-close after 2 seconds on success
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Unexpected error:', error);
      setError('Failed to set reminder. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setIsSuccess(false);
    onClose();
  };

  if (!date) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-upangea-blue" />
            Remind Me When Registration Opens
          </DialogTitle>
        </DialogHeader>

        {isSuccess ? (
          <div className="text-center py-6">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Bell className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-green-600 mb-2">
              Reminder Set! 🎉
            </h3>
            <p className="text-foreground-secondary">
              We'll email you when registration opens for {formatTestDate(date.date)}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center py-2">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {formatTestDate(date.date)}
              </h3>
              <p className="text-sm text-foreground-secondary">
                Get notified when MCAT registration opens for your optimal test date
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-email" className="text-foreground-secondary">
                Email Address *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                <Input
                  id="reminder-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!email || isSubmitting}
                className="flex-1 bg-gradient-primary hover:opacity-90"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Setting...
                  </div>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Remind Me
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-foreground-muted text-center">
              We'll only email you about MCAT registration for this specific date. 
              No spam, unsubscribe anytime.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
