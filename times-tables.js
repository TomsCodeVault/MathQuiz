// arrays to store numbers and keep track of which have not yet been answered
const tables = {
  table: [],
  times: []
};

const counts = {
  total: 0,
  completed: 0,
  errors: 0
}

const stats = {
  attempts: [],
  errors: []
}

var currentOp = 0;
var yesSound;
var noSound;

// example of converting stat position to equation
// let first = Math.floor((currentOp - 1) / 10) + 1;
// let second = currentOp % 10 === 0 ? 10 : currentOp % 10;

// flag to signify whether testing is in progress
var inProgress = false;

// range of numbers to be tested
var tableRange = {
  first: 1,
  last: 9
};

// temp storage of current equation's solution
var answer;

// ask questions randomly or in sequencial order
var serveRandom = -1;

var soundEffects = -1;

// fill tabel arrays based on specified range
function initTables() {
  tableRange.first = Number(document.getElementById("from").value);
  tableRange.last = Number(document.getElementById("to").value);
  if(tableRange.first > tableRange.last) tableRange.last = tableRange.first;
  let rows = (tableRange.last - tableRange.first) + 1;
  tables.table = [];
  tables.times = [];
  for(let i = 0; i < rows; i++ ) {
    tables.table.push(tableRange.first + i);
    tables.times.push([1,2,3,4,5,6,7,8,9,10]);
  }
  counts.total = rows * 10;
  counts.completed = 0;
  counts.errors = 0;
}

// display a question and remove it from table arrays
function serveNext() {
  const eq = document.querySelector(".equation");
  const questionElement = document.getElementById("question");
  eq.style.color = "black";
  let operands;
  if(!serveRandom){
    operands = [tables.table[0], tables.times[0][0]];
    tables.times[0].shift();
    if(tables.times[0].length === 0) {
      tables.times.shift();
      tables.table.shift();
    }
  } else {
    let currentTable = getRandomInt(tables.table.length);
    let currentTimes = getRandomInt(tables.times[currentTable].length);
    operands = [
      tables.table[currentTable],
      tables.times[currentTable][currentTimes]
    ]
    tables.times[currentTable].splice(currentTimes, 1);
    if(tables.times[currentTable].length === 0) {
      tables.times.splice(currentTable, 1);
      tables.table.splice(currentTable, 1);
    }
  }
  currentOp = ((operands[0] - 1) * 10) + (operands[1] - 1);
  questionElement.innerText = operands[0] + " x " + operands[1] + " = ";
  answer = operands[0] * operands[1];
}

// utility function for generating random integers
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// event procedure to run when start/submit button is clicked
function start() {
  const intro = document.querySelector(".intro");
  const eq = document.querySelector(".equation");
  const nextButton = document.getElementById("next");
  const keyboard = document.querySelector(".keyboard");
  const hdr = document.querySelector(".header");
  if(!inProgress) {
    inProgress = true;
    serveRandom = document.getElementById("random").checked;
    soundEffects = document.getElementById("sound").checked;
    initTables();
    updateHeaderText();
    hdr.style.color = "#9d879d";
    serveNext();
    eq.classList.remove("hidden");
    intro.classList.add("hidden");
    nextButton.classList.add("hidden");
    keyboard.classList.remove("hidden");
  } else {
    testAnswer();
  }
}

// check to see if the provided answer is correct
// If so, go to the next question, if not, tell user to try again.
// If the answer is correct and there are no questions left, reset tables
// and display
function testAnswer() {
  const eq = document.getElementById("question");
  const fi = document.getElementById("inputContent");
  stats.attempts[currentOp] = stats.attempts[currentOp] + 1;
  localStorage.setItem("attempts", JSON.stringify(stats.attempts));
  if(fi.textContent != '\u00a0') {
    let answerValue = Number(fi.textContent);
    if(answerValue == answer) {
      if(soundEffects) yesSound.play();
      if(tables.table.length > 0) {
        eq.style.color = "green";
        counts.completed++;
        setTimeout(function(){
          fi.textContent = '\u00a0';
          eq.style.color = "#cd23d2";
          serveNext();
          updateHeaderText();
        }, 500);
      } else {
        counts.completed++;
        eq.style.color = "green";
        inProgress = false;
        setTimeout(reset, 500);
      }
    } else {
      if(soundEffects) noSound.play();
      counts.errors++;
      stats.errors[currentOp] = stats.errors[currentOp] + 1
      localStorage.setItem("errors", JSON.stringify(stats.errors));
      eq.style.color = "red";
      fi.textContent = '\u00a0';
      updateHeaderText();
    }
  }
}

