/**
 * Created by liulingli on 2017/7/10.
 * desc 电子病历编辑器
 */
import React, { Component } from "react";
import classNames from "classnames";
import Tab from "./common/tab";
import { Button, Modal, Form, Input, Radio } from "antd";
import axios from "axios";
import moment from "moment";
import innerHtml from "./innerHtml";
const CollectionCreateForm = ({ visible, onCreate, onCancel }) => {
	const [form] = Form.useForm();
	return (
		<Modal
			visible={visible}
			title="模板信息填写"
			okText="创建模板"
			cancelText="取消"
			onCancel={onCancel}
			onOk={() => {
				form.validateFields()
					.then((values) => {
						form.resetFields();
						onCreate(values);
					})
					.catch((info) => {
						console.log("Validate Failed:", info);
					});
			}}
		>
			<Form form={form} layout="vertical" name="form_in_modal">
				<Form.Item
					name="templateName"
					label="模板名称"
					rules={[
						{
							required: true,
							message: "请输入模板名称",
						},
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					name="department"
					label="使用部门"
					rules={[
						{
							required: true,
							message: "请输入使用部门",
						},
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					name="usageType"
					className="collection-create-form_last-form-item"
					label="类别"
					rules={[
						{
							required: true,
							message: "请选择模板类别",
						},
					]}
				>
					<Radio.Group>
						<Radio value="个人">个人</Radio>
						<Radio value="科室">科室</Radio>
					</Radio.Group>
				</Form.Item>
				<Form.Item
					name="creater"
					label="制作者"
					rules={[
						{
							required: true,
							message: "请输入制作者",
						},
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					name="luruma"
					label="录入码"
					rules={[
						{
							required: true,
							message: "请输入录入码",
						},
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					name="status"
					className="collection-create-form_last-form-item"
					label="模板状态"
					rules={[
						{
							required: true,
							message: "请选择模板状态",
						},
					]}
				>
					<Radio.Group>
						<Radio value="正常">正常</Radio>
						<Radio value="暂停使用">暂停使用</Radio>
					</Radio.Group>
				</Form.Item>
				<Form.Item name="comment" label="说明">
					<Input.TextArea />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default class UeditorDesign extends Component {
	type = ["设计模式", "编辑模式", "只读模式", "审阅模式"];
	constructor(props) {
		super(props);
		this.state = {
			editor: undefined,
			index: 0,
			type: true, //纵向
			width: 700,
			actualChange: [],
			visible: false,
		};
	}
	componentWillMount() {}
	componentDidMount() {
		let that = this;
		let { id } = this.props;
		console.log(id);
		let editor = UE.getEditor(id, {
			initialFrameWidth: "100%",
			initialFrameHeight: "700",
			elementPathEnabled: false,
			//是否计数
			wordCount: false,
			//高度是否自动增长
			autoHeightEnabled: false,
		});

		editor.ready(() => {
			editor.setContent(innerHtml);
		});

		setTimeout(() => {
			let html = command(editor);
			this.setState({
				editor: editor,
				editHtml: html.editHtml,
				fixedHtml: html.fixedHtml,
				insertHtml: html.insertHtml,
				emreHtml: html.emreHtml,
				layoutHtml: html.layout,
			});
		}, 200);
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

	onCreate = (values) => {
		console.log("Received values of form: ", values);
		this.setState({
			visible: false,
		});
		var html = this.state.editor.getContent();
		axios
			.post("/record-template", {
				templateName: values.templateName,
				department: values.department,
				usageType: values.usageType,
				creater: values.creater,
				luruma: values.luruma,
				status: values.status,
				comment: values.comment,
				creationTime: moment().format("YYYY-MM-DD HH:mm:ss"),
				template: html,
			})
			.then(function (response) {
				console.log(response);
			});
	};

	save = () => {
		this.setState({
			visible: true,
		});
	};
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
		editor.body.setAttribute("contenteditable", "false");
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
			actualChange,
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
		} = this.state;
		let style = { height: "auto", width: width };
		return (
			<div className="ueditor-oak">
				<div className="ueditor-toobar-oak">
					<Tab
						tabs={[
							"编辑",
							"插入",
							"页面布局",
							"病历控件",
							"视图模式",
							"文件",
						]}
						fixed={<li className="tab-list-item theme">EMRA-OK</li>}
					>
						<div className="edui-default">
							<div
								className="edui-toolbar"
								dangerouslySetInnerHTML={{ __html: editHtml }}
							/>
						</div>
						<div className="edui-default">
							<div
								className="edui-toolbar"
								dangerouslySetInnerHTML={{ __html: insertHtml }}
							/>
						</div>
						<div className="edui-default">
							{/* <div className="edui-toolbar" dangerouslySetInnerHTML={{__html: layoutHtml}}/>*/}
							<div className="edui-toolbar">
								<div className="edui-box edui-button edui-for-orient">
									<div
										className={
											type ? "" : "edui-state-hover"
										}
										onClick={this.layout.bind(this, false)}
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
											type ? "edui-state-hover" : ""
										}
										onClick={this.layout.bind(this, true)}
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
							<div
								className="edui-toolbar"
								dangerouslySetInnerHTML={{ __html: emreHtml }}
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
												index === i ? "active" : ""
											)}
											title={v}
											onClick={this.onClick.bind(this, i)}
										>
											{v}
										</div>
									);
								})}
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
							</div>
						</div>
					</Tab>
					<div className="fixed-toobar">
						<div className="edui-default">
							<div
								className="edui-toolbar"
								dangerouslySetInnerHTML={{ __html: fixedHtml }}
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
				<CollectionCreateForm
					visible={this.state.visible}
					onCreate={this.onCreate.bind(this)}
					onCancel={() => {
						this.setState({
							visible: false,
						});
					}}
				/>
			</div>
		);
	}
}
