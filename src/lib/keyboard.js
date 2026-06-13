/**
 * A small piano keyboard for pitch entry, shared by every tool with a
 * note-name input. Clicking a key appends the note to the most recently
 * focused registered input and fires input/change events, so the tool
 * recalculates as if the user had typed. Folded into a <details> so it
 * never crowds the panel.
 */

const WHITE_NOTES = ["C", "D", "E", "F", "G", "A", "B"];
// black key name and which white key it follows (index in WHITE_NOTES)
const BLACK_NOTES = [
  { name: "C#", after: 0 },
  { name: "D#", after: 1 },
  { name: "F#", after: 3 },
  { name: "G#", after: 4 },
  { name: "A#", after: 5 },
];

/**
 * @param {HTMLElement} host        empty element the keyboard renders into
 * @param {{ inputs: HTMLInputElement[], withOctave?: boolean,
 *           baseOctave?: number, octaves?: number }} options
 */
export function mountKeyboard(host, { inputs, withOctave = true, baseOctave = 4, octaves = 2 } = { inputs: [] }) {
  if (!host || !inputs.length) return;
  let target = inputs[0];
  inputs.forEach((input) => {
    input.addEventListener("focus", () => {
      target = input;
    });
  });
  let octave = baseOctave;

  const details = document.createElement("details");
  details.className = "pk";
  const summary = document.createElement("summary");
  summary.textContent = "Keyboard";
  const wrap = document.createElement("div");
  wrap.className = "pk-wrap";
  details.append(summary, wrap);

  const keys = document.createElement("div");
  keys.className = "pk-keys";

  const appendToken = (token) => {
    if (!target) return;
    const value = target.value;
    const needsSpace = value.length > 0 && !/[\s,;|]$/.test(value);
    target.value = `${value}${needsSpace ? " " : ""}${token}`;
    target.dispatchEvent(new Event("input", { bubbles: true }));
    target.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const keyButton = (label, token, className) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.title = token;
    // pointerdown preventDefault keeps focus (and the append target) on the input
    button.addEventListener("pointerdown", (event) => event.preventDefault());
    button.addEventListener("click", () => appendToken(button.dataset.token ?? token));
    return button;
  };

  const WHITE_W = 1.7; // rem
  const renderKeys = () => {
    keys.innerHTML = "";
    const octaveCount = withOctave ? octaves : 1;
    for (let o = 0; o < octaveCount; o++) {
      WHITE_NOTES.forEach((name, index) => {
        const token = withOctave ? `${name}${octave + o}` : name;
        const key = keyButton(name, token, "pk-key pk-white");
        key.dataset.token = token;
        key.style.left = `${(o * 7 + index) * WHITE_W}rem`;
        keys.append(key);
      });
      BLACK_NOTES.forEach(({ name, after }) => {
        const token = withOctave ? `${name}${octave + o}` : name;
        const key = keyButton(name, token, "pk-key pk-black");
        key.dataset.token = token;
        key.style.left = `${(o * 7 + after) * WHITE_W + WHITE_W * 0.62}rem`;
        keys.append(key);
      });
    }
    keys.style.width = `${octaveCount * 7 * WHITE_W}rem`;
  };

  const controls = document.createElement("div");
  controls.className = "pk-controls";
  if (withOctave) {
    const down = document.createElement("button");
    down.type = "button";
    down.textContent = "−8va";
    const label = document.createElement("span");
    const up = document.createElement("button");
    up.type = "button";
    up.textContent = "+8va";
    const updateLabel = () => {
      label.textContent = `C${octave}–B${octave + octaves - 1}`;
    };
    down.addEventListener("pointerdown", (event) => event.preventDefault());
    up.addEventListener("pointerdown", (event) => event.preventDefault());
    down.addEventListener("click", () => {
      octave = Math.max(0, octave - 1);
      updateLabel();
      renderKeys();
    });
    up.addEventListener("click", () => {
      octave = Math.min(7, octave + 1);
      updateLabel();
      renderKeys();
    });
    updateLabel();
    controls.append(down, label, up);
  }
  const backspace = document.createElement("button");
  backspace.type = "button";
  backspace.textContent = "⌫ last";
  backspace.title = "Remove the last token";
  backspace.addEventListener("pointerdown", (event) => event.preventDefault());
  backspace.addEventListener("click", () => {
    if (!target) return;
    target.value = target.value.replace(/[\s,;|]*\S+[\s,;|]*$/, "");
    target.dispatchEvent(new Event("input", { bubbles: true }));
    target.dispatchEvent(new Event("change", { bubbles: true }));
  });
  controls.append(backspace);

  renderKeys();
  wrap.append(keys, controls);
  host.append(details);
}
