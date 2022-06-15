/**
 * Created by liulingli on 2017/7/10.
 * desc 电子病历编辑器
 */
import React, { Component } from "react";
import { Row, Col, Divider, Modal, Descriptions } from "antd";
import classNames from "classnames";
import Tab from "./common/tab";
import VestigeReservation from "./vestigeReservation";
import BoundCheck from "./boundCheck";
import axios from "axios";
import CreatXmlDoc from "../utils/createXML";
var builder = require("xmlbuilder");
export default class UeditorEdit extends Component {
	type = ["设计模式", "编辑模式", "只读模式", "审阅模式"];
	constructor(props) {
		super(props);
		this.state = {
			editor: undefined,
			index: 0,
			type: true, //纵向
			width: 700,
			changes: [],
			combinedChanges: new Map(),
			errors: [],
			unfilled: [],
			allwidgets: [],
			readOnly: this.props.readOnly,
			patientInfo: this.props.patientInfo,
			recordInfo: this.props.recordInfo,
			dfname: this.props.dfname,
			nlname: this.props.nlname,
			jzksname: this.props.jzksname,
		};
		console.log(this.props.recordInfo);
	}
	componentWillReceiveProps(nextProps, nextState) {
		let that = this;

		if (
			nextProps.recordInfo.record !== undefined &&
			nextProps.recordInfo.record !== "" &&
			nextProps.recordInfo !== nextState.recordInfo
		) {
			this.setState(
				{
					recordInfo: nextProps.recordInfo,
				},
				() => {
					console.log(nextProps.recordInfo);
					that.loadRecord();
				}
			);
		}
	}
	componentDidMount() {
		let that = this;

		let { id, hasDefault } = this.props;
		console.log(id);
		let editor = UE.getEditor(id, {
			initialFrameWidth: "100%",
			initialFrameHeight: "700",
			elementPathEnabled: false,
			//是否计数
			wordCount: false,
			//高度是否自动增长
			autoHeightEnabled: false,
			enterTag: "br",
		});
		console.log(this.state.readOnly);

		editor.addListener("focus", function (editor) {
			let beforeChanges = that.state.beforeChanges;
			let changes = that.state.changes;

			if (beforeChanges != changes) {
				// console.log(that.state.recordInfo.changeLog);
				that.combineChanges(that.state.recordInfo.changeLog, changes);
			}
		});
		setTimeout(() => {
			let html = command(editor);
			this.setState(
				{
					editor: editor,
					editHtml: html.editHtml,
					fixedHtml: html.fixedHtml,
					insertHtml: html.insertHtml,
					emreHtml: html.emreHtml,
					layoutHtml: html.layout,
				},
				() => {
					editor.ready(function () {
						if (that.state.readOnly) {
							that.readonlyPattern();
						} else {
							that.editPattern();
						}
					});
					// console.log(hasDefault);
					if (hasDefault) {
						that.loadRecord();
					}
				}
			);
		}, 200);
	}

	loadRecord() {
		let that = this;
		let editor = this.state.editor;
		let recordInfo = this.state.recordInfo;
		let patientInfo = this.state.patientInfo;

		editor.ready(function () {
			editor.setContent(recordInfo.record, false);

			if (!that.state.readOnly) {
				if (recordInfo.type == "NEW") {
					that.setValueById("xm", patientInfo.xm);
					that.setValueById(
						"xb",
						patientInfo.xb == "1" ? "男" : "女"
					);
					that.setValueById("nl", that.state.nlname);
					that.setValueById("jzks", that.state.jzksname);
				}

				that.setValueById(
					"jzsj",
					new Date().format("yyyy-MM-dd HH:mm:ss")
				);
				that.editPattern();
			}
			that.setState(
				{
					changes: [],
				},
				() => {
					setTimeout(() => {
						that.combineChanges(recordInfo.changeLog, []);
						that.initChangeWidget(editor);
						editor.focus();
					}, 200);
				}
			);
		});
	}

