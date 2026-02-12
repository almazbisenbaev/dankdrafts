import { TemplateGallery } from "@/components/template-gallery";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DankDrafts - Free Online Meme Generator",
  description: "Create viral memes with our free meme generator. Choose from popular templates, add custom text, and download instantly. No watermarks, no signup required.",
  openGraph: {
    title: "DankDrafts - Free Online Meme Generator",
    description: "Create viral memes with our free meme generator",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">

      <main>
        <TemplateGallery />
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Made by <a href="https://helloalmaz.com" target="_blank">Almaz Bisenbaev</a>.
      </footer>
      
    </div>
  );
}
