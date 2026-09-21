import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

import Home from "./pages/Home.jsx";
import Identify from "./pages/Identify.jsx";
import Results from "./pages/Results.jsx";
import AskAI from "./pages/AskAI.jsx";
import Categories from "./pages/Categories.jsx";
import LocalGuide from "./pages/LocalGuide.jsx";
import Impact from "./pages/Impact.jsx";
import Learn from "./pages/Learn.jsx";
import KnowledgeBase from "./pages/KnowledgeBase.jsx";
import Analytics from "./pages/Analytics.jsx";
import ResponsibleAI from "./pages/ResponsibleAI.jsx";
import About from "./pages/About.jsx";
import DecisionSupport from "./pages/DecisionSupport.jsx";
import MyActions from "./pages/MyActions.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div key={location.pathname} className="page-enter">
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/identify" element={<Identify />} />
            <Route path="/results" element={<Results />} />
            <Route path="/ask-ai" element={<AskAI />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/decision-support" element={<DecisionSupport />} />
            <Route path="/my-actions" element={<MyActions />} />
            <Route path="/local-guide" element={<LocalGuide />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/knowledge-base" element={<KnowledgeBase />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/responsible-ai" element={<ResponsibleAI />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
}