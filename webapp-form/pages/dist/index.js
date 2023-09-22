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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.getStaticProps = void 0;
var FormFirstBlock_1 = require("@/components/form/layouts/FormFirstBlock");
var FormSecondBlock_1 = require("@/components/form/layouts/FormSecondBlock");
var react_dsfr_1 = require("@codegouvfr/react-dsfr");
var react_1 = require("react");
var dsfr_1 = require("tss-react/dsfr");
var serverSideTranslations_1 = require("next-i18next/serverSideTranslations");
var router_1 = require("next/router");
function JDMAForm() {
    var _a = useStyles(), classes = _a.classes, cx = _a.cx;
    var router = router_1.useRouter();
    var product = {
        title: '1000J BLUES - AUTO DEPISTAGE DE LA DEPRESSION POST PARTUM'
    };
    var onToggleLanguageClick = function (newLocale) {
        var pathname = router.pathname, asPath = router.asPath, query = router.query;
        router.push({ pathname: pathname, query: query }, asPath, { locale: newLocale });
    };
    var _b = react_1.useState({
        satisfaction: undefined,
        comprehension: undefined,
        easy: undefined,
        difficulties: [],
        difficulties_verbatim: undefined,
        help: [],
        help_verbatim: undefined,
        verbatim: undefined
    }), opinion = _b[0], setOpinion = _b[1];
    return (React.createElement("div", null,
        React.createElement("div", { className: classes.blueSection }),
        React.createElement("div", { className: react_dsfr_1.fr.cx('fr-container') },
            React.createElement("div", { className: react_dsfr_1.fr.cx('fr-grid-row', 'fr-grid-row--center') },
                React.createElement("div", { className: react_dsfr_1.fr.cx('fr-col-8') },
                    React.createElement("div", { className: cx(classes.formSection) },
                        React.createElement("button", { onClick: function () {
                                onToggleLanguageClick('fr');
                            } }, "fr"),
                        React.createElement("button", { onClick: function () {
                                onToggleLanguageClick('en');
                            } }, "en"),
                        opinion.satisfaction ? (React.createElement(FormSecondBlock_1.FormSecondBlock, { opinion: opinion, onSubmit: function (result) { return setOpinion(__assign({}, result)); } })) : (React.createElement(FormFirstBlock_1.FormFirstBlock, { opinion: opinion, product: product, onSubmit: function (tmpOpinion) {
                                setOpinion(__assign({}, tmpOpinion));
                            } }))))))));
}
exports["default"] = JDMAForm;
var blueSectionPxHeight = 200;
var useStyles = dsfr_1.tss
    .withName(JDMAForm.name)
    .withParams()
    .create(function () { return ({
    blueSection: {
        height: blueSectionPxHeight + "px",
        backgroundColor: react_dsfr_1.fr.colors.decisions.background.alt.blueFrance["default"]
    },
    formSection: __assign(__assign({ backgroundColor: react_dsfr_1.fr.colors.decisions.background["default"].grey["default"], transform: "translateY(-" + blueSectionPxHeight / 2 + "px)" }, react_dsfr_1.fr.spacing('padding', { topBottom: '8v', rightLeft: '16v' })), { h1: __assign({ textAlign: 'center', color: react_dsfr_1.fr.colors.decisions.background.flat.blueFrance["default"] }, react_dsfr_1.fr.spacing('margin', { bottom: '8v' })) })
}); });
function getStaticProps(_a) {
    var locale = _a.locale;
    return __awaiter(this, void 0, void 0, function () {
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _b = {};
                    _c = [{}];
                    return [4 /*yield*/, serverSideTranslations_1.serverSideTranslations(locale !== null && locale !== void 0 ? locale : 'fr', ['common'])];
                case 1: return [2 /*return*/, (_b.props = __assign.apply(void 0, _c.concat([(_d.sent())])),
                        _b)];
            }
        });
    });
}
exports.getStaticProps = getStaticProps;