function reset(){
  const eq = document.querySelector(".equation");
  const enteredAnswer = document.getElementById("inputContent");
  const nextButton = document.getElementById("next");
  const intro = document.querySelector(".intro");
  const keyboard = document.querySelector(".keyboard");
  const hdr = document.querySelector(".header");
  const question = document.getElementById("question");
  eq.style.color = "black";
  eq.classList.add("hidden");
  keyboard.classList.add("hidden");
  intro.classList.remove("hidden");
  nextButton.innerText = "Start";
  nextButton.classList.remove("hidden");
  enteredAnswer.textContent = '\u00a0';
  question.style.color = "#cd23d2";
  hdr.style.color = "purple";
  if(inProgress) {
    hdr.textContent = "Starting Over";
  } else if(!inProgress && counts.completed > 0) {
    hdr.textContent = counts.errors > 0 ? "Congratulations! Start again?" : "Perfect!!! Start again?";
  }
  inProgress = false;
}

function updateIntro() {
  const intro = document.querySelector(".intro");
  const order = serveRandom ? "randomly" : "sequentially";
  intro.textContent = "You're set to do tables " + tableRange.first + " thru " + tableRange.last + " " + order + ".";
}

function initSettings() {
  const fromSelect = document.getElementById("from");
  const toSelect = document.getElementById("to");
  const randomChk = document.getElementById("random");
  const soundChk = document.getElementById("sound");
  let to, from, random, sound;
  if(!localStorage.getItem('from')) {
    localStorage.setItem('from', tableRange.first);
    from = tableRange.start;
  } else {
    tableRange.first = from = JSON.parse(localStorage.getItem('from'));
  }
  if(!localStorage.getItem('to')) {
    localStorage.setItem('to', tableRange.last);
    to = tableRange.last;
  } else {
    tableRange.last = to = JSON.parse(localStorage.getItem('to'));
  }
  if(!localStorage.getItem('random')) {
    localStorage.setItem('random', true);
    random = serveRandom;
  } else {
    serveRandom = random = JSON.parse(localStorage.getItem('random'));
  }
  if(!localStorage.getItem('sound')) {
    localStorage.setItem('sound', true);
    sound = soundEffects;
  } else {
    soundEffects = sound = JSON.parse(localStorage.getItem('sound'));
  }
  fromSelect.selectedIndex = from - 1;
  toSelect.selectedIndex = to - 1;
  randomChk.checked = serveRandom;
  soundChk.checked = soundEffects;
  updateIntro();
}

