import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl md:text-5xl font-bold">
        Gagne en clarté,{' '}
        <span className="text-green-500">agis sans attendre.</span>
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-xl">
        Un tableau simple, rapide, pour enfin <strong>avancer</strong>.
      </p>
      <div className="flex space-x-4">
        <Link href="/sign-in">
          <Button>Se connecter</Button>
        </Link>
        <Link href="/sign-up">
          <Button variant="secondary">S'inscrire</Button>
        </Link>
      </div>
    </main>
  );
}
