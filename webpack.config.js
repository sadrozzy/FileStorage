const path = require('path')
const globule = require('globule')
const fs = require('fs')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const cssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
//const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')
//const CopyWebpackPlugin = require('copy-webpack-plugin')
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
const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`
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
    // if (isProd) {
    //     base.push(new BundleAnalyzerPlugin())
    // }

    return [
        new HTMLWebpackPlugin({
            template: path.join(__dirname, 'app.pug'),
            filename: filename('html'),
        }),
        new MiniCssExtractPlugin({
            filename: filename('css')
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
        main: './app.js'
    },
    output: {
        filename: filename('js'),
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
    //devtool: isDev ? 'source-map' : '',
    plugins: plugins(),
    module: {
        rules: [
            // {
            //     test: /\.html$/,
            //     loader: "html-loader"
            // },
            {
                test: /\.css$/,
                use: cssLoaders()
            },
            {
                test: /\.pug$/,
                loader: 'pug-loader'
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
                    filename: 'assets/icons/[name].[hash:8][ext]',
                },
            },
            {
                test: /\.(ttf|woff|woff2|eot)$/,
                type: 'asset/resource',
                generator: {
                    filename: `assets/fonts/[name].[hash:8][ext]`,
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
