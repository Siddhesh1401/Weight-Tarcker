export const motivationalQuotes = [
  "Progress, not perfection.",
  "Every small step counts.",
  "You're stronger than you think.",
  "Consistency is key.",
  "Believe in yourself.",
  "One day at a time.",
  "You've got this!",
  "Small changes, big results.",
  "Trust the process.",
  "Your body is your temple.",
  "Health is wealth.",
  "Make yourself proud.",
  "Commit to be fit.",
  "Stay focused and never give up.",
];

export const getRandomQuote = () => {
  return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
};
