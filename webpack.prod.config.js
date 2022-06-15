const path = require("path");
const webpack = require("webpack");
const cssRegex = /\.(css|less)$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;
const stylusRegex = /\.styl$/;
const stylusModuleRegex = /\.module\.styl$/;

module.exports = {
	devtool: "source-map",

	entry: ["./src/index.js"],
	node: {
		fs: "empty",
	},
	output: {
		path: path.join(__dirname, "public"),
		filename: "bundle.js",
		publicPath: "./",
	},

	plugins: [
		// new webpack.optimize.UglifyJsPlugin({
		// 	minimize: true,
		// 	compress: {
		// 		warnings: false,
		// 	},
		// }),
		new webpack.DefinePlugin({
			"process.env": {
				NODE_ENV: JSON.stringify("production"),
			},
		}),
	],

	module: {
		rules: [
			{
				test: /\.js?$/,
				loader: "babel-loader",
				include: path.join(__dirname, "src"),
			},
			{
				test: /\.scss?$/,
				loader: "style-loader!css-loader!sass-loader",
				include: path.join(__dirname, "src", "styles"),
			},
			{
				test: /\.css$/,
				loader: "style-loader!css-loader!sass-loader",
			},
			{ test: /\.png$/, loader: "file-loader" },
			{
				test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
				loader: "file-loader",
			},
		],
	},
};
