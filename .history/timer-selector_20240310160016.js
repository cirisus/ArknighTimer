// Constants
var SECONDS_MS = 1000;
var MINUTES_MS = SECONDS_MS * 60;
var HOURS_MS = MINUTES_MS * 60;
var DAYS_MS = HOURS_MS * 24;

// Initialization errors are only in English unfortunately.
function setError(primary, secondary = null) {
  var errorElement = document.getElementById('error');
  errorElement.classList.remove('hidden');
  errorElement.innerText = primary;

  var formElement = document.getElementById('form');
  formElement.classList.add('hidden');

  if (secondary) {
    var secondaryErrorElement = document.createElement('div');
    secondaryErrorElement.classList = ['error-secondary'];
    secondaryErrorElement.innerText = secondary;
    errorElement.appendChild(secondaryErrorElement);
  }
}

// Localization
var TRANSLATIONS = {
  // English
  'en': {
    'timer-description': 'Timer expiring at',
    'timer-unstarted': 'Timer not started until',
    'timer-progress': 'This timer will expire in',
    'timer-finished': 'This timer has been expired since',
    'timer-type': 'Timer Type',
    'timer-type-generic': 'Generic',
    'timer-type-deletion': 'Deletion',
    'timer-type-ban': 'Ban',
    'duration': 'Duration',
    'duration-1d': '1 Day',
    'duration-1w': '1 Week',
    'duration-2w': '2 Weeks',
    'duration-1y': '1 Year',
    'duration-custom': 'Custom',
    'unit-minute': 'minutes',
    'unit-hour': 'hours',
    'unit-day': 'days',
    'unit-week': 'weeks',
    'unit-month': 'months',
    'unit-year': 'years',
    'start-time': 'Start Time',
    'start-time-now': 'Now',
    'start-time-later': 'Later',
    'messages': 'Messages',
    'message-start': 'Timer unstarted (optional)',
    'message-progress': 'Timer in-progress (optional)',
    'message-finished': 'Timer finished (optional)',
    'advanced-section': 'Advanced',
    'height': 'Height',
    'width': 'Width',
    'css-extra': 'Custom timer CSS (optional)',
    'template': 'Output template',
    'template-deletion': 'Beginning deletion confirmation at -10.\n\n%%iframe%%\n\nIf this article is over a year old, you are not the author, and you want to rewrite this article, PM a member of the [[[rewrite-guide|Rewrite Team]]]. Please request permission from the author and make sure you copy the page source to your sandbox. **Do not reply to this post unless you are staff.**',
    'template-ban': '%%iframe%%',
    'message-deletion-progress': 'This page will be eligible for deletion in',
    'message-deletion-finished': 'This page has been eligible for deletion since',
    'message-ban-progress': 'This user\'s ban will elapse in',
    'message-ban-finished': 'This user\'s ban has been expired since',
    'build-timer': 'Build timer',
    'info-help': 'help',
    'info-source': 'source',
    'error-missing': 'Please make a selection in each section first.',
    'error-invalid': 'Invalid internal state, please file a bug report.',
  },
  // Simplified Chinese
  'cn': {
    'timer-description': '此计时器将过期于：',
    'timer-unstarted': '此计时器将在此时间后开始：',
    'timer-progress': '此计时器将过期于：',
    'timer-finished': '此计时器已过期：',
    'timer-type': '计时器类型',
    'timer-type-generic': '通用',
    'timer-type-deletion': '删除',
    'timer-type-ban': '封禁',
    'duration': '运行时间',
    'duration-1d': '1日',
    'duration-1w': '1周',
    'duration-2w': '2周',
    'duration-1y': '1年',
    'duration-custom': '自定义',
    'unit-minute': '分钟',
    'unit-hour': '小时',
    'unit-day': '日',
    'unit-week': '周',
    'unit-month': '月',
    'unit-year': '年',
    'start-time': '开始时间',
    'start-time-now': '现在',
    'start-time-later': '稍后',
    'messages': '通知内容',
    'message-start': '此计时器未开始（可选）',
    'message-progress': '此计时器运行中（可选）',
    'message-finished': '此计时器已到期（可选）',
    'advanced-section': '高级设置',
    'height': '高度',
    'width': '宽度',
    'css-extra': '自定计时器样式（可选）',
    'template': '输出模板',
    'template-deletion': '由于条目的分数为-X分，现根据[https://arknights.wikidot.com/guide:licensing#toc15 删除流程]，宣告将删除此页：\n\n%%iframe%%\n\n**如果你不是作者又想要重写该条目，请在此帖回复申请。请先取得作者（或管理员，如果此文档搬运自聊天室的话）的同意，并将原文的源代码复制至沙盒里。除非你是工作人员，否则请勿就申请重写以外的范围回复此帖。**',
    'template-ban': '%%iframe%%',
    'message-deletion-progress': '此页面将在计时器到期后可供删除：',
    'message-deletion-finished': '此页面在下列时间前已可供删除：',
    'message-ban-progress': '此用户的封禁将到期于：',
    'message-ban-finished': '此用户的封禁已到期：',
    'build-timer': '生成计时器',
    'info-help': '帮助',
    'info-source': '来源',
    'error-missing': '请先在每个项中做选择。',
    'error-invalid': '内部状态无效，请提交错误报告。',
  },
};

