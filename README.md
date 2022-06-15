# 电子病历编辑器（基于ueditor）

## 项目所用到的技术
- node
- express
- webpack
- babel
- react
- react-router
- sass
- electron

## 使用 
- 安装依赖 
```
npm install

```
  

## 运行

修改index.js和src/utils/axios.js中的axios.defaults.baseURL为后端服务部署地址。

- 开发环境打包
```
npm run build
```

- 模板设计
```
npm run electron-start template-design
```
- 门诊编辑

```
npm run electron-start outpatient {mzghxh} jzksno=102+jzksname=内科+dfno=12+dfname=请求+cdno=123134123+nlno=3333+nlname=10天
```
- electron应用打包
```
npm run packager
``` 
具体看package.json。命令行参数格式不变，但部署时要修改下index.js中的命令行参数数组解析规则。在配置文件中判断开发、生产环境采用不同的配置，这个时间紧暂时没想到怎么做。打包时代码压缩也没设置好。
