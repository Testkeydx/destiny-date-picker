import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Download } from 'lucide-react';
import { MergedDate } from '@/types';
import { formatTestDate, getEstimatedScoreReleaseDate } from '@/utils/dataLoader';
import { suitabilityBucket, hasRx } from '@/selectors/mergedSelectors';
import { truncateText } from '@/utils/textUtils';
import logoSvg from '@/assets/logo.svg';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: MergedDate | null;
}

export function ShareModal({ isOpen, onClose, date }: ShareModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateShareableImage = async (): Promise<string> => {
    if (!date || !canvasRef.current) return '';

    setIsGenerating(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      // Set canvas size (optimized for mobile sharing)
      const width = 400;
      const height = 600;
      canvas.width = width;
      canvas.height = height;

      // Load UPangea logo (imported SVG)
      const logo = new Image();
      await new Promise((resolve) => {
        logo.onload = resolve;
        logo.onerror = () => {
          console.warn('Could not load logo');
          resolve(undefined);
        };
        logo.src = logoSvg;
      });

      // UPangea brand gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#1e40af'); // UPangea blue
      gradient.addColorStop(0.4, '#3b82f6'); // Lighter blue
      gradient.addColorStop(0.7, '#10b981'); // UPangea green
      gradient.addColorStop(1, '#059669'); // Darker green
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Header section
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MCAT Star Date', width / 2, 60);

      // Date and info
      ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#ffffff'; // Ensure date is white
      ctx.fillText(formatTestDate(date.date), width / 2, 100);
      
      ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#ffffff'; // Change from gray to white for better visibility
      ctx.fillText(`${date.weekday} • Score Release: ${getEstimatedScoreReleaseDate(date.date)}`, width / 2, 125);

      // Match quality indicator
      const suitability = date.meaning ? suitabilityBucket(date) : null;
      if (suitability) {
        let emoji = '';
        let color = '#ffffff';
        switch (suitability) {
          case 'High': emoji = '⭐'; color = '#10b981'; break;
          case 'Medium–High': emoji = '✨'; color = '#3b82f6'; break;
          case 'Medium': emoji = '📋'; color = '#f59e0b'; break;
        }
        
        ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#ffffff'; // Make match quality text white
        ctx.fillText(`${emoji} ${suitability} Match`, width / 2, 155);
      }

      // Headline
      if (date.meaning?.headline) {
        ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#ffffff';
        
        // Word wrap for headline
        const words = date.meaning.headline.split(' ');
        let line = '';
        let y = 190;
        const maxWidth = width - 40;
        
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, width / 2, y);
            line = words[n] + ' ';
            y += 25;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, width / 2, y);
      }

      // Horoscope text or feel
      const previewText = date.astroCopy?.text || date.description?.feel;
      if (previewText) {
        ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#ffffff'; // Make horoscope text white for better readability
        ctx.textAlign = 'center';
        
        const text = truncateText(previewText, 200);
        const words = text.split(' ');
        let line = '';
        let y = 250;
        const maxWidth = width - 40;
        
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(`"${line.trim()}"`, width / 2, y);
            line = words[n] + ' ';
            y += 20;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(`"${line.trim()}"`, width / 2, y);
      }

      // Mercury retrograde warning
      if (hasRx(date)) {
        ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#ffffff'; // Make warning text white (emoji will still be visible)
        ctx.fillText('⚠️ Mercury Retrograde', width / 2, 380);
      }

      // UPangea logo and branding
      if (logo.complete) {
        const logoSize = 40;
        const logoX = width - logoSize - 20;
        const logoY = height - logoSize - 20;
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
      }

      // Powered by UPangea
      ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#ffffff'; // Make branding text white for visibility
      ctx.textAlign = 'right';
      ctx.fillText('Powered by UPangea', width - 20, height - 10);

      return canvas.toDataURL('image/png');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async (method: 'web' | 'download') => {
    if (!date) return;

    try {
      const imageDataUrl = await generateShareableImage();
      
      switch (method) {
        case 'web':
          if (navigator.share && navigator.canShare) {
            const blob = await fetch(imageDataUrl).then(r => r.blob());
            const file = new File([blob], `mcat-star-date-${date.date}.png`, { type: 'image/png' });
            
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: `My MCAT Star Date: ${formatTestDate(date.date)}`,
                text: `Check out my optimal MCAT test date! ${date.meaning?.headline || ''}`,
                files: [file]
              });
            } else {
              await navigator.share({
                title: `My MCAT Star Date: ${formatTestDate(date.date)}`,
                text: `Check out my optimal MCAT test date! ${date.meaning?.headline || ''}`
              });
            }
          }
          break;
          
        case 'download':
          const link = document.createElement('a');
          link.download = `mcat-star-date-${date.date}.png`;
          link.href = imageDataUrl;
          link.click();
          break;
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (!date) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your MCAT Star Date</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Preview */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-green-500 rounded-lg p-4 text-center">
            <div className="text-white mb-2">
              <div className="font-bold text-lg">MCAT Star Date</div>
              <div className="font-semibold">{formatTestDate(date.date)}</div>
              <div className="text-sm text-blue-100">
                {date.weekday} • Score Release: {getEstimatedScoreReleaseDate(date.date)}
              </div>
              {date.meaning && (
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                    suitabilityBucket(date) === 'High' ? 'bg-green-100 text-green-800' :
                    suitabilityBucket(date) === 'Medium–High' ? 'bg-blue-100 text-blue-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {suitabilityBucket(date) === 'High' ? '⭐' : 
                     suitabilityBucket(date) === 'Medium–High' ? '✨' : '📋'} 
                    {' '}{suitabilityBucket(date)} Match
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Share Options */}
          <div className="grid grid-cols-1 gap-3">
            {/* Mobile Share */}
            {navigator.share && (
              <Button
                onClick={() => handleShare('web')}
                disabled={isGenerating}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
            )}
            
            {/* Download Option */}
            <Button
              variant="outline"
              onClick={() => handleShare('download')}
              disabled={isGenerating}
              className="flex items-center justify-center space-x-2 border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Download className="h-4 w-4" />
              <span>Save Image</span>
            </Button>
          </div>
        </div>

        {/* Hidden canvas for image generation */}
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