function addEventHandlers() {
  const fromSelect = document.getElementById("from");
  const toSelect = document.getElementById("to");
  const randomChk = document.getElementById("random");
  const soundChk = document.getElementById("sound");
  const settingsModal = document.getElementById("settingsModal");
  const keyboard = document.querySelector(".keyboard");
  const startBtn = document.getElementById("next");
  const back = document.getElementById("back");
  const stats = document.getElementById("stats");

    // add an event listener to the start button
  startBtn.addEventListener('click', start);

  // add an event listener to the document to submit the answer when the enter key is pressed
  document.addEventListener("keydown", function(e){
    if(e.charCode === 13) {
      start();
    } else if(inProgress) {
      switch(e.which) {
        case 8:
          backspace();
          break;
        case 48 :
        case 96 :
          addNumber(0);
          break;
        case 49:
        case 97:
          addNumber(1);
          break;
        case 50:
        case 98:
          addNumber(2);
          break;
        case 51:
        case 99:
          addNumber(3);
          break;
        case 52:
        case 100:
          addNumber(4);
          break;
        case 53:
        case 101:
          addNumber(5);
          break;
        case 54:
        case 102:
          addNumber(6);
          break;
        case 55:
        case 103:
          addNumber(7);
          break;
        case 56:
        case 104:
          addNumber(8);
          break;
        case 57:
        case 105:
          addNumber(9);
          break;
        default:
          // do nothing
      }
    }
  });

  // add an event listener to the keyboard div
  keyboard.addEventListener('click', function(e) {
    if(!isNaN(Number(e.target.id))) {
      addNumber(e.target.id);
    } else if(e.target.id === "bksp") {
      backspace();
    } else if(e.target.id === "go") {
      testAnswer();
    }
  });

  // add event listeners to the cancel and update buttons in the settings div
  document.getElementById("settingsCancel").addEventListener('click', function(){
    fromSelect.selectedIndex = tableRange.first - 1;
    toSelect.selectedIndex = tableRange.last - 1;
    randomChk.checked = serveRandom;
    soundChk.checked = soundEffects;
    settingsModal.classList.add('hidden');
  });
  document.getElementById("settingsUpdate").addEventListener('click', function(){
    tableRange.first = fromSelect.value;
    localStorage.setItem("from", tableRange.first);
    tableRange.last = toSelect.value;
    localStorage.setItem("to", tableRange.last);
    serveRandom = randomChk.checked;
    localStorage.setItem("random", serveRandom);
    soundEffects = soundChk.checked;
    localStorage.setItem("sound", soundEffects);
    settingsModal.classList.add('hidden');
    counts.completed = 0;
    updateIntro();
    reset();
  });

  // add event listener to the settings button
  document.getElementById("settingsBtn").addEventListener('click', function(){
    settingsModal.classList.remove("hidden");
  });

  toSelect.addEventListener('change', function() {
    if(toSelect.value < fromSelect.value) {
      fromSelect.value = toSelect.value;
    }
  });

  fromSelect.addEventListener('change', function() {
    if(fromSelect.value > toSelect.value) {
      toSelect.value = fromSelect.value;
    }
  });

  back.addEventListener('click', function() {
    stats.classList.add("hidden");
  });

  document.getElementById("viewStatistics").addEventListener('click', function() {
    populateStatsTable();
    stats.classList.remove("hidden");
  });

  document.getElementById("clearStats").addEventListener('click', function() {
    document.getElementById("confirmation").classList.remove("hidden");
    document.getElementById("stats").classList.add("hidden");;
  });

  document.getElementById("clearNo").addEventListener('click', function() {
    document.getElementById("stats").classList.remove("hidden");
    document.getElementById("confirmation").classList.add("hidden");
  });

  document.getElementById("clearYes").addEventListener('click', function() {
    clearStats();
    populateStatsTable();
    document.getElementById("stats").classList.remove("hidden");
    document.getElementById("confirmation").classList.add("hidden");
  });

  document.getElementById("statistics").rows[0].addEventListener('click', function(e) {
    const ele = e.target.id.length > 0 ? Number(e.target.id) : "no";
    // make sure one of the span elements was clicked
    if(ele !== "no") {
      let asc = true;
      if(e.target.classList.contains("asc")) {
        asc = false;
      }
      // first clear all classes from all th elements
      const thElements = document.getElementById("statistics").getElementsByTagName("th");
      for(let i = 0; i < thElements.length; i++) {
        thElements[i].firstChild.className = '';
      }
      // now add the appropriate class to the clicked column header
      asc ? e.target.classList.add("asc") : e.target.classList.add("desc");
      populateStatsTable(ele, asc);
    }
  });
}

function updateHeaderText() {
  let txt = (counts.completed + 1) + " of " + counts.total + " - " + counts.errors + (counts.errors === 1 ? " error" : " errors");
  document.querySelector(".header").innerText = txt;
}

function addNumber(number) {
  const inputContent = document.getElementById("inputContent");
  if(inputContent.textContent.length < 2) {
    if(inputContent.textContent === '\u00a0') {
      inputContent.textContent = String(number);
    } else {
      inputContent.textContent = inputContent.textContent + number;
    }
  }
}

function backspace() {
  const inputContent = document.getElementById("inputContent");
  if(inputContent.textContent.length > 1) {
    inputContent.textContent = inputContent.textContent.slice(0, -1);
  } else if(inputContent.textContent.length === 1 && !(inputContent.textContent === '\u00a0')) {
    inputContent.textContent = '\u00a0';
  }
}

function getStats() {
  let attempts = localStorage.getItem("attempts");
  let errors = localStorage.getItem("errors");
  if(attempts) {
    stats.attempts = JSON.parse(attempts);
  } else {
    stats.attempts = new Array(90).fill(0);
    localStorage.setItem("attempts", JSON.stringify(stats.attempts));
    localStorage.setItem("statTimeStamp", Date.now());
  }
  if(errors) {
    stats.errors = JSON.parse(errors);
  } else {
    stats.errors = new Array(90).fill(0);
    localStorage.setItem("errors", JSON.stringify(stats.errors));
  }
}

function clearStats() {
  stats.attempts = new Array(90).fill(0);
  localStorage.setItem("attempts", JSON.stringify(stats.attempts));
  stats.errors = new Array(90).fill(0);
  localStorage.setItem("errors", JSON.stringify(stats.errors));
  localStorage.setItem("statTimeStamp", Date.now());
}

