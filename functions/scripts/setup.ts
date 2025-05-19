import 'tsconfig-paths/register';
import dotenv from 'dotenv';
import connectDB from '../config/dbConn';
import RoleModel from '../models/role.model';
import PermissionModel from '../models/permission.model';
import VendorType from '../models/vendorType.model';
import userModel from '../models/user.model';
import RequestFlowModel from '../models/requestFlow.model'; // Import the RequestFlow model
import CustomError from '../utils/customError';
import bcrypt from 'bcrypt';

dotenv.config();

const setup = async () => {
    await connectDB();

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
    const savedPermissions = await PermissionModel.insertMany(permissions);
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
    await RoleModel.deleteMany({});
    console.log('Existing roles removed');

    // Save roles to the database
    const savedRoles = await RoleModel.insertMany(roles);
    console.log('Roles saved:', savedRoles);

    // Step 3: Create an admin user
    const adminRole = savedRoles.find((role) => role.name === 'admin');
    if (!adminRole) {
        throw new CustomError('Admin role not found', 400);
    }

    // Hash the admin password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin', saltRounds);

    const adminUser = new userModel({
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
    await RequestFlowModel.deleteMany({});
    console.log('Existing request flows removed');

    // Save request flows to the database
    const savedRequestFlows = await RequestFlowModel.insertMany(requestFlows);
    console.log('Request flows saved:', savedRequestFlows);

    // Step 5: Create Vendor Types
    const vendorTypes = [
        { name: 'Energy & Infrastructure', description: 'All about Energy & Infrastructure' },
        { name: 'Procurement', description: 'All about Procurement' },
        { name: 'Logistics', description: 'All about Logistics' },
    ];

    // Remove existing vendor types from the database
    await VendorType.deleteMany({});
    console.log('Existing vendor types removed');

    // Save vendor types to the database
    const savedVendorTypes = await VendorType.insertMany(vendorTypes);
    console.log('Vendor types saved:', savedVendorTypes);

    process.exit(0);
};

setup().catch((err) => {
    console.error('Error during setup:', err);
    process.exit(1);
});