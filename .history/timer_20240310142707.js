// Constants
var SECONDS_MS = 1000;
var MINUTES_MS = SECONDS_MS * 60;
var HOURS_MS = MINUTES_MS * 60;
var DAYS_MS = HOURS_MS * 24;

var SECONDS_ENUM = 0;
var MINUTES_ENUM = 1;
var HOURS_ENUM = 2;
var DAYS_ENUM = 3;
var MONTHS_ENUM = 4;
var YEARS_ENUM = 5;

// Initialization errors are only in English unfortunately.
function setError(primary, secondary = null) {
  var titleElement = document.getElementById('title');
  titleElement.classList.add('error');
  titleElement.innerText = primary;

  var clockElement = document.getElementById('clock');
  clockElement.classList.add('hidden');

  if (secondary) {
    var messageElement = document.createElement('div');
    messageElement.classList.add('error-secondary');
    messageElement.innerText = secondary;
    titleElement.appendChild(messageElement);
  }
}

// Localization
function getMessage(language, messageKey) {
  var translations = {
    // English
    'en': {
      'timer-description': 'Timer expiring at',
      'timer-progress': 'This timer will expire in',
      'timer-finished': 'This timer has been expired since',
      'years': 'years',
      'months': 'months',
      'days': 'days',
      'hours': 'hours',
      'minutes': 'minutes',
      'seconds': 'seconds',
    },

    // French
    'fr': {
      'timer-description': 'Fin du compte à rebours à',
      'timer-progress': 'Ce compte à rebours se terminera dans',
      'timer-finished': 'Ce compte à rebous est terminé depuis',
      'years': 'ans',
      'months': 'mois',
      'days': 'jours',
      'hours': 'heures',
      'minutes': 'minutes',
      'seconds': 'secondes',
    },
    
    // Pig Latin
    'pig': {
      'timer-description': 'Imertay expiringyay atyay',
      'timer-progress': 'Isthay imertay illway expireyay inyay',
      'timer-finished': 'Isthay imertay ashay eenbay expiredyay incesay',
      'years': 'earsyay',
      'months': 'onthsmay',
      'days': 'aysday',
      'hours': 'ourshay',
      'minutes': 'inutesmay',
      'seconds': 'econdssay',
    },

    // Spanish
    'es': {
      'timer-description': 'El temporizador finaliza en',
      'timer-progress': 'El temporizador finalizará en',
      'timer-finished': 'El temporizador ha finalizado desde hace',
      'years': 'años',
      'months': 'meses',
      'days': 'días',
      'hours': 'horas',
      'minutes': 'minutos',
      'seconds': 'segundos',
    },
    
    // Vietnamese
    'vi': {
      'timer-description': 'Đồng hồ kết thúc vào',
      'timer-progress': 'Đồng hồ sẽ kết thúc trong',
      'timer-finished': 'Đồng hồ này đã kết thúc kể từ',
      'years': 'năm',
      'months': 'tháng',
      'days': 'ngày',
      'hours': 'giờ',
      'minutes': 'phút',
      'seconds': 'giây',
    },
    
    // Simplified Chinese
    'cn': {
      'timer-description': '此计时器将过期于：',
      'timer-progress': '此计时器将过期于：',
      'timer-finished': '此计时器已过期：',
      'years': '年',
      'months': '月',
      'days': '日',
      'hours': '时',
      'minutes': '分',
      'seconds': '秒',
    },
  };

  // Special case:
  // The 'test' language just echoes the message key back out.
  if (language === 'test') {
    return messageKey;
  }

  // Get message based on language
  var messages = translations[language];
  if (!messages) {
    setError('暂无此语言的计时器 ' + language);
    return null;
  }

  var message = messages[messageKey];
  if (!message) {
    setError('无效的参数' + messageKey);
    return null;
  }

  return message;
}

function insertCSS(styling) {
  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');

  style.type = 'text/css';
  style.appendChild(document.createTextNode(styling));
  head.appendChild(style);
}

function getDaysInFebruary(startYear) {
  return (startYear % 4 === 0 && startYear % 100 !== 0)
    || startYear % 400 === 0 ? 29 : 28;
}

function elapsedData(targetTime) {
  var now = new Date();
  var elapsed = now - targetTime;

  if (elapsed >= 0) {
    // Date is in the past
    return {
      elapsed: elapsed,
      finished: true,
      startTime: targetTime,
      endTime: now,
    };
  } else {
    // Date is in the future
    return {
      elapsed: -elapsed,
      finished: false,
      startTime: now,
      endTime: targetTime,
    };
  }
}

