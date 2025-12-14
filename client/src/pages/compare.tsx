import Header from "@/components/Header";
import BatchComparison from "@/components/BatchComparison";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Compare() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#1a1a24]">
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <Header />
        
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-gray-400" data-testid="link-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Single Analysis
            </Button>
          </Link>
        </div>
        
        <BatchComparison />
      </div>
    </div>
  );
}
