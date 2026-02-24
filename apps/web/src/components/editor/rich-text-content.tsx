import { cn } from '@/lib/cn';
import { sanitizeRichTextForRender } from '@/lib/rich-text';

interface RichTextContentProps {
  html: string;
  className?: string;
}

export function RichTextContent({ html, className }: RichTextContentProps) {
  const safeHtml = sanitizeRichTextForRender(html);

  return (
    <div
      className={cn('rich-text-content', className)}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: conteúdo sanitizado no backend (allowlist) e reforçado no frontend.
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
