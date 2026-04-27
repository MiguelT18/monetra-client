import Link from "next/link";

export default function Home() {
  return (
    <main className="p-10">
      <h1 className="text-4xl font-bold uppercase">Home Page</h1>

      <div className="w-full flex gap-4 pt-4">
        <Link
          href="/auth/register"
          className="bg-white text-black w-full inline-block text-center rounded-md py-2 hover:bg-white/70 transition-all"
        >
          Registrarse
        </Link>
        <Link
          href="/auth/login"
          className="bg-white text-black w-full inline-block text-center rounded-md py-2 hover:bg-white/70 transition-all"
        >
          Iniciar sesión
        </Link>
      </div>
    </main>
  );
}
