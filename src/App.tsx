import { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { extractTextFromPdf } from './lib/pdf';
import { summarizeText } from './lib/gemini';
import Markdown from 'react-markdown';
import { Loader2, Sparkles, BookOpen, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'processing' | 'result'>('upload');

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setStep('processing');
    
    try {
      const text = await extractTextFromPdf(file);
      const aiSummary = await summarizeText(text);
      setSummary(aiSummary || "Could not generate summary.");
      setStep('result');
      toast.success("Summary generated successfully!");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setStep('upload');
      toast.error("Failed to summarize PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setSummary(null);
    setError(null);
    setStep('upload');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" />
      
      {/* Purple Tagline Banner */}
      <div className="w-full bg-purple-600 py-2 px-4 text-center flex items-center justify-center space-x-2">
        <Sparkles className="w-4 h-4 text-white" />
        <p className="text-white text-xs md:text-sm font-medium tracking-wide">
          ✨ New: Summarize academic papers up to 100 pages for free! Powered by Gemini.
        </p>
      </div>

      {/* Header */}
      <header className="w-full py-4 px-8 flex justify-between items-center border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">summarise.ai</span>
        </div>
        <nav className="hidden md:flex space-x-8 text-sm font-medium text-gray-500">
          <a href="#" className="hover:text-black transition-colors">How it works</a>
          <a href="#" className="hover:text-black transition-colors">Pricing</a>
          <a href="#" className="hover:text-black transition-colors">About</a>
        </nav>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 md:py-24">
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
                  Summarize your PDFs <br /> in <span className="text-purple-600">seconds.</span>
                </h1>
                <p className="text-lg text-gray-500 max-w-xl mx-auto">
                  The fastest way for students to get key insights from academic papers, 
                  textbooks, and lecture notes.
                </p>
              </div>

              <FileUploader onFileSelect={handleFileSelect} isLoading={isLoading} />

              {error && (
                <div className="flex items-center justify-center space-x-2 text-red-500 bg-red-50 p-4 rounded-xl max-w-xl mx-auto">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto">
                    <BookOpen className="w-5 h-5 text-gray-600" />
                  </div>
                  <h3 className="font-semibold">Academic Focus</h3>
                  <p className="text-sm text-gray-500">Optimized for research papers and study materials.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto">
                    <Clock className="w-5 h-5 text-gray-600" />
                  </div>
                  <h3 className="font-semibold">Save Hours</h3>
                  <p className="text-sm text-gray-500">Get the gist of a 50-page PDF in under a minute.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5 text-gray-600" />
                  </div>
                  <h3 className="font-semibold">AI Powered</h3>
                  <p className="text-sm text-gray-500">Powered by Gemini for high-quality summaries.</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-6 py-20"
            >
              <div className="relative">
                <div className="w-20 h-20 border-4 border-gray-100 rounded-full"></div>
                <Loader2 className="w-20 h-20 text-black animate-spin absolute top-0 left-0" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Reading your PDF...</h2>
                <p className="text-gray-500">Our AI is extracting key insights for you.</p>
              </div>
            </motion.div>
          )}

          {step === 'result' && summary && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Summary</h2>
                  <p className="text-gray-500">Generated by summarise.ai</p>
                </div>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Upload New
                </button>
              </div>

              <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
                <div className="markdown-body">
                  <Markdown>{summary}</Markdown>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(summary);
                    toast.success("Summary copied to clipboard!");
                  }}
                  className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
                >
                  Copy to clipboard
                </button>
                <span className="text-gray-300">|</span>
                <button className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
                  Download as PDF
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="w-full py-8 px-8 border-t border-gray-200 text-center text-sm text-gray-400">
        <p>&copy; 2026 summarise.ai. Built for students.</p>
      </footer>
    </div>
  );
}
