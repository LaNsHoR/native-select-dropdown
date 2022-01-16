
const path = require('path');

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: './src/select-dropdown.js',
  output: {
    filename: 'select-dropdown.js',
    path: path.resolve(__dirname, 'cypress/fixtures'),
  },
  devServer: {
    static: path.join(__dirname, 'cypress/fixtures'),
    compress: true,
    port: 9000
  }
}
