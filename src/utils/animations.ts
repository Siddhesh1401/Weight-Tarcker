// Animation utilities for smooth transitions and micro-interactions
export const animations = {
  // Page transitions
  fadeIn: 'animate-fadeIn',
  slideUp: 'animate-slideUp',
  slideDown: 'animate-slideDown',

  // Button interactions
  buttonHover: 'hover:scale-105 transition-transform duration-200',
  buttonPress: 'active:scale-95 transition-transform duration-100',

  // Card hover effects
  cardHover: 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300',

  // Loading animations
  pulse: 'animate-pulse',
  spin: 'animate-spin',

  // Progress animations
  progressBar: 'transition-all duration-500 ease-out',
  progressFill: 'transition-all duration-700 ease-in-out',

  // Modal animations
  modalEnter: 'animate-modalEnter',
  modalExit: 'animate-modalExit',
};

// CSS classes for animations (add to index.css)
export const animationClasses = `
  /* Fade In Animation */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
  }

  /* Slide Up Animation */
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-slideUp {
    animation: slideUp 0.4s ease-out;
  }

  /* Slide Down Animation */
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-slideDown {
    animation: slideDown 0.4s ease-out;
  }

  /* Modal Enter Animation */
  @keyframes modalEnter {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  .animate-modalEnter {
    animation: modalEnter 0.3s ease-out;
  }

  /* Modal Exit Animation */
  @keyframes modalExit {
    from {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
    to {
      opacity: 0;
      transform: scale(0.9) translateY(-20px);
    }
  }
  .animate-modalExit {
    animation: modalExit 0.2s ease-in;
  }

  /* Bouncing animation for notifications */
  @keyframes bounceIn {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  .animate-bounceIn {
    animation: bounceIn 0.6s ease-out;
  }

  /* Stagger animation for lists */
  .stagger-item:nth-child(1) { animation-delay: 0.1s; }
  .stagger-item:nth-child(2) { animation-delay: 0.2s; }
  .stagger-item:nth-child(3) { animation-delay: 0.3s; }
  .stagger-item:nth-child(4) { animation-delay: 0.4s; }
  .stagger-item:nth-child(5) { animation-delay: 0.5s; }

  /* Smooth hover effects */
  .smooth-hover {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Gradient animations */
  .gradient-animate {
    background-size: 200% 200%;
    animation: gradientShift 3s ease infinite;
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;
