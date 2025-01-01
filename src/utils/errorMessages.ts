const errorMessages = [
  "Oops! Something went sideways. We're calling in the experts 🛠️",
  "Looks like the app needs a quick coffee break. Try refreshing! ☕",
  "Error 404: The vibe you ordered is temporarily unavailable.",
  "Oh no, we tripped over a wire! Don't worry, we're back on it. 🚀",
  "This isn't supposed to happen… Try again in a bit! 🙃",
  "Server's feeling introverted right now. Back soon!",
  "Glitch in the Matrix detected. Hold tight! 🤖",
  "Our bad! It's not you, it's us. (We'll fix it.)",
  "We're chasing down the bug. It's fast, but we're faster! 🐞",
  "The app's on a timeout. We promise it'll behave soon. ⏳"
];

export const getRandomErrorMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * errorMessages.length);
  return errorMessages[randomIndex];
};

export const isMobile = (): boolean => {
  return window.innerWidth <= 768;
};

export const getErrorMessage = (): string => {
  const message = getRandomErrorMessage();
  return isMobile() ? message.split('.')[0] : message;
}; 