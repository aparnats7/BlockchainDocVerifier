import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Upload from "@/pages/Upload";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/upload" component={Upload} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [user] = useState({
    name: "Adam Johnson",
    initials: "AJ"
  });

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Header user={user} />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="hidden lg:block lg:col-span-3">
              <Sidebar />
            </div>
            <div className="lg:col-span-9">
              <Router />
            </div>
          </div>
        </main>
        <footer className="bg-white border-t border-neutral-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-neutral-500">
              &copy; {new Date().getFullYear()} DocumentChain. All documents are securely verified and stored using blockchain technology.
            </p>
          </div>
        </footer>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
