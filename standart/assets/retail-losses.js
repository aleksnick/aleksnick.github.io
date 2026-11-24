const lossView = document.querySelector("[data-loss-view]");
const lossStories = [...document.querySelectorAll(".loss-story")];
let lossFramePending = false;

function updateLossView() {
  lossFramePending = false;
  const readingLine = window.innerHeight * 0.62;
  const currentStory = lossStories.reduce((current, story) => {
    return story.getBoundingClientRect().top <= readingLine ? story : current;
  }, lossStories[0]);

  if (lossView.dataset.current !== currentStory.id) {
    lossView.dataset.current = currentStory.id;
  }
}

function scheduleLossView() {
  if (lossFramePending) return;
  lossFramePending = true;
  window.requestAnimationFrame(updateLossView);
}

window.addEventListener("scroll", scheduleLossView, { passive: true });
window.addEventListener("resize", scheduleLossView);
window.addEventListener("pageshow", scheduleLossView);
scheduleLossView();
