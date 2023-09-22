"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.dsfrDocumentApi = void 0;
var next_pagesdir_1 = require("@codegouvfr/react-dsfr/next-pagesdir");
var link_1 = require("next/link");
var PublicLayout_1 = require("@/layouts/PublicLayout");
var react_1 = require("@emotion/react");
var cache_1 = require("@emotion/cache");
require("../styles/global.css");
var next_i18next_1 = require("next-i18next");
var _a = next_pagesdir_1.createNextDsfrIntegrationApi({
    defaultColorScheme: 'light',
    Link: link_1["default"],
    preloadFonts: [
        //"Marianne-Light",
        //"Marianne-Light_Italic",
        'Marianne-Regular',
        //"Marianne-Regular_Italic",
        'Marianne-Medium',
        //"Marianne-Medium_Italic",
        'Marianne-Bold'
        //"Marianne-Bold_Italic",
        //"Spectral-Regular",
        //"Spectral-ExtraBold"
    ]
}), withDsfr = _a.withDsfr, dsfrDocumentApi = _a.dsfrDocumentApi;
exports.dsfrDocumentApi = dsfrDocumentApi;
function App(_a) {
    var Component = _a.Component, pageProps = _a.pageProps;
    var getLayout = function (children) {
        return React.createElement(PublicLayout_1["default"], null, children);
    };
    var cache = cache_1["default"]({
        key: 'cache-form'
    });
    return (React.createElement(react_1.CacheProvider, { value: cache }, getLayout(React.createElement(Component, __assign({}, pageProps)))));
}
exports["default"] = next_i18next_1.appWithTranslation(withDsfr(App));
