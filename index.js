const { app, BrowserWindow } = require('electron')
const fs = require('fs')
const path = require('path')
const axios = require('axios');
const { dirname } = require('path');
let win = undefined;
let myWindow = null;
let folder = app.getPath('exe');
console.log('folder ' + folder);
const index = folder.indexOf("node_modules");
const isDevelopment = index !== -1;
if (isDevelopment) {
    folder = folder.substring(0, index-1);
} else {
    let idx = folder.indexOf('homeassistdesktopapp.exe');
    folder = folder.substring(0, idx-1);
}

const filePath = folder + '/data.json';

const gotTheLock = app.requestSingleInstanceLock()

function readData(callback) {
    console.log(filePath)
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        data = JSON.parse(data)
        callback(data);
        // handle the json data here
        console.log(data)
    });
}

let arg = undefined;
process.argv.forEach(a => console.log("arg: " + a))
if (process.argv.length > 1) {
    arg = process.argv[process.argv.length -1];
}
if (arg === '.')
    arg = undefined;
console.log('arg select: ' + arg)

if (!gotTheLock) {
    console.log('ALREADY RUNNING');
    
    readData(data => {
        data.forEach(element => {
            if (element.path === arg || !arg) {
                console.log('now calling: ' + 'http://localhost:3000/' + element.path);
                axios.get('http://localhost:3000/' + element.path);
            }
            if (!arg) return;
        }); 
        setTimeout(() => {
            app.quit()
        }, 1000);
    });
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (myWindow) {
        if (myWindow.isMinimized()) myWindow.restore()
        myWindow.focus()
        }
    })

    // Create myWindow, load the rest of the app, etc...
    app.whenReady().then(() => {
        myWindow = createWindow()
    })
    const createWindow = () => {
        win = new BrowserWindow({
            width: 1800,
            height: 1100,
            backgroundColor: '#002b36',
            autoHideMenuBar: true,
        });
        win.setMenu(null);
        
    readData(data => {
        if (!arg)
            win.loadURL(data[0].url);
        data.forEach(element => {
            if (element.path === arg) {
                win.loadURL(element.url);
            }
            appExpress.get('/' + element.path, (request, response) => {
                win.loadURL(element.url);
                response.status(200).json("element.path");
            });
        }); 
    });
    }


    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit();
    });

    // express und http Module importieren. Sie sind dazu da, die HTML-Dateien
    // aus dem Ordner "public" zu veröffentlichen.
    var express = require('express');
    var appExpress = express();
    var server = require('http').createServer(appExpress);
    var port = 3000;


    // Mit diesem Kommando starten wir den Webserver.
    server.listen(port, function () {
    // Wir geben einen Hinweis aus, dass der Webserer läuft.
    console.log('Webserver laeuft und hoert auf Port %d', port);
    });
    
}