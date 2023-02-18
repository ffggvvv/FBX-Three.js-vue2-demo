module.exports = {
    plugins: {
        "autoprefixer": {},
        "postcss-pxtorem": {
            rootValue: 37.5, // 换算的基数(设计图375的根字体为37.5)
            propList: ['*']
        }
    }
}