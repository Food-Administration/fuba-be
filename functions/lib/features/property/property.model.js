"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const PropertySchema = new mongoose_1.Schema({
    image: { type: String, required: true },
    property_name: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    youtube_link: { type: String },
    property_type: { type: String, required: true },
    apartment_type: { type: String, required: true },
    number_of_bedrooms: { type: Number, required: true },
    number_of_bathrooms: { type: Number, required: true },
    payment_type: { type: String, required: true },
    price: { type: Number, required: true },
    deposit: { type: Number, required: true },
    requirements: { type: [String], default: [] },
    minimum_stay: { type: Number, required: true },
    maximum_stay: { type: Number, required: true },
    availability: { type: Boolean, default: true },
    viewing_days: { type: [String], default: [] },
    square_footage: { type: Number, required: true },
    key_features: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    apartment_plan: { type: String },
    date_posted: { type: Date, default: Date.now },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }
});
exports.default = mongoose_1.default.model('Property', PropertySchema);
//# sourceMappingURL=property.model.js.map