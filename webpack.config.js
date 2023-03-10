const path = require('path')
const globule = require('globule')
const fs = require('fs')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const cssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev
const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    }

    if (isProd) {
        config.minimizer = [
            new cssMinimizerPlugin(),
            new TerserWebpackPlugin()
        ]
    }

    return config
}
const filename = ext => isDev ? `[name]${ext}` : `[contenthash]${ext}`
const htmlFilename = name => isDev ? `${name}.html` : `[contenthash].html`
const cssLoaders = extra => {
    const loaders = [
        MiniCssExtractPlugin.loader,
        'css-loader'
    ]

    if (extra) {
        loaders.push(extra)
    }

    return loaders
}
const babelOptions = preset => {
    const opts = {
        presets: [
            '@babel/preset-env'
        ],
        plugins: [
            '@babel/plugin-proposal-class-properties'
        ]
    }

    if (preset) {
        opts.presets.push(preset)
    }

    return opts
}
const jsLoaders = () => {
    const loaders = [{
        loader: 'babel-loader',
        options: babelOptions()
    }]

    if (isDev) {
        //loaders.push('eslint-loader')
    }

    return loaders
}
const plugins = () => {
    return [
        new HTMLWebpackPlugin({
            template: path.join(__dirname, './src/pages/app/app.pug'),
            filename: htmlFilename('app'),
        }),
        new HTMLWebpackPlugin({
            template: path.join(__dirname, './draft/page.html'),
            filename: htmlFilename('draft'),
        }),
        new MiniCssExtractPlugin({
            filename: filename('.css')
        }),
        new NodePolyfillPlugin()
    ]
}


//Generation of Declaration
const components_pug = globule
    .find(["src/components/**/*.pug","!src/components/components.pug"])
    .map((path) => path.split('/').pop())
    .reduce((acc,currentItem) => acc + `include ${currentItem.replace('.pug', '')}/${currentItem}\n`, ``);

const components_scss = globule
    .find(["src/components/**/*.scss","!src/components/components.scss", "!src/components/variable.scss"])
    .map((path) => path.split('/').pop())
    .reduce((acc,currentItem) => acc + `@import "${currentItem.replace('.scss', '')}/${currentItem}";\n`, ``);

fs.writeFile("src/components/components.pug", components_pug, (err) => {
    if (err) throw err
    console.log("PUG declaration generated successfully");
});

fs.writeFile("src/components/components.scss", components_scss, (err) => {
    if (err) throw err
    console.log("SCSS declaration generated successfully");
});
//Generation of Declaration


module.exports = {

    mode: 'development',
    entry: {
        main: '/src/app.js',
    },
    output: {
        filename: filename('.js'),
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    resolve: {
        extensions: ['.js', '.json', '.png'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@components': path.resolve(__dirname, 'src/components')
        }
    },
    optimization: optimization(),
    devServer: {
        port: 3000,
        hot: isDev
    },
    plugins: plugins(),
    module: {
        rules: [
            {
                test: /\.css$/,
                use: cssLoaders()
            },
            {
                test: /\.pug$/,
                loader: 'pug-loader',
                options: {
                    pretty: isDev
                }
            },
            {
                test: /\.less$/,
                use: cssLoaders('less-loader')
            },
            {
                test: /\.s[ac]ss$/,
                use: cssLoaders('sass-loader')
            },
            {
                test: /\.(png|jpe?g|svg|gif)$/,
                type: 'asset/resource',
                generator: {
                    filename: `assets/images/[contenthash][ext]`,
                },
            },
            {
                test: /\.(ttf|woff|woff2|eot)$/,
                type: 'asset/resource',
                generator: {
                    filename: `assets/fonts/${filename('[ext]')}`,
                },
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: jsLoaders()
            }
        ]
    }
}
