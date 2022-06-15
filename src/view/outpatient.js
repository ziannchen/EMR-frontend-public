import React, { Component } from "react";
import UeditorEdit from "../components/ueditor-edit";
import UeditorPreview from "../components/ueditor-preview";
import PatientDesc from "../components/outpatient/desc";
import { AppContainer } from "react-hot-loader";
import {
	Divider,
	Layout,
	Menu,
	Spin,
	Modal,
	Card,
	Empty,
	Row,
	Col,
	Affix,
	Button,
	Input,
} from "antd";
import axios from "axios";
import queryString from "query-string";
// import { getOutpatientAsync } from "../api/outpatient";
const { ipcRenderer } = window.require("electron");

const { Header, Content, Footer, Sider } = Layout;
const { Search } = Input;
const onSearch = (value) => console.log(value);
const items = [
	{
		label: "子菜单",
		key: "submenu",
		children: [{ label: "子菜单项", key: "submenu-item-1" }],
	},
];

const historyRecordItems = [
	{
		label: "历史门诊病历",
		key: "his-record-list",
		children: [],
	},
];
const templateItems = [
	{
		label: "门诊病历模板",
		key: "template-record-list",
		children: [],
	},
];

export default class Outpatient extends Component {
	constructor(props) {
		super(props);
		const params = this.props.match.params;
		//解构赋值
		const { jzksno, jzksname, dfno, dfname, cdno, nlno, nlname } =
			queryString.parse(this.props.location.search);
		console.log(jzksno, jzksname, dfno, dfname, cdno, nlno, nlname);

		this.state = {
			mzghxh: params.mzghxh,
			mzInfoExist: true,
			isLoading: true,
			patientInfo: null,
			historyRecords: null,
			availableTemplates: null,
			visible: false,
			previewHtml: null,
			previewRecordName: "",
			previewChangeLog: "",
			previewIsRecord: "",
			exist: false,
			hasDefault: false,
			recordInfo: {},
			readOnly: false,
			loginTime: "",
			jzksno: jzksno,
			jzksname: jzksname,
			dfno: dfno,
			dfname: dfname,
			cdno: cdno,
			nlno: nlno,
			nlname: nlname,
			historyRecordItems: historyRecordItems,
			templateItems: templateItems,
		};
	}
	componentDidMount() {
		this.getOutpatientData(this.state.mzghxh);
	}

	onSearch(value) {
		console.log(value);

		var templates = this.state.availableTemplates;
		var templateItems = [
			{
				label: "门诊病历模板",
				key: "template-record-list",
				children: [],
			},
		];

		templates.map((template, index) => {
			if (value == "" || template.templateName.indexOf(value) > -1) {
				templateItems[0].children.push({
					key: "t - " + template.templateName + index,
					label: template.templateName,
					html: template.template,
					name: template.templateName,
					recordtype: "NEW",
				});
			}
		});

		this.setState({
			templateItems: templateItems,
		});
	}
	onOpen() {}
	showModal(props) {
		if (this.state.exist) {
			this.UeditorPreview.setHtml(props.html);
		}
		// console.log(props);
		this.setState({
			visible: true,
			exist: true,
			previewHtml: props.html,
			previewRecordName: props.name,
			previewChangeLog: props.changelog,
			previewType: props.recordtype,
		});
	}

	handleOk = (e) => {
		var recordInfo = {
			type: this.state.previewType,
			record: this.state.previewHtml,
			name: this.state.previewRecordName,
		};
		if (recordInfo.type == "NEW") {
			recordInfo.changeLog = new Map();
		} else {
			recordInfo.changeLog = new Map(
				JSON.parse(this.state.previewChangeLog)
			);
		}
		this.setState({
			visible: false,
			recordInfo: recordInfo,
		});
	};

	handleCancel = (e) => {
		this.setState({
			visible: false,
		});
	};

