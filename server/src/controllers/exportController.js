const asyncHandler = require('express-async-handler');
const ExcelJS = require('exceljs');
const Asset = require('../models/Asset');
const buildAssetQuery = require('../utils/buildAssetQuery');

const COLUMNS = [
  { header: 'Asset Number', key: 'assetNumber', width: 16 },
  { header: 'Equipment Name', key: 'equipmentName', width: 24 },
  { header: 'Type', key: 'type', width: 16 },
  { header: 'Make / Model', key: 'makeModel', width: 22 },
  { header: 'Serial Number', key: 'serialNumber', width: 20 },
  { header: 'Location', key: 'location', width: 18 },
  { header: 'Department', key: 'department', width: 18 },
  { header: 'Assigned User', key: 'assignedUser', width: 18 },
  { header: 'Vendor', key: 'vendor', width: 16 },
  { header: 'Purchase Date', key: 'purchaseDate', width: 15 },
  { header: 'Purchase Cost', key: 'purchaseCost', width: 14 },
  { header: 'Warranty Expiry', key: 'warrantyExpiryDate', width: 16 },
  { header: 'Warranty Status', key: 'warrantyStatus', width: 16 },
  { header: 'Status', key: 'status', width: 12 },
  { header: 'Notes', key: 'notes', width: 24 },
];

const fmtDate = (d) => (d ? new Date(d).toISOString().split('T')[0] : '');

const buildRows = async (query) => {
  const filter = buildAssetQuery(query);
  const assets = await Asset.find(filter).populate('department', 'name').sort({ createdAt: -1 });

  return assets.map((asset) => ({
    assetNumber: asset.assetNumber,
    equipmentName: asset.equipmentName,
    type: asset.type,
    makeModel: asset.makeModel,
    serialNumber: asset.serialNumber,
    location: asset.location,
    department: asset.department?.name || '',
    assignedUser: asset.assignedUser,
    vendor: asset.vendor,
    purchaseDate: fmtDate(asset.purchaseDate),
    purchaseCost: asset.purchaseCost,
    warrantyExpiryDate: fmtDate(asset.warrantyExpiryDate),
    warrantyStatus: asset.warrantyStatus,
    status: asset.status,
    notes: asset.notes,
  }));
};

const csvEscape = (value) => {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// @desc Export filtered asset list as CSV
// @route GET /api/export/csv
const exportCSV = asyncHandler(async (req, res) => {
  const rows = await buildRows(req.query);

  const header = COLUMNS.map((c) => csvEscape(c.header)).join(',');
  const lines = rows.map((row) => COLUMNS.map((c) => csvEscape(row[c.key])).join(','));
  const csv = [header, ...lines].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="it-assets-${Date.now()}.csv"`);
  res.status(200).send('﻿' + csv); // BOM so Excel opens UTF-8 correctly
});

// @desc Export filtered asset list as Excel workbook
// @route GET /api/export/excel
const exportExcel = asyncHandler(async (req, res) => {
  const rows = await buildRows(req.query);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'IT Asset Manager';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('IT Assets');
  sheet.columns = COLUMNS;
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' },
  };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  rows.forEach((row) => sheet.addRow(row));
  sheet.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + COLUMNS.length)}1` };

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', `attachment; filename="it-assets-${Date.now()}.xlsx"`);

  await workbook.xlsx.write(res);
  res.end();
});

module.exports = { exportCSV, exportExcel };
