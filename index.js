// 引入electron并创建一个Browserwindow
const { default: axios } = require("axios");
const { app, BrowserWindow, Menu, dialog } = require("electron");
const path = require("path");
const url = require("url");
const { ipcMain } = require("electron");
var needToLogout = true;
var dfname = "";

axios.defaults.baseURL = "xxx";
// 保持window对象的全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let mainWindow;
Menu.setApplicationMenu(null); //取消菜单栏
function createWindow() {
	//创建浏览器窗口,宽高自定义具体大小你开心就好
	mainWindow = new BrowserWindow({
		width: 1400,
		height: 950,
		webPreferences: {
			// 是否启用Node integration
			nodeIntegration: true, // Electron 5.0.0 版本之后它将被默认false
			// 是否在独立 JavaScript 环境中运行 Electron API和指定的preload 脚本.默认为 true
			contextIsolation: false, // Electron 12 版本之后它将被默认true
		},
	});
	//
	//  加载应用----- electron-quick-start中默认的加载入口
	var param = process.argv;
	var mode = param[2];
	console.log(param);
	var hash = mode;
	if (mode == "outpatient") {
		ipcMain.on("needToLogout", (event, data) => {
			needToLogout = data;
			console.log(data);
		});
		ipcMain.on("dfname", (event, data) => {
			dfname = data;

			console.log(data);
		});
		hash += "/" + param[3] + "?" + param[4].replaceAll("+", "&");
	}
	console.log(hash);
	mainWindow.loadURL(
		url.format({
			pathname: path.join(__dirname, "./public/index.html"),
			protocol: "file:",
			slashes: true,
			hash: hash,
			// hash: "template-design",
		})
	);
	//
	// 加载应用----适用于 react 项目
	// mainWindow.loadURL("http://localhost:8080/outpatient/1");

	// 打开开发者工具，默认不打开
	mainWindow.webContents.openDevTools();

	mainWindow.on("close", (e) => {
		e.preventDefault();
		dialog
			.showMessageBox({
				type: "info",
				title: "电子病历编辑器",
				message: "是否确认关闭?",
				buttons: ["是", "否"],
			})
			.then(function (index) {
				if (index.response === 0) {
					if (mode == "outpatient" && needToLogout) {
						axios
							.get("/outpatient/logout", {
								params: {
									mzghxh: param[3],
									dfname: dfname,
								},
							})
							.then((res) => {
								// console.log(res);
								mainWindow = null;
								// app.quit();不要用quit()，会弹两次
								app.exit();
							})
							.catch((err) => {
								console.log(err);
							});
					} else {
						mainWindow = null;
						// app.exit();
					}
				} else {
					e.preventDefault(); //阻止默认行为
				}
			});
	});

	// 关闭window时触发下列事件.
	mainWindow.on("closed", function () {
		mainWindow = null;
	});
}
// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.on("ready", createWindow);
// 所有窗口关闭时退出应用.
app.on("window-all-closed", function () {
	// macOS中除非用户按下 `Cmd + Q` 显式退出,否则应用与菜单栏始终处于活动状态.
	if (process.platform !== "darwin") {
		app.quit();
	}
});
app.on("activate", function () {
	// macOS中点击Dock图标时没有已打开的其余应用窗口时,则通常在应用中重建一个窗口
	if (mainWindow === null) {
		createWindow();
	}
});
// 你可以在这个脚本中续写或者使用require引入独立的js文件.
