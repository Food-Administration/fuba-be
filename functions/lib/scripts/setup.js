"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("tsconfig-paths/register");
const dotenv_1 = __importDefault(require("dotenv"));
const dbConn_1 = __importDefault(require("../config/dbConn"));
const role_model_1 = __importDefault(require("../models/role.model"));
const permission_model_1 = __importDefault(require("../models/permission.model"));
const vendorType_model_1 = __importDefault(require("../models/vendorType.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const requestFlow_model_1 = __importDefault(require("../models/requestFlow.model")); // Import the RequestFlow model
const customError_1 = __importDefault(require("../utils/customError"));
const bcrypt_1 = __importDefault(require("bcrypt"));
dotenv_1.default.config();
const setup = async () => {
    await (0, dbConn_1.default)();
    // Step 1: Define permissions with descriptions
    const permissions = [
        { name: 'View Users', description: 'Permission to view user profiles' },
        { name: 'Edit Users', description: 'Permission to edit user profiles' },
        { name: 'View Dashboards', description: 'Permission to view dashboards' },
        { name: 'View Reports', description: 'Permission to view reports' },
        { name: 'Delete Users', description: 'Permission to delete users' },
        { name: 'View Vendors', description: 'Permission to view vendors' },
        { name: 'Manage Roles', description: 'Permission to manage roles' },
        { name: 'Access Settings', description: 'Permission to access settings' },
        { name: 'Manage Finance', description: 'Permission to manage finance' },
    ];
    // Save permissions to the database
    const savedPermissions = await permission_model_1.default.insertMany(permissions);
    console.log('Permissions saved:', savedPermissions);
    // Step 2: Define roles and associate permissions
    const roles = [
        {
            name: 'manager',
            permissions: savedPermissions
                .filter((p) => ['View Users', 'Edit Users', 'View Dashboards', 'View Reports'].includes(p.name))
                .map((p) => p._id),
        },
        {
            name: 'admin',
            permissions: savedPermissions
                .filter((p) => ['View Users', 'Edit Users', 'View Dashboards', 'View Reports'].includes(p.name))
                .map((p) => p._id),
        },
        {
            name: 'supervisor',
            permissions: savedPermissions
                .filter((p) => ['View Users'].includes(p.name))
                .map((p) => p._id),
        },
        {
            name: 'user',
            permissions: savedPermissions
                .filter((p) => ['View Reports'].includes(p.name))
                .map((p) => p._id),
        },
        {
            name: 'vendor',
            permissions: savedPermissions
                .filter((p) => ['View Reports'].includes(p.name))
                .map((p) => p._id),
        },
    ];
    // Remove existing roles from the database
    await role_model_1.default.deleteMany({});
    console.log('Existing roles removed');
    // Save roles to the database
    const savedRoles = await role_model_1.default.insertMany(roles);
    console.log('Roles saved:', savedRoles);
    // Step 3: Create an admin user
    const adminRole = savedRoles.find((role) => role.name === 'admin');
    if (!adminRole) {
        throw new customError_1.default('Admin role not found', 400);
    }
    // Hash the admin password
    const saltRounds = 10;
    const hashedPassword = await bcrypt_1.default.hash('admin', saltRounds);
    const adminUser = new user_model_1.default({
        companyName: 'Ferncot Fern',
        email: 'ferncot1@gmail.com',
        password: hashedPassword,
        username: 'admin',
        phNo: '4575845454',
        firstName: 'Admin',
        lastName: 'Admin',
        employmentDetails: {
            department: 'General',
            designation: 'Supervisor',
            empDate: new Date(),
            empType: 'Full-time',
            jobRole: 'Administrator',
            supervisor: null,
        },
        fileDocument: '/documents/admin.pdf',
        appointmentLetter: '/documents/admin_appointment.pdf',
        emergencyContact: {
            contactName: 'Emergency Contact',
            contactNumber: '+0987654321',
            contactAddress: '123 Admin St, City, Country',
            relationship: 'Friend',
        },
        profilePicture: '/profile_pictures/admin.jpg',
        roles: [adminRole._id], // Assign the admin role
        googleId: null,
        verified: true,
        role: adminRole._id,
    });
    // Save the admin user to the database
    await adminUser.save();
    console.log('Admin user created:', adminUser);
    // Step 4: Create RequestFlow documents
    const requestFlows = [
        {
            workflowItem: 'Budget',
            displayName: 'Budget Management Approval Flow',
            approvals: [
                {
                    userId: adminUser._id,
                    dept: 'Head Logistics',
                    rank: '1st Approval',
                },
                {
                    userId: adminUser._id,
                    dept: 'Head, Procurement',
                    rank: '2nd Approval',
                },
                {
                    userId: adminUser._id,
                    dept: 'Head Budget',
                    rank: '3rd Approval',
                },
            ],
        },
        {
            workflowItem: 'Procurement',
            displayName: 'Procurement Management Approval Flow',
            approvals: [
                {
                    userId: adminUser._id,
                    dept: 'Head Logistics',
                    rank: '1st Approval',
                },
                {
                    userId: adminUser._id,
                    dept: 'Head, Procurement',
                    rank: '2nd Approval',
                },
                {
                    userId: adminUser._id,
                    dept: 'Head Budget',
                    rank: '3rd Approval',
                },
            ],
        },
        {
            workflowItem: 'Logistics',
            displayName: 'Logistics Management Approval Flow',
            approvals: [
                {
                    userId: adminUser._id,
                    dept: 'Head Logistics',
                    rank: '1st Approval',
                },
                {
                    userId: adminUser._id,
                    dept: 'Head, Procurement',
                    rank: '2nd Approval',
                },
                {
                    userId: adminUser._id,
                    dept: 'Head Budget',
                    rank: '3rd Approval',
                },
            ],
        },
        {
            workflowItem: 'Inventory',
            displayName: 'Inventory Management Approval Flow',
            approvals: [
                {
                    userId: adminUser._id,
                    dept: 'Head Logistics',
                    rank: '1st Approval',
                },
                {
                    userId: adminUser._id,
                    dept: 'Head, Procurement',
                    rank: '2nd Approval',
                },
                {
                    userId: adminUser._id,
                    dept: 'Head Budget',
                    rank: '3rd Approval',
                },
            ],
        },
        {
            workflowItem: 'Operations',
            displayName: 'Operations Management Approval Flow',
            approvals: [
                {
                    userId: adminUser._id,
                    dept: 'Head Logistics',
                    rank: '1st Approval',
                },
                {
                    userId: adminUser._id,
                    dept: 'Head, Procurement',
                    rank: '2nd Approval',
                },
                {
                    userId: adminUser._id,
                    dept: 'Head Budget',
                    rank: '3rd Approval',
                },
            ],
        },
    ];
    // Remove existing request flows from the database
    await requestFlow_model_1.default.deleteMany({});
    console.log('Existing request flows removed');
    // Save request flows to the database
    const savedRequestFlows = await requestFlow_model_1.default.insertMany(requestFlows);
    console.log('Request flows saved:', savedRequestFlows);
    // Step 5: Create Vendor Types
    const vendorTypes = [
        { name: 'Energy & Infrastructure', description: 'All about Energy & Infrastructure' },
        { name: 'Procurement', description: 'All about Procurement' },
        { name: 'Logistics', description: 'All about Logistics' },
    ];
    // Remove existing vendor types from the database
    await vendorType_model_1.default.deleteMany({});
    console.log('Existing vendor types removed');
    // Save vendor types to the database
    const savedVendorTypes = await vendorType_model_1.default.insertMany(vendorTypes);
    console.log('Vendor types saved:', savedVendorTypes);
    process.exit(0);
};
setup().catch((err) => {
    console.error('Error during setup:', err);
    process.exit(1);
});
//# sourceMappingURL=setup.js.map