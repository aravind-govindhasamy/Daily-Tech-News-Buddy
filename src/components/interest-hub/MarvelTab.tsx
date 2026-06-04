import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tv, 
  Sparkles, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Coins, 
  HelpCircle, 
  ArrowRight, 
  RotateCcw,
  Loader2,
  ExternalLink,
  Flame
} from 'lucide-react';
import { MARVEL_CHARACTERS, TRIVIA_QUESTIONS, INITIAL_POSTS } from '../../services/communityData';
import { CommunityPost } from '../../types/community';
import { NewsItem } from '../../types';
import { newsService } from '../../services/newsService';
import { geminiService } from '../../services/geminiService';
import { toast } from 'sonner';

interface MarvelTabProps {
  posts: CommunityPost[];
  onAddPost: (content: string, subcategory: string) => void;
  onAddPoints: (points: number) => void;
  onPostGenerated: (post: any) => void;
}

export function MarvelTab({
  posts,
  onAddPost,
  onAddPoints,
  onPostGenerated
}: MarvelTabProps) {
  // Characters selection State
  const [activeChar, setActiveChar] = useState(MARVEL_CHARACTERS[0]);

  // Trivia states
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Scraped news
  const [scrapedNews, setScrapedNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMarvelLive() {
      setLoadingNews(true);
      try {
        const data = await newsService.getMarvelNews(false);
        setScrapedNews(data);
      } catch (e) {
        console.warn('Error loading live Marvel news:', e);
      } finally {
        setLoadingNews(false);
      }
    }
    fetchMarvelLive();
  }, []);

  // Filter local posts of marvel
  const localMarvelPosts = posts.filter(p => p.category === 'marvel');

  const handleOptionClick = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
    setIsAnswered(true);
    
    const isCorrect = optionIdx === TRIVIA_QUESTIONS[triviaIndex].correctAnswer;
    if (isCorrect) {
      setScore(s => s + 1);
      onAddPoints(25);
      toast.success('Excellent! +25 points awarded.');
    } else {
      toast.error('Not quite right. Read the explanation below!');
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    if (triviaIndex < TRIVIA_QUESTIONS.length - 1) {
      setTriviaIndex(i => i + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetTrivia = () => {
    setTriviaIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const handleGeneratePost = async (item: NewsItem) => {
    setGeneratingId(item.id);
    try {
      const result = await geminiService.generateSocialPosts(
        item.id,
        item.title,
        item.summary || '',
        item.source || 'Marvel Feeds',
        'developer'
      );
      const newPost = {
        id: crypto.randomUUID(),
        newsId: item.id,
        newsTitle: item.title,
        newsUrl: item.url,
        linkedin: result.linkedin,
        twitter: result.twitter,
        thread: result.thread,
        imageUrl: item.url ? `https://image.pollinations.ai/prompt/${encodeURIComponent(item.title)}?width=800&height=500&nologo=true` : undefined,
        tone: 'developer',
        createdAt: new Date().toISOString()
      };
      onPostGenerated(newPost);
      toast.success('Discussions created! Check your Scheduled Social Queue!');
    } catch (err) {
      toast.error('Failed to translate and compile neural post.');
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Character Database and Bios */}
      <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-red-500" /> Marvel Characters Codex
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* List of selectors */}
          <div className="space-y-2 md:col-span-1">
            {MARVEL_CHARACTERS.map((char) => (
              <button
                key={char.name}
                onClick={() => setActiveChar(char)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between text-xs font-semibold ${
                  activeChar.name === char.name
                  ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold shadow-sm'
                  : 'border-border/40 hover:bg-muted bg-background/50'
                }`}
              >
                <span>{char.name} ({char.alias})</span>
                <span className="text-[10px] opacity-70">Stats &rarr;</span>
              </button>
            ))}
          </div>

          {/* Details visualizer card */}
          <div className="md:col-span-2 border border-border/40 rounded-xl p-5 bg-muted/10 grid grid-cols-1 sm:grid-cols-5 gap-5">
            <div className="sm:col-span-2 rounded-lg overflow-hidden border border-border/50 max-h-[170px] sm:max-h-full">
              <img src={activeChar.imageUrl} alt={activeChar.name} className="w-full h-full object-cover" />
            </div>
            
            <div className="sm:col-span-3 space-y-3.5">
              <div>
                <h4 className="text-base font-bold text-foreground">{activeChar.name}</h4>
                <p className="text-xs text-muted-foreground italic font-medium">{activeChar.alias}</p>
              </div>

              <p className="text-xs text-foreground/80 leading-relaxed font-sans line-clamp-3">
                {activeChar.description}
              </p>

              {/* Character Power Stats list */}
              <div className="space-y-2 pt-1 border-t border-border/30">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
                  <div>
                    <span className="text-muted-foreground block mb-0.5">💪 Strength</span>
                    <div className="h-2 bg-muted rounded-full relative overflow-hidden">
                      <div className="absolute top-0 left-0 bottom-0 bg-red-600" style={{ width: `${(activeChar.stats.strength / 7) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">🧠 Intelligence</span>
                    <div className="h-2 bg-muted rounded-full relative overflow-hidden">
                      <div className="absolute top-0 left-0 bottom-0 bg-blue-600" style={{ width: `${(activeChar.stats.intelligence / 7) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">⚡ Speed</span>
                    <div className="h-2 bg-muted rounded-full relative overflow-hidden">
                      <div className="absolute top-0 left-0 bottom-0 bg-amber-500" style={{ width: `${(activeChar.stats.speed / 7) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">⚔️ Combat Skill</span>
                    <div className="h-2 bg-muted rounded-full relative overflow-hidden">
                      <div className="absolute top-0 left-0 bottom-0 bg-emerald-600" style={{ width: `${(activeChar.stats.combat / 7) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Trivia Quizzes & Live Scraped News Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MCQ Trivia Block container */}
        <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" /> Cosmic Lore Quiz
            </h3>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-500" /> Earn 25 points / correct
            </span>
          </div>

          <AnimatePresence mode="wait">
            {!quizCompleted ? (
              <motion.div
                key={triviaIndex}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4 text-xs"
              >
                <div className="font-medium bg-muted/65 p-3 rounded-lg border leading-relaxed">
                  <span className="font-bold text-red-600">Q{triviaIndex+1}:</span> {TRIVIA_QUESTIONS[triviaIndex].question}
                </div>

                <div className="space-y-2">
                  {TRIVIA_QUESTIONS[triviaIndex].options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrectOption = idx === TRIVIA_QUESTIONS[triviaIndex].correctAnswer;
                    
                    let btnColor = 'border-border/60 hover:bg-muted';
                    if (isAnswered) {
                      if (isCorrectOption) btnColor = 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
                      else if (isSelected) btnColor = 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-300';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(idx)}
                        disabled={isAnswered}
                        className={`w-full text-left p-3 rounded-lg border text-xs font-medium transition-all flex items-center justify-between ${btnColor}`}
                      >
                        <span>{option}</span>
                        {isAnswered && isCorrectOption && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                        {isAnswered && isSelected && !isCorrectOption && <XCircle className="w-4 h-4 text-red-500" />}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 rounded-lg text-[11px] leading-relaxed text-slate-700 dark:text-slate-300"
                  >
                    💡 <strong className="text-indigo-600">Explanation:</strong> {TRIVIA_QUESTIONS[triviaIndex].explanation}
                  </motion.div>
                )}

                {isAnswered && (
                  <button
                    onClick={handleNextQuestion}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 text-xs transition shadow-sm"
                  >
                    <span>{triviaIndex < TRIVIA_QUESTIONS.length - 1 ? 'Next Question' : 'Complete Quiz'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6 space-y-4"
              >
                <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  🏆
                </div>
                <div>
                  <h4 className="font-bold text-sm">Quiz Showcase Completed!</h4>
                  <p className="text-xs text-muted-foreground mt-1">You score is {score} out of {TRIVIA_QUESTIONS.length} correct answers.</p>
                </div>
                <button
                  onClick={resetTrivia}
                  className="bg-muted hover:bg-muted/85 border border-border/60 text-xs font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 mx-auto transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Start Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Real-time scraped Marvel news feed */}
        <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Tv className="w-4 h-4 text-red-500" /> Scraped MCU & Comics News
            </h3>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Real Live</span>
          </div>

          {loadingNews ? (
            <div className="space-y-3.5 py-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse p-3 border border-border/30 rounded-lg space-y-1">
                  <div className="h-3 bg-muted rounded w-2/3" />
                  <div className="h-2 bg-muted rounded w-full" />
                </div>
              ))}
            </div>
          ) : scrapedNews.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <p className="text-xs text-muted-foreground">The Marvel feeds could not be retrieved instantly.</p>
              <button
                onClick={async () => {
                  setLoadingNews(true);
                  const data = await newsService.getMarvelNews(true);
                  if (data && data.length > 0) setScrapedNews(data);
                  setLoadingNews(false);
                }}
                className="bg-red-650 hover:bg-red-700 text-xs text-white border-red-550 border rounded-lg px-4 py-2 font-semibold"
              >
                🔄 Retry Fetching Feeds
              </button>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
              {scrapedNews.slice(0, 5).map((item) => (
                <div key={item.id} className="p-3 bg-muted/5 border border-border/40 rounded-lg space-y-2 hover:bg-muted/15 transition-all text-xs">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="font-bold text-red-600">{item.source || 'ScreenRant MCU'}</span>
                    <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-mono uppercase text-[9px] dark:bg-red-950/40 dark:text-red-400">
                      Scraped
                    </span>
                  </div>
                  
                  <h4 className="font-bold leading-tight text-[12px] text-foreground/95">{item.title}</h4>
                  <p className="line-clamp-2 text-muted-foreground text-[11px] leading-relaxed">{item.summary}</p>
                  
                  <div className="flex items-center gap-2 pt-1 border-t border-border/30">
                    <button
                      onClick={() => handleGeneratePost(item)}
                      disabled={generatingId === item.id}
                      className="flex-1 bg-red-600/10 hover:bg-red-600 text-red-700 hover:text-white text-[10px] font-bold py-1 px-2.2 rounded transition flex items-center justify-center gap-1"
                    >
                      {generatingId === item.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      Draft Social Promo
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 border rounded text-muted-foreground hover:bg-muted transition"
                      title="View original coverage page"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