	initChangeWidget(editor) {
		let that = this;
		editor.ready(function () {
			var $body = this.body;
			// 获取id为oakplgin的对象
			var $children = $body.getElementsByClassName("oakplugin");
			// console.log($children);
			var widgets = [];
			var unfilled = [];
			var errors = [];
			for (var i = 0; i < $children.length; i++) {
				var unfill = true;
				var obj = eval("(" + $children[i].getAttribute("obj") + ")");
				var oakplugin = $children[i].getAttribute("oakplugin");
				var value;
				if (oakplugin == "input" || oakplugin == "select") {
					var target =
						$children[i].getElementsByClassName(
							"oak-field-value"
						)[0];
					value = target.innerText;
					if (value != "") {
						unfill = false;
					}
				} else if (oakplugin == "timeinput") {
					var target = $children[i].getElementsByTagName("input")[0];
					value = target.value;
					console.log(value);
					if (value != "") {
						unfill = false;
					}
				} else if (oakplugin == "checkbox" || oakplugin == "radio") {
					var inputs = $children[i].getElementsByTagName("input")[0];
					value = [];
					for (var j = 0; j < inputs.length; j++) {
						if (inputs[j].checked) {
							value.push(inputs[j].value);
						}
					}
					if (value.length != 0) {
						unfill = false;
					}
				} else if (oakplugin == "textarea") {
					var target =
						$children[i].getElementsByClassName(
							"oak-field-value"
						)[0];
					value = target.innerText;
					if (value != "" && value != "无") {
						unfill = false;
					}
				}
				widgets.push({
					type: oakplugin,
					value: value,
					data: obj,
					target: $children[i],
					finalValue: value,
				});
				errors.push({
					legal: true,
				});
				if (obj.required == "1" && unfill) {
					unfilled[i] = obj.orgname;
				} else {
					unfilled[i] = "已填写";
				}
			}

			that.setState(
				{
					allwidgets: widgets,
					unfilled: unfilled,
					errors: errors,
				},
				() => {
					that.initChangeListeners();
				}
			);
		});
	}

