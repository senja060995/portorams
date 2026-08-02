'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Headset, MessageCircle, Send, X } from 'lucide-react';

import {
  streamChatMessage,
  type ChatMeta,
  type ChatRedirect,
} from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Locale } from '@/i18n/config';

interface ChatMessage {
  id: number;
  role: 'user' | 'bot';
  text: string;
  redirect?: ChatRedirect;
}

/** Pause before the first character appears so the reply feels human. */
const MIN_TYPING_MS = 900;

/**
 * Floating customer-service chat. Replies stream in from the backend as
 * newline-delimited JSON; the widget first shows a typing indicator, then
 * reveals the answer progressively so it reads like a real person typing.
 * Price questions always surface a prominent WhatsApp button.
 */
export function ChatWidget() {
  const locale = useLocale() as Locale;
  const t = useTranslations('chat');

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingDots, setTypingDots] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const nextIdRef = useRef(1);
  const botIdRef = useRef<number | null>(null);
  const pendingRef = useRef('');
  const metaRef = useRef<ChatMeta | null>(null);
  const startAtRef = useRef(0);

  const getMeta = () => metaRef.current;

  const chips = [t('chipPrice'), t('chipServices'), t('chipContact')];

  // Seed a greeting the first time the panel opens.
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'bot', text: t('greeting'), id: nextIdRef.current++ }]);
    }
  }, [open, messages.length, t]);

  // Keep the newest message in view.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, typingDots, open]);

  const setBotText = (text: string) => {
    const id = botIdRef.current;
    if (id === null) return;
    setMessages((current) =>
      current.map((message) =>
        message.id === id ? { ...message, text } : message,
      ),
    );
  };

  const handleSend = async (text?: string) => {
    const value = (text ?? input).trim();
    if (!value || loading) return;

    setInput('');
    setMessages((current) => [
      ...current,
      { role: 'user', text: value, id: nextIdRef.current++ },
    ]);
    setLoading(true);
    setTypingDots(true);

    botIdRef.current = null;
    pendingRef.current = '';
    metaRef.current = null;
    startAtRef.current = Date.now();

    let started = false;

    const applyPending = () => {
      if (botIdRef.current === null) {
        botIdRef.current = nextIdRef.current++;
        const redirect = metaRef.current?.redirect;
        setMessages((current) => [
          ...current,
          { role: 'bot', text: '', redirect, id: botIdRef.current as number },
        ]);
      }
      setBotText(pendingRef.current);
    };

    try {
      await streamChatMessage(
        value,
        locale,
        (meta) => {
          metaRef.current = meta;
        },
        (delta) => {
          pendingRef.current += delta;
          if (!started) {
            started = true;
            const elapsed = Date.now() - startAtRef.current;
            const wait = Math.max(0, MIN_TYPING_MS - elapsed);
            if (wait > 0) {
              window.setTimeout(applyPending, wait);
            } else {
              applyPending();
            }
          } else {
            setBotText(pendingRef.current);
          }
        },
      );

      // Stream finished without a single delta (e.g. empty AI answer).
      if (!started) {
        applyPending();
        setBotText(t('error'));
      }
    } catch {
      // Read through a getter: assigning metaRef.current = null narrows the
      // ref's .current to `never` across the await boundary, so a direct
      // optional-chain read fails to type-check here.
      const redirect = getMeta()?.redirect;
      if (botIdRef.current === null) {
        botIdRef.current = nextIdRef.current++;
        setMessages((current) => [
          ...current,
          { role: 'bot', text: t('error'), redirect, id: botIdRef.current as number },
        ]);
      } else {
        setBotText(t('error'));
      }
    } finally {
      setTypingDots(false);
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? t('close') : t('toggle')}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-white shadow-card-hover transition-transform duration-300 ease-smooth hover:scale-105 sm:bottom-8 sm:right-8"
      >
        {open ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Headset className="h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={t('title')}
          className="fixed bottom-24 right-5 z-40 flex h-[28rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-card-hover sm:bottom-[5.5rem] sm:right-8 sm:h-[30rem] sm:w-96"
        >
          <div className="flex items-center justify-between bg-brand-gradient px-5 py-4">
            <div>
              <p className="text-sm font-bold text-white">{t('title')}</p>
              <p className="text-xs text-white/80">{t('subtitle')}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('close')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div
            ref={scrollRef}
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
                    message.role === 'user'
                      ? 'rounded-br-sm bg-brand-800 text-white'
                      : 'rounded-bl-sm bg-ink-100 text-ink-800',
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  {message.redirect ? (
                    <a
                      href={message.redirect.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-xs font-bold text-white transition-transform duration-200 ease-smooth hover:scale-[1.03]"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      {message.redirect.label}
                    </a>
                  ) : null}
                </div>
              </div>
            ))}

            {typingDots ? (
              <div className="flex justify-start" aria-label={t('typing')}>
                <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-ink-100 px-4 py-3">
                  <span className="typing-dot h-2 w-2 rounded-full bg-ink-400" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-ink-400 [animation-delay:150ms]" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-ink-400 [animation-delay:300ms]" />
                </div>
              </div>
            ) : null}
          </div>

          {messages.length <= 1 ? (
            <div className="flex flex-wrap gap-2 border-t border-ink-200 px-4 py-3">
              {chips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => void handleSend(chip)}
                  disabled={loading}
                  className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-800 transition-colors hover:bg-brand-100 disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>
          ) : null}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleSend();
            }}
            className="flex items-center gap-2 border-t border-ink-200 px-4 py-3"
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t('placeholder')}
              aria-label={t('placeholder')}
              className="flex-1 rounded-full border border-ink-300 px-4 py-2.5 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label={t('send')}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-800 text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