	getOutpatientData(mzghxh) {
		console.log("send resp " + new Date().format("yyyy-MM-dd HH:mm:ss"));
		let that = this;
		axios
			.get("/outpatient/login", {
				params: {
					mzghxh: mzghxh,
					dfname: that.state.dfname,
					loginTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
				},
			})
			.then((res) => {
				console.log(
					"get resp " + new Date().format("yyyy-MM-dd HH:mm:ss")
				);
				console.log(res.data);
				var data = res.data;
				if (!data.exist) {
					console.log(data.exist);
					that.setState({ mzInfoExist: false, isLoading: false });
					return;
				}

				if (data.readOnly) {
					Modal.warning({
						title:
							"当前门诊已被 " +
							data.owner +
							" 于 " +
							data.lockTime +
							" 锁定，不可编辑。",
						okText: "确定",
					});
				}
				ipcRenderer.send("needToLogout", !data.readOnly); //异步\
				ipcRenderer.send("dfname", that.state.dfname); //异步
				var historyRecords = data.data.historyRecords;
				var availableTemplates = data.data.availableTemplates;
				var patientInfo = data.data.patientInfo;
				var hasDefault = false;
				var recordInfo = {
					changeLog: new Map(),
				};
				var historyRecordItems = that.state.historyRecordItems;
				var templateItems = that.state.templateItems;
				for (var item in patientInfo) {
					if (
						patientInfo[item] === "NULL" ||
						patientInfo[item] === "?" ||
						patientInfo[item] === "??" ||
						patientInfo[item] === "???"
					) {
						console.log(patientInfo[item]);
						patientInfo[item] = "暂无";
					}
				}

				historyRecords.forEach((element) => {
					if (element.mzghxh == patientInfo.mzghxh) {
						hasDefault = true;
						recordInfo = {
							record: element.record,
							type: "CURR",
							changeLog: new Map(JSON.parse(element.changeLog)),
							name: element.recordType,
						};
					}
				});

				historyRecords.map((record, index) =>
					historyRecordItems[0].children.push({
						key: "r - " + record.recordType + index,
						recordtype:
							record.mzghxh == patientInfo.mzghxh
								? "CURR"
								: "OLD",
						name: record.recordType,
						label: record.recordType + " - " + record.mzghxh,
						html: record.record,
						changelog: record.changeLog,
					})
				);

				console.log(historyRecordItems);

				availableTemplates.map((template, index) =>
					templateItems[0].children.push({
						key: "t - " + template.templateName + index,
						label: template.templateName,
						html: template.template,
						name: template.templateName,
						recordtype: "NEW",
					})
				);
				console.log(
					"form data " + new Date().format("yyyy-MM-dd HH:mm:ss")
				);
				that.setState({
					isLoading: false,
					patientInfo: patientInfo,
					historyRecords: historyRecords,
					availableTemplates: availableTemplates,
					hasDefault: hasDefault,
					recordInfo: recordInfo,
					readOnly: data.readOnly,
					historyRecordItems: historyRecordItems,
					templateItems: templateItems,
				});
			})
			.catch((err) => {
				console.log(err);
			});
	}

	saveRecord(cdno, recordType, record, recordNo) {}
	onClose() {
		console.log(this.state);
	}

	showPreview(item) {
		// console.log(item);
		this.showModal(item.item.props);
	}

	loadRecord(item) {
		var props = item.item.props;
		console.log(item);
		var recordInfo = {
			type: props.recordtype,
			record: props.html,
			name: props.name,
		};
		if (recordInfo.type == "NEW") {
			recordInfo.changeLog = new Map();
		} else {
			recordInfo.changeLog = new Map(JSON.parse(props.changelog));
		}
		this.setState({
			// visible: false,
			recordInfo: recordInfo,
		});
	}

