import { useState, useEffect, useCallback } from 'react';

interface ZenBotProps {
  tasks: { title: string; status: string; priority: string; dueDate: string; category: string; archived: boolean }[];
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  type: 'bot' | 'user';
  timestamp: string;
}

const getSmartResponse = (input: string, tasks: ZenBotProps['tasks']): string => {
  const lower = input.toLowerCase();
  const activeTasks = tasks.filter((t) => !t.archived);
  const overdue = activeTasks.filter((t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date());
  const highPriority = activeTasks.filter((t) => t.priority === 'high' && t.status !== 'done');
  const today = activeTasks.filter((t) => t.dueDate === new Date().toISOString().split('T')[0] && t.status !== 'done');

  if (lower.includes('bonjour') || lower.includes('salut') || lower.includes('hello')) {
    return `Bonjour ! 👋 Je suis ZenBot, votre assistant intelligent. J'ai analyse vos taches et voici ce que je vois :\n\n` +
      `• ${activeTasks.length} taches actives\n` +
      `${overdue.length > 0 ? `• ⚠️ ${overdue.length} tache(s) en retard\n` : ''}` +
      `${highPriority.length > 0 ? `• 🔴 ${highPriority.length} tache(s) haute priorite\n` : ''}` +
      `${today.length > 0 ? `• 📌 ${today.length} tache(s) pour aujourd'hui\n` : ''}` +
      `\nQue puis-je faire pour vous ?`;
  }

  if (lower.includes('priori') || lower.includes('commencer') || lower.includes('faire en premier')) {
    if (highPriority.length > 0) {
      const task = highPriority[0];
      return `🧠 Voici ma recommandation :\n\nCommencez par "**${task.title}**" - c'est votre tache la plus prioritaire.\n\n${overdue.length > 0 ? `⚠️ Attention, vous avez ${overdue.length} tache(s) en retard !` : '✅ Pas de tache en retard.'}`;
    }
    return `✅ Bravo ! Vous n'avez pas de tache haute priorite en cours. Regardez les taches moyennes ou basse priorite.`;
  }

  if (lower.includes('retard') || lower.includes('en retard') || lower.includes('en retard')) {
    if (overdue.length === 0) return `🎉 Aucune tache en retard ! Vous etes tres bien organise.`;
    return `⚠️ Voici vos taches en retard :\n\n${overdue.slice(0, 5).map((t, i) => `${i + 1}. ${t.title}`).join('\n')}\n\n${overdue.length > 5 ? `\n... et ${overdue.length - 5} autres.` : ''}\n\nJe vous conseille de les traiter en priorite ou de les reporter.`;
  }

  if (lower.includes('repartition') || lower.includes('charge') || lower.includes('travail')) {
    const byCategory = activeTasks.reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + 1; return acc; }, {} as Record<string, number>);
    return `📊 Repartition de votre charge :\n\n${Object.entries(byCategory).map(([cat, count]) => `• ${cat}: ${count} tache(s)`).join('\n')}\n\nTotal: ${activeTasks.length} taches actives`;
  }

  if (lower.includes('conseil') || lower.includes('astuce') || lower.includes('aide')) {
    const tips = [
      "💡 Essayez le mode Focus pour les taches importantes - le minuteur Pomodoro aide a garder la concentration.",
      "💡 Regroupez vos taches par categorie pour mieux organiser votre semaine.",
      "💡 Utilisez les etiquettes pour creer des groupes flexibles de taches.",
      "💡 Commencez par les taches courtes (< 15 min) pour gagner en momentum.",
      "💡 Si vous avez plus de 5 taches en retard, considerez d'en reporter certaines.",
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }

  if (lower.includes('stat') || lower.includes(' Resume') || lower.includes('bilan')) {
    const done = activeTasks.filter((t) => t.status === 'done').length;
    const total = activeTasks.length;
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;
    return `📈 Votre bilan :\n\n• ${done}/${total} taches terminees (${rate}%)\n• ${overdue.length} en retard\n• ${highPriority.length} haute priorite restante\n\n${rate >= 80 ? '🏆 Excellent travail !' : rate >= 50 ? '👍 Bonne progression, continuez !' : '💪 Vous pouvez faire mieux, concentrez-vous !'}`;
  }

  return `🤖 Je suis ZenBot. Je peux vous aider avec :\n\n• "Que faire en priorite ?" - recommandation intelligente\n• "Taches en retard" - vue d'ensemble\n• "Repartition" - charge par categorie\n• "Conseil" - astuce du jour\n• "Statistiques" - votre bilan\n\nPosez-moi une question !`;
};

export default function ZenBot({ tasks, onClose }: ZenBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: `Bonjour ! 👋 Je suis ZenBot, votre assistant IA. Posez-moi des questions sur vos taches !`,
      type: 'bot',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: String(Date.now()),
      text: input,
      type: 'user',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getSmartResponse(input, tasks);
      const botMsg: Message = {
        id: String(Date.now() + 1),
        text: response,
        type: 'bot',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600 + Math.random() * 800);
  }, [input, tasks]);

  return (
    <div className="zenbot-overlay">
      <div className="zenbot-panel">
        <div className="zenbot-header">
          <span>🤖 ZenBot</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="zenbot-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`zenbot-msg zenbot-${msg.type}`}>
              <div className="zenbot-msg-text">{msg.text}</div>
            </div>
          ))}
          {isTyping && (
            <div className="zenbot-msg zenbot-bot">
              <div className="zenbot-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>
        <div className="zenbot-input-area">
          <input
            type="text"
            placeholder="Demandez-moi quelque chose..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="btn btn-primary" onClick={handleSend}>➤</button>
        </div>
      </div>
    </div>
  );
}
