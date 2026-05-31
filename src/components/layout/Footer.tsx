import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

const APP_URL = 'https://recipe-calculate.vercel.app';

export function Footer() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: 'RecipeCalc — Costos de recetas',
        text: 'Calculá el costo de tus recetas de forma gratuita.',
        url: APP_URL,
      }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(APP_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <footer className="border-t border-cream-200 bg-white/60 mt-12">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 gap-4 flex-wrap">
        <p className="text-xs text-charcoal-700/40">
          Herramienta gratuita para la comunidad &mdash;{' '}
          <a
            href={APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-terracotta-500 hover:underline"
          >
            {APP_URL.replace('https://', '')}
          </a>
        </p>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 rounded-lg border border-cream-200 bg-white px-3 py-1.5 text-xs font-medium text-charcoal-700/60 shadow-card hover:text-terracotta-500 hover:border-terracotta-300/50 transition-colors"
        >
          {copied ? <Check size={13} className="text-forest-500" /> : <Share2 size={13} />}
          {copied ? 'Link copiado' : 'Compartir'}
        </button>
      </div>
    </footer>
  );
}