function getMessage(language, messageKey) {
  // Special case:
  // The 'test' language just echoes the message key back out.
  if (language === 'test') {
    return messageKey;
  }

  // Get message based on language
  var messages = TRANSLATIONS[language];
  if (!messages) {
    setError('No translations for language: ' + language);
    return null;
  }

  var message = messages[messageKey];
  if (!message) {
    setError('No such message key: ' + messageKey);
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

// Timer creation
function buildUrl(language, startDate, durationMs, startMessage, progressMessage, finishedMessage, styling) {
  // Calculate target datetime
  var startDateMs = startDate.getTime();
  var targetDate = new Date(startDateMs + durationMs);

  // Finally, build URL
  var parameters = new URLSearchParams();
  parameters.append('lang', language);
  parameters.append('start', startDate.toISOString());
  parameters.append('time', targetDate.toISOString());

  if (progressMessage) {
    parameters.append('progress', startMessage);
  }
  if (progressMessage) {
    parameters.append('progress', progressMessage);
  }

  if (finishedMessage) {
    parameters.append('finished', finishedMessage);
  }

  if (styling) {
    parameters.append('style', styling);
  }

  return 'https://cirisus.github.io/ArknighTimer/timer.html?' + parameters;
}

function buildWikitext(template, url, height, width) {
  var iframe = [
    '[[iframe ', url, ' style="width: ', width, '; height: ', height, '; border: 0; text-align: center;"]]',
  ].join('');

  return template
    .replace('%%url%%', url)
    .replace('%%iframe%%', iframe);
}

function findCheckedItem(selector) {
  var elements = document.querySelectorAll(selector);
  for (var i = 0; i < elements.length; i++) {
    if (elements[i].checked) {
      return elements[i];
    }
  }

  alert(getMessage(language, 'error-missing'));
  throw new Error('Could not find a checked radio button item');
}

function getStartDate(language) {
  var element = findCheckedItem('#start input');
  switch (element.id) {
    case 'start-now':
      return new Date();
    case 'start-later':
      var dateElement = document.getElementById('start-later-date');
      var timeElement = document.getElementById('start-later-time');
      if (dateElement === null || timeElement === null) {
        alert(getMessage(language, 'error-missing'));
        throw new Error('Missing date or time element in getStartDate()');
      }

      return new Date(dateElement.value + ' ' + timeElement.value);
    default:
      alert(getMessage(language, 'error-invalid'));
      throw new Error('Invalid element ID in getStartDate()');
  }
}

function getDuration() {
  var element = findCheckedItem('#duration input');
  if (element.value !== 'custom') {
    return parseInt(element.value);
  }

  var valueElement = document.getElementById('duration-custom-value');
  var value = parseInt(valueElement.value);
  if (isNaN(value)) {
    alert(getMessage(language, 'error-missing'));
    throw new Error('No value in custom duration selector');
  }

  var unitElement = document.getElementById('duration-custom-unit');
  var unit = parseInt(unitElement.value);

  return value * unit;
}

function getTextData(language) {
  var unstartedElement = document.getElementById('message-unstarted');
  if (unstartedElement === null) {
    alert(getMessage(language, 'error-missing'));
    throw new Error('Missing unstarted element in getTextData()');
  }
  var progressElement = document.getElementById('message-progress');
  if (progressElement === null) {
    alert(getMessage(language, 'error-missing'));
    throw new Error('Missing progress element in getTextData()');
  }

  var finishedElement = document.getElementById('message-finished');
  if (finishedElement === null) {
    alert(getMessage(language, 'error-missing'));
    throw new Error('Missing finished element in getTextData()');
  }

  var heightElement = document.getElementById('height');
  if (heightElement === null) {
    alert(getMessage(language, 'error-missing'));
    throw new Error('Missing height element in getTextData()');
  }

  var widthElement = document.getElementById('width');
  if (widthElement === null) {
    alert(getMessage(language, 'error-missing'));
    throw new Error('Missing width element in getTextData()');
  }

  var customCssElement = document.getElementById('custom-css');
  if (customCssElement === null) {
    alert(getMessage(language, 'error-missing'));
    throw new Error('Missing custom CSS element in getTextData()');
  }

  var templateElement = document.getElementById('template');
  if (templateElement === null) {
    alert(getMessage(language, 'error-missing'));
    throw new Error('Missing template element in getTextData()');
  }

  return {
    startMessage: unstartElement.value,
    progressMessage: progressElement.value,
    finishedMessage: finishedElement.value,
    height: heightElement.value,
    width: widthElement.value,
    styling: customCssElement.value,
    template: templateElement.value,
  };
}

function buildTimer(language) {
  // Unhide output
  var outputElement = document.getElementById('output');
  outputElement.classList.remove('hidden');

  // Gather values
  var startDate = getStartDate(language);
  var durationMs = getDuration(language);
  var data = getTextData(language);

  // Build wikitext and output
  var url = buildUrl(
    language,
    startDate,
    durationMs,
    data.startMessage,
    data.progressMessage,
    data.finishedMessage,
    data.styling,
  );

  outputElement.value = buildWikitext(data.template, url, data.height, data.width);
}

// Initialization
function initializeMessages(language) {
  function setMessage(id, messageKey = null) {
    document.getElementById(id).innerText = getMessage(language, messageKey || id);
  }

  setMessage('timer-type-label', 'timer-type');
  setMessage('timer-type-generic-label', 'timer-type-generic');
  setMessage('timer-type-deletion-label', 'timer-type-deletion');
  setMessage('timer-type-ban-label', 'timer-type-ban');

  setMessage('start-label', 'start-time');
  setMessage('start-now-label', 'start-time-now');
  setMessage('start-later-label', 'start-time-later');

  setMessage('duration-label', 'duration');
  setMessage('duration-1d-label', 'duration-1d');
  setMessage('duration-1w-label', 'duration-1w');
  setMessage('duration-2w-label', 'duration-2w');
  setMessage('duration-1y-label', 'duration-1y');
  setMessage('duration-custom-label', 'duration-custom');

  setMessage('unit-minute');
  setMessage('unit-hour');
  setMessage('unit-day');
  setMessage('unit-week');
  setMessage('unit-month');
  setMessage('unit-year');

  setMessage('messages-label', 'messages');
  document.getElementById('message-unstarted').placeholder = getMessage(language, 'timer-unstarted');
  document.getElementById('message-progress').placeholder = getMessage(language, 'timer-progress');
  document.getElementById('message-finished').placeholder = getMessage(language, 'timer-finished');
  setMessage('message-unstarted-label', 'message-start');
  setMessage('message-progress-label', 'message-progress');
  setMessage('message-finished-label', 'message-finished');

  setMessage('advanced-label', 'advanced-section');
  setMessage('height-label', 'height');
  setMessage('width-label', 'width');
  setMessage('custom-css-label', 'css-extra');
  setMessage('template-label', 'template');
  document.getElementById('custom-css').placeholder = '#title {\n  color: #008080;\n}';

  setMessage('build', 'build-timer');
  setMessage('info-help');
  setMessage('info-source');
}

function initializeHooks(language) {
  document.getElementById('timer-type-generic').onclick = function () {
    document.getElementById('message-progress').value = '';
    document.getElementById('message-finished').value = '';
    document.getElementById('template').value = '%%iframe%%';
  };

  document.getElementById('timer-type-deletion').onclick = function () {
    document.getElementById('duration-1d').click();
    document.getElementById('message-progress').value = getMessage(language, 'message-deletion-progress');
    document.getElementById('message-finished').value = getMessage(language, 'message-deletion-finished');
    document.getElementById('template').value = getMessage(language, 'template-deletion');
  };

  document.getElementById('timer-type-ban').onclick = function () {
    document.getElementById('message-progress').value = getMessage(language, 'message-ban-progress');
    document.getElementById('message-finished').value = getMessage(language, 'message-ban-finished');
    document.getElementById('template').value = getMessage(language, 'template-ban');
  };

  function onClickStartDate() {
    document.getElementById('start-later').click();
  }

  document.getElementById('start-later-date').onclick = onClickStartDate;
  document.getElementById('start-later-time').onclick = onClickStartDate;

  function onClickCustom() {
    document.getElementById('duration-custom').click();
  }

  document.getElementById('duration-custom-value').onclick = onClickCustom;
  document.getElementById('duration-custom-unit').onclick = onClickCustom;

  document.getElementById('build').onclick = function () {
    buildTimer(language);
  };
}

function setup() {
  // Get parameters
  var url = new URL(window.location.href);
  var parameters = new URLSearchParams(url.search);
  var language = parameters.get('lang');
  var styling = parameters.get('style');

  // Check parameters
  if (!language) {
    setError('未指定语言', '对应的语言参数是"lang"。通过"cn"来指定简体中文。');
    return;
  }

  // Insert custom CSS, if any
  if (styling !== null) {
    insertCSS(styling);
  }

  initializeMessages(language);
  initializeHooks(language);
}

setTimeout(setup, 5);
