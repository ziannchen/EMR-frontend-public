/**
 * Created by liulingli on 2017/7/10.
 * desc 电子病历编辑器 - 控件文本值范围检查
 */
import React, { Component } from "react";
import { List, Typography, Divider, PageHeader, Alert } from "antd";
import classNames from "classnames";

export default class VestigeReservation extends Component {
	constructor(props) {
		super(props);
		this.state = {
			marks: this.props.marks,
			isShow: this.props.isShow,
		};
	}
	componentWillMount() {}
	componentWillReceiveProps(nextProps, nextState) {
		if (nextProps.marks !== nextState.marks) {
			this.setState({
				marks: nextProps.marks,
				isShow: nextProps.isShow,
			});
		}
	}

	render() {
		let { marks, isShow } = this.state;

		var errors = [];
		marks.map((v, i) => {
			if (!v.legal) {
				errors.push(v);
			}
		});
		if (errors.length == 0) {
			return <div className="bound-check" />;
		}
		return (
			<div className="bound-check">
				<PageHeader className="bound-check-header" title="内容错误" />
				{errors.map((v, i) => {
					return (
						<Alert
							message={v.name}
							description={"正确范围： " + v.range}
							type="error"
							key={i}
						/>
					);
				})}
			</div>
		);
	}
}
