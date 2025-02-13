const { app, BrowserWindow, Menu, protocol, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');

// 代理请求
// 作者：小气小憩
// 链接：https://juejin.cn/post/7311619723317657611
// 来源：稀土掘金
// 著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
const interceptRequestRemote = async (request, callback) => {
  const client = https.request(request.url, {
    method: request.method,
    headers: { ...request.headers },
  });
  if (request.uploadData) {
    for (const data of request.uploadData) {
      if (data.type === "rawData") client.write(data.bytes);
      else if (data.type === "blob") {
        // 通过blobUUID获取Buffer对象
        const buffer = await sess.getBlobData(data.blobUUID);
        client.write(buffer);
      }
    }
  }
  client.on("response", (response) => {
    let body = [];
    response.on("data", (chunk) => {
      body.push(chunk);
    });
    response.on("end", () => {
      body = Buffer.concat(body);
      callback({
        statusCode: response.statusCode,
        headers: response.headers,
        data: body,
      });
    });
  });
  client.end();
};

function createWindow () {
  mainWindow = new BrowserWindow({
    width: conf.width,
    height: conf.height,
    center: true,
    icon: path.join(currentPath, 'file', 'pic', 'favicon.ico'),
    webPreferences: {
      plugins: true,
      webSecurity: false,
      contextIsolation: false,
      preload: path.join(currentPath, 'file', 'utils', 'preload.js'),
      defaultFontFamily: {
        standard: conf.font,
        serif: conf.font,
        sansSerif: conf.font,
        cursive: conf.font,
        fantasy: conf.font,
        monospace: conf.font,
      },
    }
  });

  mainWindow.setMenu(null);

  mainWindow.webContents.setAudioMuted(conf.muted);
  mainWindow.webContents.on('did-navigate', () => {
    mainWindow.webContents.executeJavaScript(`
      document.body.style.overflow = 'hidden';
      document.body.style.zoom = ${conf.zoom};
    `);
  });

  // 阻止刷新确认框
  mainWindow.webContents.on('will-prevent-unload', event => event.preventDefault());

  mainWindow.loadURL(conf.urlDefault);
}

const currentPath = process.platform === 'darwin' ? path.resolve(__dirname, '..', '..') : process.cwd();
const { loadConfig, loadFiddlerRules } = require(path.join(currentPath, 'file', 'utils', 'config'));
const { cmdSetTitle, cmdExecJs } = require(path.join(currentPath, 'file', 'utils', 'constants'));

const swfPath = path.join(currentPath, 'file','swf');
const xmlPath = path.join(currentPath, 'file','xml');

let mainWindow = null;
let conf = null;
let fiddlerRules = null;

let flashPluginName;
switch (process.platform) {
  case 'win32':
    flashPluginName = 'pepflashplayer.dll';
    break;
  case 'darwin':
    flashPluginName = 'PepperFlashPlayer.plugin';
    break;
}
app.commandLine.appendSwitch('ppapi-flash-path', path.join(currentPath, 'file', 'flash', flashPluginName));

let loadSwf = name => new Promise((resolve, reject) => {
  fs.readFile(`${path.join(swfPath, name)}`, (err, data) => {
    if (err) {
      console.error("readFile error", err);
      reject(err);
      return;
    }
    const mimeType = "application/x-shockwave-flash";
    resolve({
      data,
      mimeType,
    });
  });
});

let loadXml = name => new Promise((resolve, reject) => {
  fs.readFile(`${path.join(xmlPath, name)}`, (err, data) => {
    if (err) {
      console.error("readFile error", err);
      reject(err);
      return;
    }
    const mimeType = "text/xml";
    resolve({
      data,
      mimeType,
    });
  });
});

let formMap = () => {
  let form = new BrowserWindow({
    width: 320,
    height: 240,
    icon: path.join(currentPath, 'file', 'pic', 'egg_sky.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  form.setMenu(null);
  form.loadFile(path.join(currentPath, 'file', 'pages', 'MapScroll.html'));
}
let formFightHandler = () => {
  let form = new BrowserWindow({
    width: 960,
    height: 860,
    x: conf.x,
    y: conf.y,
    icon: path.join(currentPath, 'file', 'pic', 'egg_orange.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  form.setMenu(null);
  form.loadFile(path.join(currentPath, 'file', 'pages', 'FightHandler.html'));
}
let formFiddler = () => {
  let form = new BrowserWindow({
    width: 960,
    height: 720,
    icon: path.join(currentPath, 'file', 'pic', 'egg_purple_orange.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  form.setMenu(null);
  form.loadFile(path.join(currentPath, 'file', 'pages', 'Fiddler.html'));
}

// 右键菜单
const menu = Menu.buildFromTemplate([
  {
    label: '刷新',
    click: () => mainWindow.reload()
  },
  {
    label: '配置',
    click: () => {
      let formConfig = new BrowserWindow({
        width: 600,
        height: 500,
        icon: path.join(currentPath, 'file', 'pic', 'egg_deep_blue.ico'),
        webPreferences: {
          contextIsolation: false,
          nodeIntegration: true, // 允许使用 Node.js API
        }
      });
      // 隐藏菜单
      formConfig.setMenu(null);
      formConfig.loadFile(path.join(currentPath, 'file', 'pages', 'Config.html'));
    }
  },
  {
    label: '地图',
    click: () => formMap()
  },
  {
    label: '开声音',
    click: () => mainWindow.webContents.setAudioMuted(false)
  },
  {
    label: 'FD',
    click: () => formFiddler()
  },
  {
    label: '对战助手',
    click: () => formFightHandler()
  },
  {
    label: '开发者工具',
    click: () => mainWindow.webContents.openDevTools()
  },
  {
    label: '关于本项目',
    click: () => (new BrowserWindow()).loadURL('https://github.com/wx11-00-1/LanBaiSeer')
  },
  {
    label: '退出',
    click: () => app.quit()
  }
]);

app.whenReady().then(() => {
  // 监听渲染进程发送的消息
  ipcMain.on(cmdSetTitle, (e, title) => mainWindow.setTitle(title));
  ipcMain.on(cmdExecJs, (e, js) => mainWindow.webContents.executeJavaScript(js));
  // 右键菜单
  ipcMain.on('menu', (e, x, y) => menu.popup({ x, y }));

  conf = loadConfig();
  fiddlerRules = loadFiddlerRules();
  
  createWindow();
  
  if (conf.isLoadFormMap) formMap();
  if (conf.isLoadFormFightHandler) formFightHandler();

  // 若开启 Fiddler 功能，无法通过游戏的登录验证
  // 所以默认是关闭的，用户登录后再手动开启
  // 如果要登录新的账号，仍要手动关闭
  if (conf.isFirstLogin) return;
  // 自定义文件协议，用于资源替换
  protocol.interceptBufferProtocol('https', (request, callback) => {
    const url = request.url;
    for (let rule of fiddlerRules) {
      if (url.match(rule.key)) {
        if (rule.type === 'file') {
          fs.readFile(rule.value, (err, data) => {
            if (err) {
              console.error("readFile error", err);
              interceptRequestRemote(request, callback);
              return;
            }
            callback({ data });
          });
        }
        else {
          request.url = rule.value;
          interceptRequestRemote(request, callback);
        }
        return;
      }
    }
    if (url.match('https:\\/\\/seer\\.61\\.com\\/resource\\/fightResource\\/pet\\/swf\\/(\\d{4,})\\.swf\\?')) {
      if (conf.isRandomSkin) {
        const randID = conf.skinIDs[Math.floor(Math.random() * conf.skinIDs.length)];
        mainWindow.webContents.executeJavaScript(`console.log(${randID},WxFightHandler.Utils.GetPetNameByID(${randID}))`)
        request.url = `https://seer.61.com/resource/fightResource/pet/swf/${randID}.swf`;
      }
      interceptRequestRemote(request, callback);
    }
    else if (url.startsWith('https://seer.61.com/dll/PetFightDLL.swf?')) {
      loadSwf('PetFightDLL.swf').then(res => callback(res)).catch(err => interceptRequestRemote(request, callback));
    }
    else if (url.startsWith('https://seer.61.com/resource/xml/battleStrategy.xml?')) {
      loadXml('battleStrategy.xml').then(res => callback(res)).catch(err => interceptRequestRemote(request, callback));
    }
    else if (url.startsWith('https://seer.61.com/resource/forApp/superMarket/tip.swf?')) {
      loadSwf('tip.swf').then(res => callback(res)).catch(err => interceptRequestRemote(request, callback));
    }
    else {
      interceptRequestRemote(request, callback);
    }
  });
});

app.on('window-all-closed', () => app.quit());
