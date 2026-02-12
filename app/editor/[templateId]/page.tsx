import { Metadata } from "next";
import { getTemplateById } from "@/lib/meme-templates";
import EditorPageClient from "./page-client";

type Props = {
  params: Promise<{ templateId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { templateId } = await params;
  
  try {
    const template = await getTemplateById(templateId);
    
    if (!template) {
      return {
        title: "Template Not Found | DankDrafts",
        description: "The meme template you're looking for could not be found.",
      };
    }

    return {
      title: `${template.name} Meme Generator | DankDrafts`,
      description: `Create ${template.name} memes with our free online meme generator. Add custom text, adjust styles, and download your memes instantly. No watermarks, no signup required.`,
      openGraph: {
        title: `${template.name} Meme Generator`,
        description: `Create and customize ${template.name} memes for free`,
        images: [template.image],
      },
    };
  } catch (error) {
    return {
      title: "Meme Editor | DankDrafts",
      description: "Create and customize memes with our free online meme generator.",
    };
  }
}

export default async function EditorPage({ params }: Props) {
  const { templateId } = await params;
  return <EditorPageClient templateId={templateId} />;
}