	render() {
		console.log("render " + new Date().format("yyyy-MM-dd HH:mm:ss"));
		let patientDesc = <Spin />;
		let menu = <Spin />;
		let recordPreview = <Spin />;
		let emrEdit = <Spin />;
		let {
			isLoading,
			patientInfo,
			templateItems,
			hasDefault,
			recordInfo,
			mzInfoExist,
			mzghxh,
			readOnly,
		} = this.state;
		if (!mzInfoExist) {
			console.log(mzInfoExist);
			return (
				<Row justify="space-around" align="middle">
					<Col span={24}>
						<Empty
							description={
								"当前门诊信息不存在（门诊挂号序号：" +
								mzghxh +
								"), 请关闭。"
							}
						></Empty>
					</Col>
				</Row>
			);
		}

		if (!isLoading) {
			console.log(
				"render data " + new Date().format("yyyy-MM-dd HH:mm:ss")
			);
			patientDesc = (
				<PatientDesc
					patientInfo={patientInfo}
					nl={this.state.nlname}
					kb={this.state.jzksname}
				/>
			);

			menu = (
				<Menu
					items={items}
					mode="inline"
					onClick={this.loadRecord.bind(this)}
				/>
			);

			emrEdit = (
				<AppContainer>
					<div className="emr-edit">
						<UeditorEdit
							id="ueditor"
							patientInfo={patientInfo}
							recordInfo={recordInfo}
							hasDefault={hasDefault}
							readOnly={readOnly}
							dfname={this.state.dfname}
							dfno={this.state.dfno}
							nlname={this.state.nlname}
							nlno={this.state.nlno}
							jzksname={this.state.jzksname}
							jzksno={this.state.jzksno}
							ref={(node) => (this.UeditorEdit = node)}
						/>
					</div>
				</AppContainer>
			);
		}

		if (this.state.exist) {
			recordPreview = (
				<UeditorPreview
					id="ueditor-preview"
					innerHtml={this.state.previewHtml}
					ref={(node) => (this.UeditorPreview = node)}
				/>
			);
		}

		return (
			<Layout>
				<Sider
					className="outpatient-sider"
					style={{
						overflow: "auto",
						height: "100vh",
						position: "fixed",
						left: 0,
						top: 0,
						bottom: 0,
					}}
					width="300px"
					theme="light"
				>
					<Card title="患者基本信息：">{patientDesc}</Card>
					<Menu mode="inline" onClick={this.loadRecord.bind(this)}>
						<Menu.SubMenu
							key="submenu-history"
							title={this.state.historyRecordItems[0].label}
						>
							{this.state.historyRecordItems[0].children.map(
								(item) => {
									return (
										<Menu.Item
											key={item.key}
											name={item.name}
											html={item.html}
											changelog={item.changelog}
											recordtype={item.recordtype}
										>
											{item.label}
										</Menu.Item>
									);
								}
							)}
						</Menu.SubMenu>
					</Menu>
					<Search
						placeholder="   输入模板名"
						allowClear
						onSearch={this.onSearch.bind(this)}
						// style={{ width: 200 }}
					/>
					<Menu mode="inline" onClick={this.loadRecord.bind(this)}>
						<Menu.SubMenu
							key="submenu-template"
							title={this.state.templateItems[0].label}
						>
							{this.state.templateItems[0].children.map(
								(item) => {
									return (
										<Menu.Item
											key={item.key}
											name={item.name}
											html={item.html}
											recordtype={item.recordtype}
										>
											{item.label}
										</Menu.Item>
									);
								}
							)}
						</Menu.SubMenu>
					</Menu>
				</Sider>
				<Layout
					className="site-layout"
					style={{
						marginLeft: 300,
					}}
				>
					<Content>
						{emrEdit}
						<Modal
							className="preview-modal"
							title="历史病历预览"
							width={750}
							visible={this.state.visible}
							onOk={this.handleOk}
							onCancel={this.handleCancel}
						>
							{recordPreview}
						</Modal>
					</Content>
				</Layout>
			</Layout>
		);
	}
}
