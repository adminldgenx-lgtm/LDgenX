import { useEffect } from 'react';
import { renderHead, type PageMeta } from '../lib/pages';

export function SEO({ meta }: { meta: PageMeta }) {
  useEffect(() => {
    const template = document.createElement('template');
    template.innerHTML = renderHead(meta);
    document.head
      .querySelectorAll(
        'title, meta[name="description"], meta[name="robots"], link[rel="canonical"], link[hreflang], meta[property^="og:"], meta[name^="twitter:"], #ldgenx-schema',
      )
      .forEach((el) => el.remove());
    document.head.append(template.content);
    document.documentElement.lang = meta.locale;
  }, [meta]);
  return null;
}
