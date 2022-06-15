/**
 * Created by liulingli on 2017/7/10.
 * desc 电子病历编辑器
 */
import React, { Component } from "react";

export default class UeditorPreview extends Component {
	type = ["设计模式", "编辑模式", "只读模式", "审阅模式"];
	constructor(props) {
		super(props);
		this.state = {
			editor: undefined,
			index: 0,
			type: true, //纵向
			width: 700,
			actualChange: [],
		};
	}
	componentWillMount() {}
	componentDidMount() {
		let that = this;
		let { id, innerHtml } = this.props;
		console.log(id);
		let editor = UE.getEditor(id, {
			initialFrameWidth: "100%",
		});
		editor.ready(function () {
			editor.setContent(innerHtml, true);

			setTimeout(() => {
				that.setState(
					{
						editor: editor,
					},
					() => {
						that.readonlyPattern();
					}
				);
			}, 200);
		});
	}

	setHtml(innelHtml) {
		var editor = this.state.editor;
		editor.setContent(innelHtml, false);
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

	render() {
		let { id } = this.props;
		let { width } = this.state;
		let style = { height: "auto", width: width };
		return (
			<div className="ueditor-oak">
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
		);
	}
}
