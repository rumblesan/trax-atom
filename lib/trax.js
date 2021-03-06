'use babel';

import { CompositeDisposable } from 'atom';
import osc from 'osc-min';
import dgram from 'dgram';

import ConsoleView from './console';

export default {
  subscriptions: null,
  outSocket: null,
  console: null,

  config: {
    traxHost: {
      title: 'Trax host',
      type: 'string',
      default: 'localhost',
      description: 'The Trax host machine',
    },
    traxPort: {
      title: 'Trax port',
      type: 'integer',
      default: 7770,
      description: 'The port to send to Trax on',
    },
    consoleMaxHeight: {
      type: 'integer',
      default: 100,
      description: 'The console maximum height in pixels.',
    },
  },

  activate() {
    this.console = new ConsoleView();
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'trax:start': () => this.start(),
      })
    );
    this.subscriptions.add(
      atom.commands.add('atom-text-editor', {
        'trax:evaluate': () => this.evaluate(),
      })
    );
  },

  deactivate() {
    this.subscriptions.dispose();
    if (this.started) {
      this.outSocket.close();
      this.console.destroy();
    }
  },

  start() {
    const editor = atom.workspace.getActiveTextEditor();
    if (!editor) {
      this.console.logStderr('Could not get editor');
      // TODO handle this in some useful fashion?
      return;
    }
    this.started = true;
    this.console.initUI();

    this.console.logStdout('Starting Trax');

    this.outSocket = dgram.createSocket('udp4');
  },

  evaluate() {
    if (this.started) {
      const text = getProgramText();

      this.sendMessage(this.outSocket, text);
    } else {
      this.console.logStderr('Trax not started');
    }
  },

  sendMessage(outSocket, text) {
    const host = atom.config.get('trax.traxHost');
    const port = atom.config.get('trax.traxPort');
    console.log(host, port, '/run/code', `|${text}|`);
    const msg = osc.toBuffer({
      address: '/run/code',
      args: [text],
    });
    outSocket.send(msg, 0, msg.length, port, host, () => {
      this.console.logStdout('OSC sent to Trax server');
    });
  },
};

// Get the selected rows in any selection, otherwise get the line the cursor is on
function getProgramText() {
  let output = '';
  const editor = atom.workspace.getActiveTextEditor();
  if (!editor) {
    return output;
  }
  const range = editor.getSelectedBufferRange();
  if (range.isEmpty()) {
    const point = editor.getCursorBufferPosition();
    output = editor.lineTextForBufferRow(point.row);
  } else {
    output = editor.getSelectedText(range);
  }
  editor.setSelectedBufferRange([range.start, range.start]);
  return output;
}
