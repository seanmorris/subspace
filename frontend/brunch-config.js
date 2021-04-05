const { exec } = require('child_process');

exports.files = {
  javascripts: {
		joinTo: {
			'app.js': /^app/
			, 'curvature.js': /^node_modules\/curvature/
			, 'vendor.js': /^node_modules\/((?!curvature))/
		}
	},

	stylesheets: {
		joinTo: 'app.css'
	}
};

exports.plugins = {
	babel: {
		plugins: ['@babel/plugin-proposal-class-properties', 'macros'],
		presets: ['@babel/preset-env']
	},

	raw: {
		pattern: /\.(html)$/,
		wrapper: content => `module.exports = ${JSON.stringify(content)}`
	}

	, babel: {
		presets: ['@babel/preset-env', ['minify', {builtIns: false}]],
		plugins: ["@babel/plugin-proposal-class-properties", "macros"]
	},

	preval: {
		tokens: {
			BUILD_TIME:  Date.now() / 1000
			, BUILD_TAG: process.env.ENV_LOCK_TAG || 'notag'
			, BUILD_LOCALTIME: new Date
		}
		, log: true
	},

	raw: {
		pattern: /\.(jss|html|php|tmp|svg)/,
		wrapper: content => `module.exports = ${JSON.stringify(content)}`
	}
};

exports.hooks = {
	preCompile: () => {
		return new Promise(accept => {

			console.log('About to compile...');

			exec(
				`cd ../curvature-2 && npm link`
					+ ` && cd ../subspace-console && npm link`
					+ ` && cd ../subspace-client && npm link`
					+ ` && cd ../frontend && npm link curvature`
					+ ` && cd ../frontend && npm link subspace-console`
					+ ` && cd ../frontend && npm link subspace-client`
				, (err, stdout, stderr)=>{
					console.log(err);
					console.log(stdout);
					console.log(stderr);

					accept();
				}
			)
		});
	}
};

exports.npm = {styles: {
	'subspace-console': ['style/layout.css']
}}
