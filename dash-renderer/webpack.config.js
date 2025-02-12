const webpack = require('webpack');
const R = require('ramda');
const path = require('path');
const packagejson = require('./package.json');
const dashLibraryName = packagejson.name.replace(/-/g, '_');

const defaultOptions = {
    mode: 'development',
    devtool: 'none',
    entry: {
        main: ['@babel/polyfill', 'whatwg-fetch', './src/index.js'],
    },
    output: {
        path: path.resolve(__dirname, dashLibraryName),
        filename: `${dashLibraryName}.dev.js`,
        library: dashLibraryName,
        libraryTarget: 'window',
    },
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        'plotly.js': 'Plotly',
        'prop-types': 'PropTypes',
    },
    plugins: [],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                    },
                ],
            },
            {
                test: /\.svg$/,
                use: ['@svgr/webpack'],
            },
            {
                test: /\.txt$/i,
                use: 'raw-loader',
            },
        ],
    },
};

module.exports = (_, argv) => {
    const devtool = argv.build === 'local' ? 'source-map' : 'none';
    return [
        R.mergeDeepLeft({devtool}, defaultOptions),
        R.mergeDeepLeft(
            {
                devtool: devtool,
                mode: 'production',
                output: {
                    filename: `${dashLibraryName}.min.js`,
                },
                plugins: [
                    new webpack.NormalModuleReplacementPlugin(
                        /(.*)GlobalErrorContainer.react(\.*)/,
                        function(resource) {
                            resource.request = resource.request.replace(
                                /GlobalErrorContainer.react/,
                                'GlobalErrorContainerPassthrough.react'
                            );
                        }
                    ),
                ],
            },
            defaultOptions
        ),
    ];
};
