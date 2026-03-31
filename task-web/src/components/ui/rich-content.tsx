import { useState } from 'react';
import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';

import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

interface RichContentProps {
  content: string;
  className?: string;
}

export function RichContent({
  content,
  className,
}: Readonly<RichContentProps>) {
  const [src, setSrc] = useState<string | null>(null);

  return (
    <>
      <div
        className={cn(
          'prose prose-sm dark:prose-invert max-w-none [&_img]:cursor-pointer',
          className,
        )}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
        onClick={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.tagName === 'IMG') setSrc(target.src);
        }}
      />
      <Lightbox
        open={!!src}
        close={() => setSrc(null)}
        slides={src ? [{ src }] : []}
        plugins={[Zoom]}
        carousel={{ finite: true }}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
        }}
      />
    </>
  );
}
