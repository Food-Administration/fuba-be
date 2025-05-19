"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/utils/templateRenderer.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
class TemplateRenderer {
    constructor() {
        this.templateDir = path_1.default.join(__dirname, '../emailTemplates');
    }
    renderTemplate(templateName, data) {
        const templatePath = path_1.default.join(this.templateDir, templateName);
        const templateSource = fs_1.default.readFileSync(templatePath, 'utf8');
        const template = handlebars_1.default.compile(templateSource);
        return template(data);
    }
}
exports.default = new TemplateRenderer();
//# sourceMappingURL=templateRenderer.js.map