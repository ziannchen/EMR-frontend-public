import axios from "axios";

export const getOutpatientAsync = (params) =>
	axios.get("/outpatient", {
		params: params,
	});
