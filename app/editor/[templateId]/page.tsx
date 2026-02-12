"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getTemplateById, type MemeTemplate } from "@/lib/meme-templates";
import { MemeEditor } from "@/components/meme-editor";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditorPage() {
  const params = useParams<{ templateId: string }>();
  const [template, setTemplate] = useState<MemeTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.templateId) return;

    getTemplateById(params.templateId)
      .then((data) => {
        setTemplate(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch template:", err);
        setError("Failed to load template.");
        setLoading(false);
      });
  }, [params.templateId]);

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

  return <MemeEditor template={template} />;
}