	initChangeListeners() {
		var allwidgets = this.state.allwidgets;
		//绑定事件
		for (var i = 0; i < allwidgets.length; i++) {
			var widget = allwidgets[i];
			var type = widget.type;
			var target = widget.target;
			var value = widget.value;
			var data = widget.data;
			switch (type) {
				case "input":
					this.inputChange(target, value, data, i);
					break;
				case "select":
					this.selectChange(target, value, data, i);
					break;
				case "timeinput":
					this.timeinputChange(target, value, data, i);
					break;
				case "checkbox":
					this.checkboxChange(target, value, data, i);
					break;
				case "radio":
					this.radioChange(target, value, data, i);
					break;
				case "textarea":
					this.textareaChange(target, value, data, i);
					break;
				default:
					break;
			}
		}
	}
	inputChange(target, value, data, key) {
		//input控件监听
		var that = this;
		var oldValue = value;
		/* 用定时器监听，节流，优化效率 */
		var timer = null;
		function diff(oldValue, newValue, data) {
			var orgname = data.orgname;
			var time = new Date().format("yyyy-MM-dd HH:mm:ss");
			var changes = that.state.changes;
			var errors = that.state.errors;
			var unfilled = that.state.unfilled;
			var widgets = that.state.allwidgets;
			widgets[key].finalValue = newValue;
			if (newValue != oldValue && newValue != "") {
				changes[key] = {
					date: time,
					author: that.state.dfname,
					type: orgname,
					desc: "修改为 " + newValue,
				};
			} else if (newValue != oldValue && newValue == "") {
				changes[key] = {
					date: time,
					author: that.state.dfname,
					type: orgname,
					desc: "删除了 " + oldValue,
				};
			} else {
				delete changes[key];
			}

			if (newValue == "") {
				unfilled[key] = orgname;
			} else {
				unfilled[key] = "已填写";
			}

			var number = parseFloat(newValue);
			if (
				data.textType == "数字" &&
				(isNaN(newValue) ||
					number < parseFloat(data.min) ||
					number > parseFloat(data.max))
			) {
				errors[key] = {
					name: orgname,
					value: newValue,
					range: data.min + " - " + data.max,
					legal: false,
				};
			} else {
				errors[key] = {
					legal: true,
				};
			}
			console.log(errors);
			that.setState({
				changes: changes,
				errors: errors,
				unfilled: unfilled,
				allwidgets: widgets,
			});
			// console.log(that.state.changes);
			that.state.editor.focus();
		}
		target.addEventListener("keyup", function (e) {
			var newValue = e.target.innerHTML;
			console.log("keyup");
			// console.log(e.target);
			clearTimeout(timer);
			timer = setTimeout(function () {
				diff(oldValue, newValue, data);
			}, 400);
		});
	}
	textareaChange(target, value, data, key) {
		//textarea控件监听
		var that = this;
		var oldValue = value;
		/* 用定时器监听，节流，优化效率 */
		var timer = null;
		function diff(oldValue, newValue, data) {
			var orgname = data.orgname;
			var time = new Date().format("yyyy-MM-dd HH:mm:ss");
			var changes = that.state.changes;
			var unfilled = that.state.unfilled;
			var widgets = that.state.allwidgets;
			widgets[key].finalValue = newValue;
			console.log(that.state.dfname);
			if (newValue != oldValue && newValue != "") {
				changes[key] = {
					date: time,
					author: that.state.dfname,
					type: orgname,
					desc: "修改为 " + newValue,
				};
			} else if (newValue != oldValue && newValue == "") {
				changes[key] = {
					date: time,
					author: that.state.dfname,
					type: orgname,
					desc: "删除了 " + oldValue,
				};
			} else {
				delete changes[key];
			}

			if (newValue == "") {
				unfilled[key] = orgname;
			} else {
				unfilled[key] = "已填写";
			}

			console.log(errors);
			that.setState({
				changes: changes,
				unfilled: unfilled,
				allwidgets: widgets,
			});
			// console.log(that.state.changes);
			that.state.editor.focus();
		}
		target.addEventListener("keyup", function (e) {
			var newValue = e.target.innerHTML;
			console.log("keyup");
			// console.log(e.target);
			clearTimeout(timer);
			timer = setTimeout(function () {
				diff(oldValue, newValue, data);
			}, 400);
		});
	}
	selectChange(target, value, data, key) {
		// select下拉控件监听
		var that = this;
		var oldValue = value;
		var orgname = data.orgname;
		var widgets = that.state.allwidgets;
		widgets[key].finalValue = newValue;
		target.addEventListener("click", function (e) {
			var className = e.target.className || "";
			var changes = that.state.changes;
			if (className.indexOf("li") > -1) {
				var newValue = e.target.innerText;
				if (oldValue != newValue) {
					//改变
					var time = new Date().format("yyyy-MM-dd HH:mm:ss");
					changes[key] = {
						date: time,
						author: that.state.dfname,
						type: orgname,
						desc: "修改为 " + newValue,
					};
				} else {
					delete changes[key];
				}

				that.setState({
					changes: changes,
					allwidgets: widgets,
				});
				// console.log(that.state.changes);
				that.state.editor.focus();
			}
		});
	}
	timeinputChange(target, value, data, key) {
		var that = this;
		var oldValue = value;
		var orgname = data.orgname;
		var input = target.getElementsByTagName("input")[1];
		var unfilled = that.state.unfilled;
		var _my97DP = $dp.focusArr[0];
		_my97DP.addEventListener("click", function (e) {
			var newValue = input.value;
			var changes = that.state.changes;
			var widgets = that.state.allwidgets;
			widgets[key].finalValue = newValue;
			if (newValue != oldValue) {
				var time = new Date().format("yyyy-MM-dd HH:mm:ss");
				changes[key] = {
					date: time,
					author: that.state.dfname,
					type: orgname,
					desc: "修改为 " + newValue,
				};
			} else {
				delete changes[key];
			}
			if (newValue == "") {
				unfilled[key] = orgname;
			} else {
				unfilled[key] = "已填写";
			}
			that.setState({
				changes: changes,
				unfilled: unfilled,
				allwidgets: widgets,
			});
			// console.log(that.state.changes);
			that.state.editor.focus();
		});
	}
	checkboxChange(target, value, data, key) {
		var that = this;
		var oldValue = value;
		var orgname = data.orgname;
		target.addEventListener("click", function (e) {
			var changes = that.state.changes;
			var widgets = that.state.allwidgets;
			widgets[key].finalValue = newValue;
			if (e.target.tagName == "INPUT") {
				//查找所有input[type='checkbox'的元素]
				var newValue = [];
				var input = target.getElementsByTagName("input");
				for (var i = 0; i < input.length; i++) {
					if (input[i].checked) {
						newValue.push(input[i].value);
					}
				}
				if (newValue != oldValue) {
					var time = new Date().format("yyyy-MM-dd HH:mm:ss");
					changes[key] = {
						date: time,
						author: that.state.dfname,
						type: orgname,
						desc: "修改为 " + newValue,
					};
				} else {
					delete changes[key];
				}
				that.setState({
					changes: changes,
					allwidgets: widgets,
				});
				// console.log(that.state.changes);
				that.state.editor.focus();
			}
			//this.showChange();
		});
	}
	radioChange(target, value, data, key) {
		var that = this;
		var oldValue = value;
		var orgname = data.orgname;
		target.addEventListener("click", function (e) {
			var changes = that.state.changes;

			if (e.target.tagName == "INPUT") {
				//查找所有input[type='checkbox'的元素]
				var newValue = [];
				var input = target.getElementsByTagName("input");
				for (var i = 0; i < input.length; i++) {
					if (input[i].checked) {
						newValue.push(input[i].value);
					}
				}
				var widgets = that.state.allwidgets;
				widgets[key].finalValue = newValue;
				if (newValue != oldValue) {
					var time = new Date().format("yyyy-MM-dd HH:mm:ss");
					changes[key] = {
						date: time,
						author: that.state.dfname,
						type: orgname,
						desc: "修改为 " + newValue,
					};
				} else {
					delete changes[key];
				}
				that.setState({
					changes: changes,
					allwidgets: widgets,
				});
				// console.log(that.state.changes);
				that.state.editor.focus();
			}
			//this.showChange();
		});
	}

