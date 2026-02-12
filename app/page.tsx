import { TemplateGallery } from "@/components/template-gallery";

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
