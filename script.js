import { GIFEncoder, quantize, applyPalette } from "https://unpkg.com/gifenc";

function makeTextAnImage(value) {

  // Canvas dimensions
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;

  let context = canvas.getContext("2d");
  context.font = "24px monospace";

  let tryUntil = 60;
  let startSize = 24;

  // // Size up until it fits nicely
  let measurements = context.measureText(value);
  for (let i = startSize; i < tryUntil; i++) {
    context.font = `${i}px monospace`;

    let measurementTest = context.measureText(value);
    if (measurementTest.width > canvas.width) {
      context.font = `${i - 1}px monospace`;
      measurements = context.measureText(value);
      break;
    }
  }

  // Try to center align
  context.textAlign = "center";
  context.textBaseline = "middle";

  context.fillText(
    value,
    canvas.width / 2,
    canvas.height / 2 + (measurements.fontBoundingBoxDescent || 2)
  );

  return canvas;
}

function makeImage(dataURL) {
  // Canvas dimensions
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;

  let context = canvas.getContext("2d");
  context.font = "24px monospace";

  var img = new Image();
  img.src = dataURL;
  context.drawImage(img,0,0,64,64)
  return canvas;
}

// Random + or - int between range rounded
function getRandomInt(min, max) {
  return Math.random() * (max - min) + min
}

function makeFileShakyBoi(dataURL, intensity) {
  if(!dataURL) return
  makeShakyBoi(makeImage(dataURL), intensity)
}

function makeEmojiShakyBoi(char, intensity) {
  if(!char) return
  makeShakyBoi(makeTextAnImage(char), intensity)
}

// Make the shaky image
function makeShakyBoi(image, intensity) {
  if(!image) return
  
  // Use this canvas to create frames
  const fgCanvas = document.createElement('canvas')
  const fgContext = fgCanvas.getContext("2d");
  fgCanvas.width = 64;
  fgCanvas.height = 64;

  // Gif Encoder
  const gif = GIFEncoder();
  for (let i = 0; i < 42; i++) {
    fgCanvas.width = fgCanvas.width;
    fgContext.drawImage(
      image,
      getRandomInt(-intensity, intensity),
      getRandomInt(-intensity, intensity)
    );

    const data = fgContext.getImageData(0, 0, fgCanvas.width, fgCanvas.height)
      .data;

    const palette = quantize(data, 256, { format: "rgba4444"});
    const index = applyPalette(data, palette, "rgba4444");

    gif.writeFrame(index, fgCanvas.width, fgCanvas.height, {
      palette,
      delay: 20,
      transparent: true
    });
  }

  gif.finish();

  const buffer = gif.bytesView();
  const blob = buffer instanceof Blob ? buffer : new Blob([buffer], { type: "image/gif" });
  const dataUrl = URL.createObjectURL(blob);

  document.getElementById("image").src = dataUrl
  document.querySelector('.bg').style.backgroundImage = `url(${dataUrl})`
  document.querySelector('.fancy-download').href = dataUrl;
}


let intensityVal = 2
var dataURL = ""
var emoji = ""

const textInput = document.getElementById("textInput")
textInput.addEventListener('input', (e) => {
  dataURL = ""
  emoji = e.data
  textInput.value = emoji
  makeEmojiShakyBoi(emoji, intensityVal)
})

const slider = document.querySelector("input[type=range]")
slider.addEventListener('change', (e) => {
  intensityVal = slider.value
  if (dataURL === "") {
    makeEmojiShakyBoi(emoji, intensityVal)
  } else {
    makeFileShakyBoi(dataURL, intensityVal)
  }
})

const fileInput = document.getElementById("fileInput")
fileInput.addEventListener("change", (e) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    dataURL = e.target.result
    makeFileShakyBoi(dataURL, intensityVal)
  }
  reader.onerror = (e) => {
    console.error("Unable to read file", e.target.error)
  }
  reader.readAsDataURL(e.target.files[0])
})

const randomStarts = ['👀', '🤡', '🤫', '😐', '🥶']
emoji = randomStarts[Math.floor(Math.random() * randomStarts.length)]
textInput.value = emoji

makeEmojiShakyBoi(textInput.value, intensityVal)

