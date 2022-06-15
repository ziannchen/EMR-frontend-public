import React, { useState, Component } from "react";
import UeditorDesign from "../components/ueditor-design";
import { AppContainer } from "react-hot-loader";

export default class TemplateDesign extends Component {
	render() {
		return (
			<AppContainer>
				<div className="emr-edit">
					<UeditorDesign
						id="ueditor-design"
						// ref={(node) => (this.UeditorEdit = node)}
					/>
				</div>
			</AppContainer>
		);
	}
}