// Based on https://stackoverflow.com/a/49201872
// Calculate differences greater than a day.
function dateDiff(startDate, endDate) {
  // Trim sub-day differences to avoid 0.8 days from rounding up.
  var diff = endDate - startDate;
  diff -= Math.floor(diff % DAYS_MS);
  endDate = new Date(startDate.getTime() + diff);

  // Get month data
  var february = getDaysInFebruary(startDate.getFullYear());
  var daysInMonth = [31, february, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  var yearDiff = endDate.getFullYear() - startDate.getFullYear();
  var monthDiff = endDate.getMonth() - startDate.getMonth();
  if (monthDiff < 0) {
    yearDiff--;
    monthDiff += 12;
  }

  var dayDiff = endDate.getDate() - startDate.getDate();
  if (dayDiff < 0) {
    if (monthDiff > 0) {
      monthDiff--;
    } else {
      yearDiff--;
      monthDiff = 11;
    }

    dayDiff += daysInMonth[startDate.getMonth()];
  }

  return {
    years: yearDiff,
    months: monthDiff,
    days: dayDiff,
  };
}

// Calculate difference in time, in all units
function calculateTimeDifference(targetTime, isElapsed) {
  var now = new Date();
  var startTime = isElapsed ? targetTime : now;
  var endTime = isElapsed ? now : targetTime;
  var elapsed = Math.abs(endTime - startTime);

  // Differences > 1 day
  var dateDiffs = dateDiff(startTime, endTime);
  var years = dateDiffs.years;
  var months = dateDiffs.months;
  var days = dateDiffs.days;

  // Differences < 1 day
  elapsed = Math.floor(elapsed % DAYS_MS);

  var hours = Math.floor(elapsed / HOURS_MS);
  elapsed = Math.floor(elapsed % HOURS_MS);

  var minutes = Math.floor(elapsed / MINUTES_MS);
  elapsed = Math.floor(elapsed % MINUTES_MS);

  var seconds = Math.floor(elapsed / SECONDS_MS);
  elapsed = Math.floor(elapsed % MINUTES_MS);

  // Get highest unit present
  var highest;
  if (years > 0) {
    highest = YEARS_ENUM;
  } else if (months > 0) {
    highest = MONTHS_ENUM;
  } else if (days > 0) {
    highest = DAYS_ENUM;
  } else if (hours > 0) {
    highest = HOURS_ENUM;
  } else if (minutes > 0) {
    highest = MINUTES_ENUM;
  } else {
    highest = SECONDS_ENUM;
  }

  return {
    years: years,
    months: months,
    days: days,
    hours: hours,
    minutes: minutes,
    seconds: seconds,
    finished: isElapsed,
    highest: highest,
  };
}
function setTimerField(language, field, value) {
  var visible = value !== null;

  if (visible) {
    document.getElementById(field).innerText = value;
  }

  setTimerFieldVisibility(field, visible);
}

function setTimerFieldVisibility(field, visible) {
  var element = document.getElementById(field + '-div');

  if (visible) {
    element.classList.remove('hidden');
  } else {
    element.classList.add('hidden');
  }
}
function createTimer(language, startTime, targetTime, progressMessage, finishedMessage) {
  progressMessage = progressMessage || getMessage(language, 'timer-progress');
  finishedMessage = finishedMessage || getMessage(language, 'timer-finished');

  // Update routine, to invoke every second
  var timerFields = [
    ['years', YEARS_ENUM, 1],
    ['months', MONTHS_ENUM, 1],
    ['days', DAYS_ENUM, 1],
    ['hours', HOURS_ENUM, 2],
    ['minutes', MINUTES_ENUM, 2],
    ['seconds', SECONDS_ENUM, 2],
  ];

  // Initial application of field labels
  for (var i = 0; i < timerFields.length; i++) {
    var field = timerFields[i][0];
    document.getElementById(field + '-label').innerText = getMessage(language, field);
  }
function updateProgressBar(startTimestamp, targetTime) {
    var now = new Date();
    var startTime = new Date(startTimestamp);
    var elapsed = (now - startTime) / 1000;

    // Calculate total time in seconds
    var totalTime = (targetTime - startTime) / 1000;

    // Calculate progress as a percentage
    var progress;
    if (now < startTime) {
        progress = 0;
    } else if (now >= targetTime) {
        progress = 100;
    } else {
        progress = 100 * elapsed / totalTime;
    }

    // Set progress line
    var progressLines = document.getElementsByClassName('progress-line');
    for (var i = 0; i < progressLines.length; i++) {
        progressLines[i].style.width = progress + '%';
    }
}
  function updateTimer() {
    var now = new Date();
    var remaining;
    var titleElement = document.getElementById('title');

    if (now < startTime) {
      // Before the start time, show the countdown to the start time
      remaining = calculateTimeDifference(startTime, false);
      titleElement.innerText = "距离开始还有";
      titleElement.classList = ['unstarted'];
      document.getElementById('clock').setAttribute('data-status', 'unstarted');
    } else if (now < targetTime) {
      // After the start time but before the end time, show the countdown to the end time
      remaining = calculateTimeDifference(targetTime, false);
      titleElement.innerText = progressMessage;
      titleElement.classList = ['progress'];
      document.getElementById('clock').setAttribute('data-status', 'running');
    } else {
      // After the end time, show the elapsed time since the end time
      remaining = calculateTimeDifference(targetTime, true);
      titleElement.innerText = finishedMessage;
      titleElement.classList = ['finished'];
      document.getElementById('clock').setAttribute('data-status', 'expired');
    }

    // Set individual timer fields
    for (var i = 0; i < timerFields.length; i++) {
      var field = timerFields[i][0];
      var fieldEnum = timerFields[i][1];
      var padWidth = timerFields[i][2];

      // If the value is to be shown, then display it.
      // Ensure digits are padded to the appropriate width.
      var value = remaining.highest >= fieldEnum
        ? String(remaining[field]).padStart(padWidth, '0')
        : null;

      setTimerField(language, field, value);
    }
  }
    // Determine update interval based on highest unit of time
    var initialRemaining = calculateTimeDifference(targetTime, false);
    var updateInterval = MINUTES_MS; // default to update every minute

    if (initialRemaining.highest === HOURS_ENUM || initialRemaining.highest === MINUTES_ENUM || initialRemaining.highest === SECONDS_ENUM) {
      updateInterval = SECONDS_MS; // update every second if the highest unit is minute or second
    }
  // Set title.
  // Since this is meant to be used as an iframe, setting it every tick is pointless.
  document.title = getMessage(language, 'timer-description') + ' ' + targetTime;

  // Configure timer to run regularly.
  updateTimer();
  updateProgressBar(startTime, targetTime);
  var updateTimerInterval = setInterval(updateTimer, 1000);
  var updateProgressBarInterval = setInterval(function() { updateProgressBar(startTime, targetTime); }, updateInterval);

  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      clearInterval(updateTimerInterval);
      clearInterval(updateProgressBarInterval);
    } else {
      updateTimerInterval = setInterval(updateTimer, 1000);
      updateProgressBarInterval = setInterval(function() { updateProgressBar(startTime, targetTime); }, updateInterval);
    }
  });
}

