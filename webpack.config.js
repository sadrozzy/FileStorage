const path = require('path')
const globule = require('globule')
const fs = require('fs')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const cssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')

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
            template: path.join(__dirname, './index.pug'),
            filename: htmlFilename('index'),
        }),
        new HTMLWebpackPlugin({
            template: path.join(__dirname, './src/pages/auth/signup.pug'),
            filename: htmlFilename('signup'),
        }),
        new HTMLWebpackPlugin({
            template: path.join(__dirname, './src/pages/auth/resetpass.pug'),
            filename: htmlFilename('resetpass'),
        }),
        new MiniCssExtractPlugin({
            filename: filename('.css')
        })
    ]
}

const components = globule
    .find(["src/components/**/*.pug","!src/components/components.pug"])
    .map((path) => path.split('/').pop())
    .reduce((acc,currentItem) => acc + `include ${currentItem.replace('.pug', '')}/${currentItem}\n`, ``);

fs.writeFile("src/components/components.pug", components, (err) => {
    if (err) throw err
    console.log("Components are generated automatically");
});

module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: {
        main: './app.js',
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
        }
    },
    optimization: optimization(),
    devServer: {
        port: 4200,
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
                    filename: `assets/images/${filename('[ext]')}`,
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
