import { useEffect } from "react";

interface SEOOptions {
  title: string;
  description?: string;
  canonical?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

export function useSEO({ title, description, canonical, jsonLd }: SEOOptions) {
  useEffect(() => {
    document.title = title;

    const ensureMeta = (name: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      return tag;
    };

    if (description) {
      const desc = ensureMeta("description");
      desc.setAttribute("content", description);
    }

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonical);
    }

    const existingJsonLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]')) as HTMLScriptElement[];
    existingJsonLd.forEach((s) => s.parentElement?.removeChild(s));

    if (jsonLd) {
      const dataArray = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      dataArray.forEach((data) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.text = JSON.stringify(data);
        document.head.appendChild(script);
      });
    }
  }, [title, description, canonical, jsonLd]);
}
