const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Department = require('../models/Department');
const Asset = require('../models/Asset');

const run = async () => {
  await connectDB();

  console.log('Seeding database...');

  // Creates the account from .env if it doesn't exist yet, or syncs its
  // name/password/designation to match the current .env values if it does.
  // This way, changing credentials in .env and re-running `npm run seed`
  // always brings the account up to date instead of silently skipping it.
  const upsertAccount = async ({ email, password, name, role, department, designation, label }) => {
    let user = await User.findOne({ email }).select('+password');
    if (!user) {
      user = await User.create({ email, password, name, role, department, designation });
      console.log(`Created ${label} account: ${email} (password: ${password})`);
      return user;
    }

    const passwordChanged = !(await user.matchPassword(password));
    const nameChanged = user.name !== name;
    const designationChanged = designation !== undefined && user.designation !== designation;

    if (passwordChanged || nameChanged || designationChanged) {
      user.name = name;
      user.designation = designation;
      if (passwordChanged) user.password = password; // pre-save hook re-hashes it
      await user.save();
      console.log(`Synced ${label} account from .env: ${email} (password: ${password})`);
    } else {
      console.log(`${label} account already up to date: ${email}`);
    }
    return user;
  };

  // ---- Head of Organization (admin) account ----
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@company.com').toLowerCase();
  const admin = await upsertAccount({
    email: adminEmail,
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
    name: process.env.ADMIN_NAME || 'System Administrator',
    role: 'admin',
    designation: 'Head of Organization',
    label: 'admin',
  });

  // ---- Departments ----
  const deptNames = [
    { name: 'Information Technology', code: 'IT' },
    { name: 'Human Resources', code: 'HR' },
    { name: 'Finance', code: 'FIN' },
    { name: 'Operations', code: 'OPS' },
    { name: 'Sales & Marketing', code: 'S&M' },
  ];

  const departments = {};
  for (const d of deptNames) {
    let dept = await Department.findOne({ name: d.name });
    if (!dept) {
      dept = await Department.create(d);
      console.log(`Created department: ${d.name}`);
    }
    departments[d.code] = dept;
  }

  // ---- Sample staff user ----
  const staffEmail = (process.env.STAFF_EMAIL || 'staff@company.com').toLowerCase();
  const staffPassword = process.env.STAFF_PASSWORD || 'Staff@123';
  const staff = await upsertAccount({
    email: staffEmail,
    password: staffPassword,
    name: process.env.STAFF_NAME || 'Department Staff',
    role: 'staff',
    department: departments.IT._id,
    designation: 'IT Executive',
    label: 'staff',
  });

  // ---- Sample assets ----
  const assetCount = await Asset.countDocuments();
  if (assetCount === 0) {
    const today = new Date();
    const addDays = (base, days) => {
      const d = new Date(base);
      d.setDate(d.getDate() + days);
      return d;
    };

    const sampleAssets = [
      {
        assetNumber: 'AST-0001',
        equipmentName: 'Dell Latitude 5420 Laptop',
        type: 'Laptop',
        makeModel: 'Dell Latitude 5420',
        serialNumber: 'DL5420-SN-001',
        location: 'Head Office - 2nd Floor',
        department: departments.IT._id,
        assignedUser: 'Rohit Sharma',
        vendor: 'Dell India',
        purchaseDate: addDays(today, -400),
        purchaseCost: 65000,
        warrantyExpiryDate: addDays(today, -10), // expired
        status: 'In Use',
      },
      {
        assetNumber: 'AST-0002',
        equipmentName: 'HP LaserJet Pro Printer',
        type: 'Printer',
        makeModel: 'HP LaserJet Pro M404dn',
        serialNumber: 'HPLJ-SN-002',
        location: 'Head Office - Ground Floor',
        department: departments.OPS._id,
        assignedUser: '',
        vendor: 'HP India',
        purchaseDate: addDays(today, -300),
        purchaseCost: 22000,
        warrantyExpiryDate: addDays(today, 15), // expiring soon
        status: 'Available',
      },
      {
        assetNumber: 'AST-0003',
        equipmentName: 'Dell PowerEdge Server',
        type: 'Server',
        makeModel: 'Dell PowerEdge R740',
        serialNumber: 'DPE740-SN-003',
        location: 'Server Room',
        department: departments.IT._id,
        assignedUser: '',
        vendor: 'Dell India',
        purchaseDate: addDays(today, -700),
        purchaseCost: 450000,
        warrantyExpiryDate: addDays(today, 400), // active
        status: 'In Use',
      },
      {
        assetNumber: 'AST-0004',
        equipmentName: 'Lenovo ThinkPad E14',
        type: 'Laptop',
        makeModel: 'Lenovo ThinkPad E14 Gen 3',
        serialNumber: 'LTP-E14-SN-004',
        location: 'Finance Wing',
        department: departments.FIN._id,
        assignedUser: 'Priya Verma',
        vendor: 'Lenovo India',
        purchaseDate: addDays(today, -100),
        purchaseCost: 58000,
        warrantyExpiryDate: addDays(today, 620),
        status: 'In Use',
      },
      {
        assetNumber: 'AST-0005',
        equipmentName: 'Samsung 27" Monitor',
        type: 'Monitor',
        makeModel: 'Samsung S27R650',
        serialNumber: 'SM27-SN-005',
        location: 'HR Wing',
        department: departments.HR._id,
        assignedUser: '',
        vendor: 'Samsung India',
        purchaseDate: addDays(today, -900),
        purchaseCost: 15000,
        warrantyExpiryDate: addDays(today, -200), // expired, retired
        status: 'Retired',
      },
    ];

    for (const a of sampleAssets) {
      await Asset.create({ ...a, createdBy: admin._id, updatedBy: admin._id });
    }
    console.log(`Created ${sampleAssets.length} sample assets`);
  } else {
    console.log('Assets already exist, skipping sample data.');
  }

  console.log('\nSeeding complete!');
  console.log('--------------------------------------------------');
  console.log(`Head of Organization login -> ${adminEmail} / ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
  console.log(`Department staff login     -> ${staffEmail} / ${staffPassword}`);
  console.log('--------------------------------------------------');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