	deepCopyMap(map) {
		// console.log(map);
		return new Map(JSON.parse(JSON.stringify([...map])));
	}
	combineChanges(historyChanges, currentChange) {
		let combinedChanges = this.deepCopyMap(historyChanges);
		for (let i = 0; i < currentChange.length; i++) {
			if (currentChange[i]) {
				if (!combinedChanges.has(currentChange[i].type)) {
					combinedChanges.set(currentChange[i].type, [
						currentChange[i],
					]);
				} else {
					combinedChanges
						.get(currentChange[i].type)
						.push(currentChange[i]);
				}
			}
		}
		this.setState({
			combinedChanges: combinedChanges,
		});
	}
	submitError(actualUnfilled, errors) {
		var list = "";
		for (let index = 0; index < actualUnfilled.length; index++) {
			const element = actualUnfilled[index];
			list += element;
			list += "  ";
		}
		Modal.error({
			title: "部分内容未填写或不合法，禁止提交！",
			okText: "返回",
			content: (
				<div>
					<p>未填写的内容：</p>
					<p>{list}</p>
					<p>不合法的内容：</p>
					{errors.map((v, i) => {
						return (
							<li key={i} className="errorlist">
								<p>控件名：{v.name}</p>
								<p>正确范围：{v.range}</p>
							</li>
						);
					})}
				</div>
			),
		});
	}

	submitSuccess() {
		let that = this;
		var html = this.state.editor.getContent();
		var changeLog = JSON.stringify([...this.state.combinedChanges]);
		var recordInfo = this.state.recordInfo;
		recordInfo.changeLog = this.deepCopyMap(this.state.combinedChanges);
		this.setState({ recordInfo: recordInfo, changes: [] });
		console.log(this.state.recordInfo.type);

		var xml = this.createXML(this.state.allwidgets);
		console.log(xml);
		if (this.state.recordInfo.type == "CURR") {
			axios
				.post("/medical-record/update", {
					mzghxh: that.state.patientInfo.mzghxh,
					record: html,
					recordXml: xml,
					updateBy: that.state.dfno,
					updateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
					changeLog: changeLog,
				})
				.then(function (response) {
					console.log(response);
				});
		} else {
			axios
				.post("/medical-record/insert", {
					mzghxh: that.state.patientInfo.mzghxh,
					patientCdno: that.state.patientInfo.cdno,
					recordType: that.state.recordInfo.name,
					record: html,
					recordXml: xml,
					xm: that.state.patientInfo.xm,
					xb: that.state.patientInfo.xb,
					cssj: that.state.patientInfo.cssj,
					jzks: that.state.jzksno,
					tel: that.state.patientInfo.tel,
					updateBy: that.state.dfno,
					updateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
					changeLog: changeLog,
				})
				.then(function (response) {
					console.log(response);
				});
		}
		Modal.success({
			content: "保存成功",
		});
	}

