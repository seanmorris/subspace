const { exec } = require('child_process');

exports.files = {
  javascripts: {joinTo: 'app.js'},
  stylesheets: {joinTo: 'app.css'}
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
};

exports.hooks = {
	preCompile: () => {
		console.log('About to compile...');
		exec(
			`cd ../curvature-2 && npm link`
				+ ` && cd ../subspace-console && npm link`
				+ ` && cd ../frontend && npm link curvature`
				+ ` && cd ../frontend && npm link subspace-console`
			// `cd ../frontend && npm unlink --no-save curvature`
			// `ls -la`
			, (err, stdout, stderr)=>{
				console.log(err);
				console.log(stdout);
				console.log(stderr);

				return Promise.resolve();
			}
		)
	}
};

exports.npm = {styles: {
	'subspace-console': ['style/layout.css']
}}
