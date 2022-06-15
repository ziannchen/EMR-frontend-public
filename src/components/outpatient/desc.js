import { Descriptions } from "antd";
import React from "react";

function PatientDesc(props) {
	return (
		<Descriptions column={1}>
			<Descriptions.Item label="门诊挂号序号">
				{props.patientInfo.mzghxh}
			</Descriptions.Item>
			<Descriptions.Item label="姓名">
				{props.patientInfo.xm}
			</Descriptions.Item>
			<Descriptions.Item label="性别">
				{props.patientInfo.xb == "1" ? "男" : "女"}
			</Descriptions.Item>
			<Descriptions.Item label="出生时间">
				{new Date(props.patientInfo.cssj).format("yyyy-MM-dd")}
			</Descriptions.Item>
			<Descriptions.Item label="年龄">{props.nl}</Descriptions.Item>
			<Descriptions.Item label="科别">{props.kb}</Descriptions.Item>
			<Descriptions.Item label="病人编号">
				{props.patientInfo.cdno}
			</Descriptions.Item>
			<Descriptions.Item label="身份证号码">
				{props.patientInfo.sfzhm}
			</Descriptions.Item>
			<Descriptions.Item label="住址">
				{props.patientInfo.class}
			</Descriptions.Item>
			<Descriptions.Item label="电话号码">
				{props.patientInfo.tel}
			</Descriptions.Item>
		</Descriptions>
	);
}

export default PatientDesc;
