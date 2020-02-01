/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

'use strict';

/* eslint-env node */

const path = require( 'path' );
const webpack = require( 'webpack' );
const { bundler, styles } = require( '@ckeditor/ckeditor5-dev-utils' );
const CKEditorWebpackPlugin = require( '@ckeditor/ckeditor5-dev-webpack-plugin' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const TerserPlugin = require( 'terser-webpack-plugin' );

const postcssConfig = styles.getPostCssConfig( {
	themeImporter: {
		themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
	},
	minify: true
} );

const customProps = require( 'postcss-custom-properties' )( {
	importFrom: [
		'node_modules/@ckeditor/ckeditor5-ui/theme/globals/_zindex.css',
		'node_modules/@ckeditor/ckeditor5-theme-lark/theme/ckeditor5-ui/globals/_colors.css',
		'node_modules/@ckeditor/ckeditor5-theme-lark/theme/ckeditor5-ui/globals/_disabled.css',
		'node_modules/@ckeditor/ckeditor5-theme-lark/theme/ckeditor5-ui/globals/_focus.css',
		'node_modules/@ckeditor/ckeditor5-theme-lark/theme/ckeditor5-ui/globals/_fonts.css',
		'node_modules/@ckeditor/ckeditor5-theme-lark/theme/ckeditor5-ui/globals/_reset.css',
		'node_modules/@ckeditor/ckeditor5-theme-lark/theme/ckeditor5-ui/globals/_rounded.css',
		'node_modules/@ckeditor/ckeditor5-theme-lark/theme/ckeditor5-ui/globals/_shadow.css',
		'node_modules/@ckeditor/ckeditor5-theme-lark/theme/ckeditor5-ui/globals/_spacing.css',
		{
			customProperties: {
				'--ck-input-text-width': '18em',
				'--ck-line-height-base': '1.84615',
				'--ck-icon-size': 'calc(var(--ck-line-height-base) * var(--ck-font-size-normal))'
			}
		},
	],
	preserve: false,
} );

const postcssPlugins = [ ...postcssConfig.plugins.slice( 0, 3 ), customProps, ...postcssConfig.plugins.slice( 3 ) ];

postcssConfig.plugins = postcssPlugins;

module.exports = {
	devtool: 'source-map',
	performance: { hints: false },

	entry: [
		require.resolve( 'regenerator-runtime/runtime.js' ),
		path.resolve( __dirname, 'src', 'ckeditor.js' ),
	],

	output: {
		// The name under which the editor will be exported.
		library: 'ClassicEditor',

		path: path.resolve( __dirname, 'build' ),
		filename: 'ckeditor.js',
		libraryTarget: 'umd',
		libraryExport: 'default'
	},

	optimization: {
		minimizer: [
			new TerserPlugin( {
				sourceMap: true,
				terserOptions: {
					output: {
						// Preserve CKEditor 5 license comments.
						comments: /^!/
					}
				},
				extractComments: false
			} )
		]
	},

	plugins: [
		new CKEditorWebpackPlugin( {
			// UI language. Language codes follow the https://en.wikipedia.org/wiki/ISO_639-1 format.
			// When changing the built-in language, remember to also change it in the editor's configuration (src/ckeditor.js).
			language: 'ru',
			additionalLanguages: 'all'
		} ),
		new MiniCssExtractPlugin( {
			filename: 'styles.css',
		} ),
		new webpack.BannerPlugin( {
			banner: bundler.getLicenseBanner(),
			raw: true
		} )
	],

	module: {
		rules: [
			{
				test: /\.svg$/,
				use: [ 'raw-loader' ]
			},
			{
				test: /ckeditor5-[^/\\]+[/\\].+\.js$/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: [ require( '@babel/preset-env' ) ]
						}
					}
				]
			},
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					{
						loader: 'postcss-loader',
						options: postcssConfig
					},
				]
			}
		]
	}
};
