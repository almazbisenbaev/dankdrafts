"use client";

import { useEffect, useState } from "react";
import { getTemplateById, type MemeTemplate } from "@/lib/meme-templates";
import { MemeEditor } from "@/components/meme-editor";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditorPageClient({ templateId }: { templateId: string }) {
  const [template, setTemplate] = useState<MemeTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!templateId) return;

    getTemplateById(templateId)
      .then((data) => {
        setTemplate(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch template:", err);
        setError("Failed to load template.");
        setLoading(false);
      });
  }, [templateId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading template...
          </p>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">
            {error || "Template not found"}
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
            The template you are looking for does not exist or could not be
            loaded.
          </p>
          <Link href="/">
            <Button
              variant="outline"
              className="gap-2 rounded-xl bg-transparent border-2 font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Templates
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">
            {template.name} Meme Generator
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Create and customize your {template.name} meme. 
            Add text, adjust, and download. Free meme maker with no watermarks.
          </p>
        </div>
        
        <MemeEditor template={template} />
        
        <div className="mt-12 text-center text-sm text-muted-foreground max-w-3xl mx-auto">
          <p>
            Use our {template.name} meme generator to create viral content. Customize text, 
            colors, and fonts to make your meme stand out. Perfect for social media, presentations, 
            or just for fun. Download your finished meme instantly and share it anywhere.
          </p>
        </div>
      </div>
    </div>
  );
}
