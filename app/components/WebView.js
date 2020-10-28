import React from 'react';
const { BrowserView, getCurrentWindow } = require('electron').remote;


export default function WebView() {
    React.useEffect(() => {
        const view = new BrowserView({
          webPreferences:{
            nodeIntegration: false,
            nativeWindowOpen: true
          }
        });
        const mainWindow = getCurrentWindow();
        const [width, height] = mainWindow.getSize()
        mainWindow.setBrowserView(view);
        view.setBounds({x:0, y:0, width, height});
        view.webContents.loadURL('http://www.naver.com')    
    },[])
    return (
        <div>
            
        </div>
    )
}
  