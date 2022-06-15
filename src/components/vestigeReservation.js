/**
 * Created by liulingli on 2017/7/10.
 * desc 电子病历编辑器 - 痕迹保留
 */
import React, { Component } from "react";
import classNames from "classnames";
import { Menu, Collapse, List, PageHeader } from "antd";

const { Panel } = Collapse;
const items = [
	{
		label: "历史",
		key: "history",
	},
	{
		label: "当前",
		key: "current",
	},
];

export default class VestigeReservation extends Component {
	constructor(props) {
		super(props);
		this.state = {
			combinedChanges: this.props.combinedChanges,
			currentChange: this.props.currentChange,
			isShow: this.props.isShow,
			current: "history",
		};
	}
	componentWillReceiveProps(nextProps, nextState) {
		if (
			nextProps.combinedChanges !== nextState.combinedChanges ||
			nextProps.currentChange !== nextState.currentChange
		) {
			this.setState({
				combinedChanges: nextProps.combinedChanges,
				currentChange: nextProps.currentChange,
				isShow: nextProps.isShow,
			});
		}
	}

	onClick(e) {
		this.setState({
			current: e.key,
		});
	}

	render() {
		let { combinedChanges, currentChange, isShow } = this.state;

		var contents = Array.from(combinedChanges.keys()).map((v, i) => {
			var data = combinedChanges.get(v);
			return (
				<Panel header={v} key={i} className="vestige-content-item">
					<List
						itemLayout="horizontal"
						dataSource={data}
						renderItem={(item) => (
							<List.Item>
								<List.Item.Meta
									title={
										<div
											dangerouslySetInnerHTML={{
												__html: item.desc,
											}}
										/>
									}
									description={item.author + " " + item.date}
								/>
							</List.Item>
						)}
					/>
				</Panel>
			);
		});

		return (
			<div className="vestige-reservation">
				<PageHeader className="vestige-header" title="编辑记录" />
				<div className="vestige-list">
					<Collapse defaultActiveKey={["1"]}>{contents}</Collapse>
				</div>
			</div>
		);
	}
}
