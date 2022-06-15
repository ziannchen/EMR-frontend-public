import React from "react";
import ReactDOM from "react-dom";
import Outpatient from "./view/outpatient";
import TemplateDesign from "./view/templateDesign";
// import EmrEdit from "./view/emrEdit";
import "./styles/app.scss";
import "./utils/axios.js";
import "antd/dist/antd.css";
import { HashRouter, Route } from "react-router-dom";
// window.UEDITOR_HOME_URL = "./";
ReactDOM.render(
	<HashRouter>
		{console.log("route " + new Date().format("yyyy-MM-dd HH:mm:ss"))}
		<Route path="/outpatient/:mzghxh" component={Outpatient} />
		<Route path="/template-design" component={TemplateDesign} />
	</HashRouter>,
	// <EmrEdit />,
	document.getElementById("main")
);
