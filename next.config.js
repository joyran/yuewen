const path = require('path')
const glob = require('glob')

module.exports = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.module.rules.push(
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'eslint-loader'
        },
        {
          test: /\.(css|scss)/,
          loader: 'emit-file-loader',
          options: {
            name: 'dist/[path][name].[ext]'
          }
        },
        {
          test: /\.css$/,
          use: ['babel-loader', 'raw-loader', 'postcss-loader']
        },
        {
          test: /\.s(a|c)ss$/,
          use: ['babel-loader', 'raw-loader', 'postcss-loader',
            {
              loader: 'sass-loader',
              options: {
                includePaths: ['components', 'styles']
                  .map((d) => path.join(__dirname, d))
                  .map((g) => glob.sync(g))
                  .reduce((a, c) => a.concat(c), [])
              }
            }
          ]
        }
      )
    }
    return config
  }
}
