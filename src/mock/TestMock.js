const Mock = require("mockjs");
// import innerHtml from "./innerHtml.js";
import innerHtml from "./requiredTest.js";
Mock.setup({
	timeout: "200-600", // 表示响应时间介于 200 和 600 毫秒之间，默认值是'10-100'。
});
//get请求
Mock.mock("/outpatient", "get", {
	data: {
		patientInfo: {
			mzghxh: "1           ",
			xm: "crr",
			xb: "1",
			cssj: "2000-01-01T00:00:00Z",
			nl: "22",
			kb: "A",
			cdno: "1",
			sfzhm: "1231234",
		},
		historyRecords: [
			{
				recordNo: "1001",
				recordType: "门诊初诊病历",
				record: innerHtml,
				changeLog:
					'[["1",[{"date":"2022-05-07 20:45:14","author":"刘伶俐","type":"1","desc":"修改为 1322123"}]],["2",[{"date":"2022-05-07 20:45:14","author":"刘伶俐","type":"2","desc":"修改为 2"}]]]',
			},
			{
				recordNo: "1002",
				recordType: "门诊初诊病历",
				record: "bbb",
				changeLog: "0",
			},
		],
		availableTemplates: [
			{
				templateNo: "1001",
				templateName: "门诊初诊病历",
				template: "aaa",
			},
			{
				templateNo: "1002",
				templateName: "门诊初诊病历",
				template: "bbb",
			},
		],
	},
});

// //get请求：模拟分页数据
// module.exports = Mock.mock("/list", "get", (options) => {
// 	//接受参数：是JSON格式，需要转换成对象
// 	const page = JSON.parse(options.body).page;
// 	const ret = Mock.mock({
// 		"list|20": [{ "id|+1": 1, name: "@cname" }],
// 	});

// 	if (page > 3) {
// 		return {
// 			status: 200,
// 			data: [],
// 		};
// 	}
// 	return {
// 		status: 200,
// 		data: ret,
// 	};
// });

// //post请求，模拟注册
// module.exports = Mock.mock("/add", "post", (options) => {
// 	return {
// 		status: 200,
// 		data: JSON.parse(options.body).data,
// 	};
// });
