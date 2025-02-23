module.exports = {
    presets: [
        ["@babel/preset-env", { targets: { node: "current" } }],
        ["@babel/preset-react", { runtime: "automatic" }], // ✅ Enables JSX without explicit React import
        "@babel/preset-typescript"
    ]
};
