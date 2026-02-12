"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getTemplates, type MemeTemplate } from "@/lib/meme-templates";
import { ImageOff, ArrowRight, Flame } from "lucide-react";

function TemplateSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-border bg-card animate-pulse">
      <div className="aspect-[4/3] bg-secondary" />
      <div className="p-4">
        <div className="h-5 w-32 rounded-lg bg-secondary" />
      </div>
    </div>
  );
}

export function TemplateGallery() {
  const [templates, setTemplates] = useState<MemeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTemplates()
      .then((data) => {
        setTemplates(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch templates:", err);
        setError("Failed to load templates. Please try again later.");
        setLoading(false);
      });
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="mb-12 text-center">
        <div className="mx-auto mb-5 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/25">
            <Flame className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold text-foreground tracking-tight">
            DankDrafts
          </span>
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl text-balance">
          Pick a template,
          <br />
          <span className="text-primary">make it dank.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground leading-relaxed">
          Choose a meme template below and add your own text.
          No sign-up required.
        </p>
      </div>

      {error && (
        <div className="mx-auto max-w-md rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-5 text-center text-sm text-destructive">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <TemplateSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && !error && templates.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-secondary">
            <ImageOff className="h-9 w-9 text-muted-foreground" />
          </div>
          <h2 className="font-display text-xl font-semibold text-foreground">
            No templates yet
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
            Templates will appear here once they are added to the database.
            Check the setup guide for instructions.
          </p>
        </div>
      )}

      {!loading && !error && templates.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Link
              key={template.id}
              href={`/editor/${template.id}`}
              className="group relative overflow-hidden rounded-2xl border-2 border-border bg-card transition-all duration-200 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={template.image}
                  alt={template.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between p-4">
                <h3 className="font-display text-base font-semibold text-card-foreground">
                  {template.name}
                </h3>
                <span className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  Edit
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