function setup() {
  // Get parameters
  var url = new URL(window.location.href);
  var parameters = new URLSearchParams(url.search);
  var language = parameters.get('lang');
  var startTimestamp = parameters.get('start');
  var timestamp = parameters.get('time');
  var progressMessage = parameters.get('progress');
  var finishedMessage = parameters.get('finished');
  var styling = parameters.get('style'); // allows custom CSS to be injected

  // Check parameters
  if (!language) {
    setError('未指定语言', '对应的参数为"lang"，使用"cn"来指定中文计时器。');
    return;
  }

  if (!startTimestamp) {
    setError('未设置开始时间','对应的参数是"start"，可以使用UNIX时间戳或ISO时间字符串。');
    return;
  }

  var startTime;
  if (/^\d+(\.\d+)?$/.exec(startTimestamp)) {
    startTime = new Date(parseFloat(startTimestamp) * 1000);
  } else {
    startTime = new Date(startTimestamp);
    if (isNaN(startTime)) {
      setError('无效开始时间戳', startTimestamp);
      return;
    }
  }

  if (!timestamp) {
    setError('未设置结束时间','对应的参数是"time"，可以使用UNIX时间戳或ISO时间字符串。');
    return;
  }

  var targetTime;
  if (/^\d+(\.\d+)?$/.exec(timestamp)) {
    targetTime = new Date(parseFloat(timestamp) * 1000);
  } else {
    targetTime = new Date(timestamp);
    if (isNaN(targetTime)) {
      setError('无效结束时间戳', timestamp);
      return;
    }
  }

  // Insert custom CSS, if any
  if (styling !== null) {
    insertCSS(styling);
  }

  // Initialize clock
  createTimer(language, startTime, targetTime, progressMessage, finishedMessage);
}

setTimeout(setup, 5);