function populateStatsTable(ele, asc) {
  const statTable = document.getElementById("statistics");
  const statsArray = createStatsArray(ele, asc);
  const caption = document.getElementById("statistics").caption;
  let stamp = localStorage.getItem("statTimeStamp");
  if(!stamp) stamp = Date.now();
  caption.innerHTML = "Result Since: " + formatTimeStamp(stamp)
  statTable.tBodies[0].innerHTML = "";
  statsArray.forEach((item, i) => {
    let row = statTable.tBodies[0].insertRow(i);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    let cell4 = row.insertCell(3);
    cell1.innerHTML = item[1];
    cell2.innerHTML = item[2];
    cell3.innerHTML = item[3];
    cell4.innerHTML = item[5];
  });
  // add totals row
  let totals = statTable.tBodies[0].insertRow(-1);
  let totalAttempts = stats.attempts.reduce((a,b) => a + b, 0);
  let totalErrors = stats.errors.reduce((a,b) => a + b, 0);
  let totalPercentage = ((1 - (totalErrors/totalAttempts)) * 100).toFixed(2) + "%";
  let cell1 = totals.insertCell(0);
  let cell2 = totals.insertCell(1);
  let cell3 = totals.insertCell(2);
  let cell4 = totals.insertCell(3);
  cell1.innerHTML = "Totals:";
  cell2.innerHTML = totalAttempts;
  cell3.innerHTML = totalErrors;
  cell4.innerHTML = totalPercentage;
}

function createStatsArray(ele, asc) {
  const statsArray = [];
  stats.attempts.forEach((item, i) => {
    let row = [];
    let first = Math.floor(i / 10) + 1;
    let second = (i + 1) % 10 === 0 ? 10 : (i + 1) % 10;
    let equation = first + " x " + second;
    row[0] = i;
    row[1] = equation;
    row[2] = item;
    row[3] = stats.errors[i];
    if(item === 0) {
      row[4] = "N/A";
      row[5] = "N/A";
    } else {
      row[4] = (1 - (stats.errors[i] / item)).toFixed(4);
      row[5] = (row[4] * 100).toFixed(2) + "%";
    }
    statsArray.push(row);
  });
  if(ele !== null) sortStats(statsArray, ele, asc);
  return statsArray;
};

function sortStats(ary, ele, asc) {
  if(!(ary instanceof Array) || ary.length == 0) return [];
  let sortOrder = typeof asc === "boolean" ? asc : true;
  let sortElement = typeof ele ==="number" ? ele : 0;
  ary.sort(function(a,b) {
    if(sortElement === 4 || sortElement === 5) {
      if(a[sortElement] === "N/A" || b[sortElement] === "N/A") {
        return b[sortElement] === "N/A" ? -1 : 1;
      } else if(sortElement === 4){
        if(sortOrder) {
          return a[4] - b[4];
        } else {
          return b[4] - a[4];
        }
      } else {
        if(sortOrder) {
          return a[5] > b[5] ? 1 : -1;
        } else {
          return b[5] > a[5] ? 1 : -1;
        }
      }
    } else {
      if(sortOrder){
        return a[sortElement] > b[sortElement] ? 1 : -1;
      } else {
        return b[sortElement] > a[sortElement] ? 1 : -1;
      }
    }
  });
}

function formatTimeStamp(stamp) {
  let lastClear = new Date(Number(stamp));
  const year = lastClear.getFullYear();
  const month = ("0" + (lastClear.getMonth() + 1)).slice(-2);
  const day = ("0" + lastClear.getDate()).slice(-2);
  const hours =("0" + lastClear.getHours()).slice(-2);
  const minutes = ("0" + lastClear.getMinutes()).slice(-2);
  return year + "-" + month + "-" + day + " " + hours + ":" + minutes;
}

function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function(){
    this.sound.play();
  }
  this.stop = function(){
    this.sound.pause();
  }
}

function init() {
  getStats();
  initSettings();
  yesSound = new sound("sounds/yes.mp3");
  noSound = new sound("sounds/no.mp3");
  addEventHandlers();
}

window.onload = function() {
  // if ("serviceWorker" in navigator) {
  // navigator.serviceWorker.register("serviceworker.js").then(function (registration) {
  //   console.log("Service Worker registered with scope:", registration.scope);
  // }).catch(function (err) {
  //   console.log("Service Worker registration failed:", err);
  // });
  init();
}
