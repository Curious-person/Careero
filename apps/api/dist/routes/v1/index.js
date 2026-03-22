"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const health_route_1 = __importDefault(require("./health.route"));
const auth_route_1 = __importDefault(require("./auth.route"));
const profile_route_1 = __importDefault(require("./profile.route"));
const accumulation_route_1 = __importDefault(require("./accumulation.route"));
const role_route_1 = __importDefault(require("./role.route"));
const router = express_1.default.Router();
const defaultRoutes = [
    {
        path: '/health',
        route: health_route_1.default,
    },
    {
        path: '/auth',
        route: auth_route_1.default,
    },
    {
        path: '/profile',
        route: profile_route_1.default,
    },
    {
        path: '/accumulations',
        route: accumulation_route_1.default,
    },
    {
        path: '/roles',
        route: role_route_1.default,
    },
];
defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});
exports.default = router;