	createXML(allwidgets) {
		var recordDataObj = {
			tagName: "RecordData",
			children: allwidgets.map((widget) => {
				return {
					tagName: "field",
					children: [
						{
							tagName: "ID",
							children: [widget.data.orgID],
						},
						{
							tagName: "name",
							children: [widget.data.orgname],
						},
						{
							tagName: "type",
							children: [widget.type],
						},
						{
							tagName: "value",
							children: [widget.finalValue],
						},
					],
				};
			}),
		};
		var doc = new CreatXmlDoc(recordDataObj);
		var recordDataSerial = new XMLSerializer().serializeToString(
			doc.render()
		);
		var reg = new RegExp(' xmlns="http://www.w3.org/1999/xhtml"', "g");
		recordDataSerial = recordDataSerial.replace(reg, "");
		var xml = '<?xml version="1.0" encoding="UTF-8"?>';
		xml += recordDataSerial;
		return xml;
	}
	/**
	 * @method 切换视图模式
	 * @param index
	 */
	onClick(index) {
		this.setState({
			index: index,
		});
		let type = this.type[index];
		switch (type) {
			case "设计模式":
				this.designPattern();
				break;
			case "编辑模式":
				this.editPattern();
				break;
			case "只读模式":
				this.readonlyPattern();
				break;
			case "审阅模式":
				this.reviewPattern();
				break;
		}
	}
	/**
	 * @method 设计模式
	 */
	designPattern() {
		let editor = this.state.editor;
		editor.body.setAttribute("pattern", "design");
		//editor.body.setAttribute('contenteditable','true');
		editor.setEnabled();
	}

	/**
	 * @method 编辑模式
	 */
	editPattern() {
		let editor = this.state.editor;
		editor.body.setAttribute("pattern", "edit");
		//editor.body.setAttribute('contenteditable','false');
		editor.setDisabled();
	}

	/**
	 * @method 只读模式
	 */
	readonlyPattern() {
		let editor = this.state.editor;
		editor.body.setAttribute("pattern", "readonly");
		console.log(1);
		// editor.body.setAttribute("contenteditable", "false");
		editor.setDisabled();
	}

	/**
	 * @method 审阅模式
	 */
	reviewPattern() {
		let editor = this.state.editor;
		editor.body.setAttribute("pattern", "review");
		//editor.body.setAttribute('contenteditable','false');
		//editor.setDisabled();
		editor.setEnabled();
	}
	save() {
		if (this.state.readOnly) {
			Modal.error({
				title: "当前为只读模式，禁止提交！",
				okText: "返回",
			});
			return;
		}
		var unfilled = this.state.unfilled;
		console.log(unfilled);
		var actualUnfilled = [];
		var errors = this.state.errors;
		var actualErrors = [];
		for (let index = 0; index < unfilled.length; index++) {
			const element = unfilled[index];
			if (element != "已填写") {
				actualUnfilled.push(element);
			}
		}
		console.log(errors);
		for (let index = 0; index < errors.length; index++) {
			const element = errors[index];
			console.log(element);
			if (!element.legal) {
				actualErrors.push(element);
			}
		}

		if (actualUnfilled.length === 0 && actualErrors.length === 0) {
			this.submitSuccess();
		} else {
			this.submitError(actualUnfilled, actualErrors);
		}
	}

	checkLegal() {}

	setValueById(id, value) {
		// 获取id为oakplgin的对象
		var t = this.state.editor.document.getElementById(id);
		if (t == undefined) {
			return;
		}
		var oakplugin = t.getAttribute("oakplugin");
		if (oakplugin == "input" || oakplugin == "select") {
			var target = t.getElementsByClassName("oak-field-value")[0];
			target.innerText = value;
		} else if (oakplugin == "timeinput") {
			var target = t.getElementsByTagName("input")[0];
			// console.log(target);
			target.setAttribute("value", value);
		}
	}

	print() {
		this.state.editor.execCommand("print");
	}

