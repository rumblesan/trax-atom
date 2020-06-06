'use babel';
/* global document */

class ConsoleView {
  constructor() {
    this.consoleDisplay = null;
    this.log = null;
    this.serialize = this.serialize.bind(this);
    this.destroy = this.destroy.bind(this);
    this.logStdout = this.logStdout.bind(this);
    this.logStderr = this.logStderr.bind(this);
    this.logText = this.logText.bind(this);
  }

  initUI() {
    if (this.consoleDisplay) return;
    this.consoleDisplay = document.createElement('div');
    this.consoleDisplay.setAttribute('tabindex', -1);
    this.consoleDisplay.classList.add('trax', 'console', 'native-key-bindings');

    this.log = document.createElement('div');
    this.consoleDisplay.appendChild(this.log);

    atom.workspace.addBottomPanel({
      item: this.consoleDisplay,
    });

    //sets the console max height
    this.consoleDisplay.setAttribute(
      'style',
      'max-height:' + atom.config.get('trax.consoleMaxHeight') + 'px;'
    );
    // listen for consoleMaxHeight changes
    atom.config.onDidChange('trax.consoleMaxHeight', data => {
      this.consoleDisplay.setAttribute(
        'style',
        'max-height:' + data.newValue + 'px;'
      );
    });
  }

  serialize() {}

  destroy() {
    this.consoleDisplay.remove();
  }

  logStdout(text) {
    this.logText(text);
  }

  logStderr(text) {
    this.logText(text, true);
  }

  logText(text, error) {
    if (!text) return;
    var pre = document.createElement('pre');
    if (error) {
      pre.className = 'error';
    }

    if (atom.config.get('trax.onlyLogLastMessage')) {
      this.log.innerHTML = '';
    }
    pre.innerHTML = text;
    this.log.appendChild(pre);

    if (!error && atom.config.get('trax.onlyShowLogWhenErrors')) {
      this.consoleDisplay.classList.add('hidden');
    } else {
      this.consoleDisplay.classList.remove('hidden');
    }

    this.consoleDisplay.scrollTop = this.consoleDisplay.scrollHeight;
  }
}

export default ConsoleView;
