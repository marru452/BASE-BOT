"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const pino_1 = __importDefault(require("pino"));
const child_process_1 = require("child_process");
async function start() {
    const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)('SessionMD');
    const limoncio = (0, baileys_1.default)({
        logger: (0, pino_1.default)({
            level: 'silent',
        }),
        auth: state,
        printQRInTerminal: true,
    });
    limoncio.ev.on('creds.update', saveCreds);
    limoncio.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (connection === 'close') {
            if (lastDisconnect &&
                lastDisconnect.error &&
                lastDisconnect.error
                &&
                    lastDisconnect.date) {
                start();
            }
            else {
                (0, child_process_1.exec)('rm -rf session', (err) => {
                    if (err) {
                        console.error(err);
                    }
                    else {
                        console.error('connection closed');
                        start();
                    }
                });
            }
        }
        else if (connection === 'open') {
            //console.log(chalk.green('Bot conectado'));
            console.log('Bot conectado');
        }
    });
    limoncio.ev.on('messages.upsert', async ({ type, messages }) => {
        if (type === 'notify') {
            if (!messages)
                return;
            Object.entries(messages).forEach(([_, m]) => {
                console.log(m);
            });
        }
    });
}
start();
