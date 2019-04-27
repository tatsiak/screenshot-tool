var canvas = null;
var ctx = null;
var captureButton = null;

let mouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;
let mouseX = 0;
let mouseY = 0;
let canvasX = 0;
let canvasY = 0;
let mouseSelectionBound = {l: 0, t: 0, w: 0, h: 0};


function onMouseUp() {
  mouseDown = false;
  if (!document.querySelector('#sct-captureButton')) {
    captureButton = document.createElement('button');
    captureButton.innerText = 'captureButton';
    captureButton.id = 'sct-captureButton';
    captureButton.setAttribute('style', 'position: fixed; left: 0; top: 0; z-index: 60001;');
    document.body.appendChild(captureButton);
    captureButton.addEventListener('click', onCapture);
  }
}

function onCapture() {
  console.log('onCapture!');

  const {l, t, w, h} = mouseSelectionBound;
  const destCanvasElement = document.createElement('canvas');
  destCanvasElement.id = 'sct-dest-canvas';
  destCanvasElement.setAttribute('style',
    `height: ${h/2}px; width:${w/2}px; z-index: 99999;position: absolute;top: 0;left: 0; border: 1px solid green;`);

  document.body.appendChild(destCanvasElement);

  const destCanvas = document.querySelector('#sct-dest-canvas');


  const destCtx = setupCanvas(destCanvas);

  destCtx.lineWidth = 5;
  destCtx.beginPath();
  destCtx.moveTo(100, 100);
  destCtx.lineTo(200, 200);
  destCtx.stroke();

  var image = new Image();
  image.onload = function () {
    console.log('drawing dest image');

    destCtx.drawImage(image, l, t, w, h, 0, 0, w, h);
  };

  image.src = imageSource;

  console.log('screnshoted img: ', convertCanvasToImage(destCanvas));


  document.body.removeChild(canvas);
  // document.body.removeChild(destCanvas);
  document.body.removeChild(captureButton);
}



function drawMouseSelection(e) {
  mouseX = e.clientX * 2  - canvasX;
  mouseY = e.clientY * 2 - canvasY;
  if (!mouseDown) return;
  ctx.clearRect(0, 0, canvas.width *2, canvas.height * 2);
  updateMouseSelectionBound();
  ctx.strokeStyle = 'red';
  ctx.beginPath();
  ctx.rect(mouseSelectionBound.l, mouseSelectionBound.t, mouseSelectionBound.w, mouseSelectionBound.h);
  ctx.stroke();
}

function updateMouseSelectionBound() {
  //  get data from actual pointer position
  mouseSelectionBound.w = mouseX-lastMouseX;
  mouseSelectionBound.h = mouseY - lastMouseY;
  mouseSelectionBound.l = lastMouseX + window.scrollX;
  mouseSelectionBound.t = lastMouseY + window.scrollY;

  // update data to make rect with height and width more than 0
  if (mouseSelectionBound.h < 0) {
    mouseSelectionBound.t = mouseSelectionBound.t + mouseSelectionBound.h;
    mouseSelectionBound.h = Math.abs(mouseSelectionBound.h)
  } else if (mouseSelectionBound.h === 0) {
    mouseSelectionBound.h = 1;
  }

  if (mouseSelectionBound.w < 0) {
    mouseSelectionBound.l = mouseSelectionBound.l + mouseSelectionBound.w;
    mouseSelectionBound.w = Math.abs(mouseSelectionBound.w)
  } else if (mouseSelectionBound.w === 0) {
    mouseSelectionBound.w = 1;
  }
}


function setupCanvas(canvas) {

  // Get the size of the canvas in CSS pixels.
  var rect = canvas.getBoundingClientRect();
  // Give the canvas pixel dimensions of their CSS
  // size * the device pixel ratio.
  console.log('rect: ', rect);
  canvas.width = rect.width;
  canvas.height = rect.height;

  canvasX = canvas.offsetLeft;
  canvasY = canvas.offsetTop;
  var ctx = canvas.getContext('2d');

  // todo why 0.5?
  ctx.scale(0.5, 0.5);
  return ctx;
}

var imageSource = null;

chrome.runtime.onMessage.addListener(message => {
  if (message.type === 'screenShot') {
    console.log('received screenShot');
    const canvasElement = document.createElement('canvas');
    canvasElement.id = 'sct';
    canvasElement.setAttribute('style',
      'position: fixed; width: 100%; height: 100%; z-index: 60000;');
    document.body.appendChild(canvasElement);

    canvas = document.getElementById("sct");

    ctx = setupCanvas(canvas);
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(100, 100);
    ctx.lineTo(200, 200);
    ctx.stroke();

    var image = new Image();
    image.onload = function () {
      console.log('drawing image');
      ctx.drawImage(image, 0, 0);
    };

    image.src = message.payload;

    imageSource = message.payload;

    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mousemove', drawMouseSelection);

    canvas.addEventListener('mousedown', e => {
      mouseDown = true;
      lastMouseX = e.clientX * 2 - canvasX;
      lastMouseY = e.clientY * 2 - canvasY;
      updateMouseSelectionBound()
    });
  }
})


function convertCanvasToImage(canvas) {
  var image = new Image();
  image.src = canvas.toDataURL("image/png");
  return image;
}
