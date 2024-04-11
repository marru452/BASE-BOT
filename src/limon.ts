import makeWASocket, {
  ConnectionState,
  DisconnectReason,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys'
import P from 'pino'
import * as chalk from 'chalk'
import { exec } from 'child_process'

interface ConnectionUpdate{
  connection: 'open' | 'connecting' |'close';
  lastDisconnect?: {
    error?: {
      output?: {
        statusCode?: number;
      };
    };
  };
  qr?: string;
}

async function start(): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState('SessionMD');
  const limoncio = makeWASocket({
    logger: P({
      level: 'silent',
    }),
    auth: state,
    printQRInTerminal: true,
  });
  limoncio.ev.on('creds.update', saveCreds);

  limoncio.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (connection === 'close') {
      if (
        lastDisconnect &&
        lastDisconnect.error &&
        lastDisconnect.error
        &&
        lastDisconnect.date
      ) {
        start();
      } else {
        exec('rm -rf session', (err) => {
          if (err) {
            console.error(err);
          } else {
            console.error('connection closed');
            start();
          }
        });
      }
    } else if (connection === 'open') {
      //console.log(chalk.green('Bot conectado'));
      console.log('Bot conectado');
    }
  });

  limoncio.ev.on('messages.upsert', async({type, messages }) =>{
    if (type === 'notify') {
      if (!messages) return;
      Object.entries(messages).forEach(([_, m]) => {
        if(m.key.remoteJid === 'status@broadcast') return;
        export(limoncio, m)
        console.log(m)
      })
    }
  })
}

start();