	getValueById() {
		var id = "ruyuandate";
		// 获取id为oakplgin的对象
		var t = this.state.editor.document.getElementById(id);
		var oakplugin = t.getAttribute("oakplugin");
		var value;
		if (oakplugin == "input" || oakplugin == "select") {
			var target = t.getElementsByClassName("oak-field-value")[0];
			value = target.innerText;
		} else if (oakplugin == "timeinput") {
			var target = t.getElementsByTagName("input")[0];
			console.log(target);
			target.setAttribute("value", "2017-04-27 16:31:33");
		} else if (oakplugin == "checkbox" || oakplugin == "radio") {
			var inputs = t.getElementsByTagName("input");
			value = [];
			for (var j = 0; j < inputs.length; j++) {
				if (inputs[j].checked) {
					value.push(inputs[j].value);
				}
			}
		}

		console.log(value);
	}
	/**
	 * 纸张方向
	 */
	layout(type) {
		this.setState({
			width: type ? 700 : 1000,
			type: type,
		});
		let editor = this.state.editor;
		let head = editor.window.document.getElementsByTagName("head")[0];
		let cssStyle = document.createElement("style");
		cssStyle.id = "layout";
		cssStyle.innerText = "@page { size: landscape; }";
		if (!type) {
			head.appendChild(cssStyle);
		} else {
			let cssStyle = editor.window.document.getElementById("layout");
			head.removeChild(cssStyle);
		}
	}
	render() {
		let { id } = this.props;
		let {
			changes,
			combinedChanges,
			type,
			width,
			editor,
			html,
			index,
			fixedHtml,
			editHtml,
			emreHtml,
			insertHtml,
			layoutHtml,
			errors,
			dfname,
			readOnly,
		} = this.state;
		let style = { height: "auto", width: width };
		return (
			<Row className="emr-edit-wrapper">
				<Col span={16}>
					<div className="ueditor-oak">
						<div className="ueditor-toobar-oak">
							<Tab
								tabs={[
									"页面布局",
									"文件",
									// "视图模式",
									// "编辑",
									// "插入",
									// "病历控件",
								]}
								fixed={
									<li className="tab-list-item theme">
										电子病历编辑界面
									</li>
								}
							>
								<div className="edui-default">
									<div
										className="edui-toolbar"
										dangerouslySetInnerHTML={{
											__html: layoutHtml,
										}}
									/>
									<div className="edui-toolbar">
										<div className="edui-box edui-button edui-for-orient">
											<div
												className={
													type
														? ""
														: "edui-state-hover"
												}
												onClick={this.layout.bind(
													this,
													false
												)}
											>
												<div className="edui-button-wrap">
													<div
														unselectable="on"
														title="横向"
														className="edui-button-body"
													>
														<div className="edui-box edui-icon" />
													</div>
												</div>
											</div>
										</div>
										<div className="edui-box edui-button edui-for-portrait">
											<div
												className={
													type
														? "edui-state-hover"
														: ""
												}
												onClick={this.layout.bind(
													this,
													true
												)}
											>
												<div className="edui-button-wrap">
													<div
														unselectable="on"
														title="纵向"
														className="edui-button-body"
													>
														<div className="edui-box edui-icon" />
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="edui-default">
									<div className="edui-toolbar">
										<div
											className="edui-button-oak"
											title="保存"
											onClick={this.save.bind(this)}
										>
											保存
										</div>
										<div
											className="edui-button-oak"
											title="打印"
											onClick={this.print.bind(this)}
										>
											打印
										</div>
									</div>
								</div>
								<div className="edui-default">
									<div
										className="edui-toolbar"
										dangerouslySetInnerHTML={{
											__html: editHtml,
										}}
									/>
								</div>
								<div className="edui-default">
									<div
										className="edui-toolbar"
										dangerouslySetInnerHTML={{
											__html: insertHtml,
										}}
									/>
								</div>

								<div className="edui-default">
									<div
										className="edui-toolbar"
										dangerouslySetInnerHTML={{
											__html: emreHtml,
										}}
									/>
								</div>
								<div className="edui-default">
									<div className="edui-toolbar">
										{this.type.map((v, i) => {
											return (
												<div
													key={i}
													className={classNames(
														"edui-button-oak",
														index === i
															? "active"
															: ""
													)}
													title={v}
													onClick={this.onClick.bind(
														this,
														i
													)}
												>
													{v}
												</div>
											);
										})}
									</div>
								</div>
							</Tab>
							<div className="fixed-toobar">
								<div className="edui-default">
									<div
										className="edui-toolbar"
										dangerouslySetInnerHTML={{
											__html: fixedHtml,
										}}
									/>
								</div>
							</div>
						</div>

						<div className="ueditor-content-oak">
							<div className="ueditor-content" style={style}>
								<script
									className="ueditor-script-oak"
									id={id}
									style={{ width: "100%" }}
									name="content"
									type="text/plain"
								/>
							</div>
						</div>
					</div>
				</Col>
				<Col span={8} className="extra-info-wrapper">
					<div className="extra-info">
						<Descriptions column={1} className="edit-info">
							<Descriptions.Item
								className="edit-info"
								label="当前操作员"
							>
								{dfname}
							</Descriptions.Item>
							<Descriptions.Item label="当前模式">
								{readOnly ? "只读模式" : "编辑模式"}
							</Descriptions.Item>
						</Descriptions>
						<Divider />
						<VestigeReservation
							combinedChanges={combinedChanges}
							currentChange={changes}
							parent={this}
							isShow={true}
						/>
						<Divider />
						<BoundCheck marks={errors} isShow={true} />
					</div>
				</Col>
			</Row>
		);
	}
}
