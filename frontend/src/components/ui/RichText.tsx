import { Fragment } from 'react';

import { cn } from '@/lib/utils';

/**
 * Minimal Markdown subset renderer that outputs React elements rather than raw
 * HTML. Because nothing is passed through dangerouslySetInnerHTML, CMS content
 * cannot inject script tags even if an editor account is compromised.
 *
 * Supported: ## / ### headings, paragraphs, - and 1. lists, > quotes,
 * **bold**, *italic*, `code`, and [text](href) links.
 */

type Block =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] };

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = source.replace(/\r\n/g, '\n').split('\n');

  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let quote: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list?.items.length) {
      blocks.push(
        list.ordered
          ? { type: 'ol', items: list.items }
          : { type: 'ul', items: list.items },
      );
    }
    list = null;
  };
  const flushQuote = () => {
    if (quote.length) {
      blocks.push({ type: 'quote', text: quote.join(' ') });
      quote = [];
    }
  };
  const flushAll = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line === '') {
      flushAll();
      continue;
    }

    const heading = /^(#{2,3})\s+(.*)$/.exec(line);
    if (heading) {
      flushAll();
      blocks.push({
        type: 'heading',
        level: heading[1].length === 2 ? 2 : 3,
        text: heading[2],
      });
      continue;
    }

    const unordered = /^[-*]\s+(.*)$/.exec(line);
    if (unordered) {
      flushParagraph();
      flushQuote();
      if (!list || list.ordered) {
        flushList();
        list = { ordered: false, items: [] };
      }
      list.items.push(unordered[1]);
      continue;
    }

    const ordered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (ordered) {
      flushParagraph();
      flushQuote();
      if (!list || !list.ordered) {
        flushList();
        list = { ordered: true, items: [] };
      }
      list.items.push(ordered[1]);
      continue;
    }

    const blockquote = /^>\s?(.*)$/.exec(line);
    if (blockquote) {
      flushParagraph();
      flushList();
      quote.push(blockquote[1]);
      continue;
    }

    flushList();
    flushQuote();
    paragraph.push(line);
  }

  flushAll();
  return blocks;
}

const INLINE_PATTERN =
  /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

/** Renders bold, italic, inline code, and links inside a text run. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const segments = text.split(INLINE_PATTERN).filter((s) => s !== '');

  segments.forEach((segment, index) => {
    const key = `${keyPrefix}-${index}`;

    if (segment.startsWith('**') && segment.endsWith('**')) {
      nodes.push(<strong key={key}>{segment.slice(2, -2)}</strong>);
      return;
    }
    if (segment.startsWith('`') && segment.endsWith('`')) {
      nodes.push(
        <code key={key} className="rounded bg-ink-100 px-1.5 py-0.5 text-[0.9em]">
          {segment.slice(1, -1)}
        </code>,
      );
      return;
    }
    if (segment.startsWith('*') && segment.endsWith('*')) {
      nodes.push(<em key={key}>{segment.slice(1, -1)}</em>);
      return;
    }

    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(segment);
    if (link) {
      const [, label, href] = link;
      // Only http(s), mailto, tel, and site-relative links are allowed, so a
      // javascript: URL in CMS content cannot become a clickable vector.
      const safe = /^(https?:\/\/|mailto:|tel:|\/)/i.test(href);
      if (!safe) {
        nodes.push(<Fragment key={key}>{label}</Fragment>);
        return;
      }
      const external = /^https?:\/\//i.test(href);
      nodes.push(
        <a
          key={key}
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {label}
        </a>,
      );
      return;
    }

    nodes.push(<Fragment key={key}>{segment}</Fragment>);
  });

  return nodes;
}

interface RichTextProps {
  content: string;
  className?: string;
}

export function RichText({ content, className }: RichTextProps) {
  const blocks = parseBlocks(content ?? '');

  return (
    <div className={cn('prose-rams', className)}>
      {blocks.map((block, index) => {
        const key = `b${index}`;

        switch (block.type) {
          case 'heading':
            return block.level === 2 ? (
              <h2 key={key}>{renderInline(block.text, key)}</h2>
            ) : (
              <h3 key={key}>{renderInline(block.text, key)}</h3>
            );
          case 'quote':
            return <blockquote key={key}>{renderInline(block.text, key)}</blockquote>;
          case 'ul':
            return (
              <ul key={key}>
                {block.items.map((item, i) => (
                  <li key={`${key}-${i}`}>{renderInline(item, `${key}-${i}`)}</li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={key}>
                {block.items.map((item, i) => (
                  <li key={`${key}-${i}`}>{renderInline(item, `${key}-${i}`)}</li>
                ))}
              </ol>
            );
          default:
            return <p key={key}>{renderInline(block.text, key)}</p>;
        }
      })}
    </div>
  );
}
