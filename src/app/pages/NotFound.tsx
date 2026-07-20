import { Link } from "react-router";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-rise-bg flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="font-['Inter:Bold',sans-serif] font-bold text-rise-fg text-[72px] mb-4">
          404
        </h1>
        <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[20px] mb-8">
          Página não encontrada
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-[#14E9BC] text-[#000] px-6 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] hover:bg-[#12d4a8] transition-colors"
        >
          <Home size={20} />
          Voltar para Dashboard
        </Link>
      </div>
    </div>
  );
}
