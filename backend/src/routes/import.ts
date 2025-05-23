import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const upload = multer({
  dest: process.env.UPLOAD_DIR || './uploads',
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls', '.pdf'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Import investments from file
router.post('/:platformId', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { platformId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify platform exists
    const platform = await prisma.platform.findUnique({
      where: { id: platformId }
    });

    if (!platform) {
      return res.status(404).json({ error: 'Platform not found' });
    }

    // Parse file based on extension
    const fileExt = path.extname(file.originalname).toLowerCase();
    let investments: any[] = [];

    if (fileExt === '.csv') {
      investments = await parseCSV(file.path, platformId);
    } else if (fileExt === '.xlsx' || fileExt === '.xls') {
      investments = await parseExcel(file.path, platformId);
    } else {
      throw new Error('Unsupported file format');
    }

    // Insert investments into database
    const results = await insertInvestments(investments, req.user.userId, platformId);

    // Create import history record
    await prisma.importHistory.create({
      data: {
        userId: req.user.userId,
        platformId,
        filename: file.originalname,
        totalRecords: investments.length,
        successfulRecords: results.successful,
        status: results.successful === investments.length ? 'success' : 
                results.successful > 0 ? 'partial' : 'failed',
        errorDetails: results.errors.length > 0 ? JSON.stringify(results.errors) : null
      }
    });

    // Clean up uploaded file
    fs.unlinkSync(file.path);

    res.json({
      message: 'Import completed',
      totalRecords: investments.length,
      successfulRecords: results.successful,
      errors: results.errors
    });

  } catch (error) {
    // Clean up file if it exists
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Import failed: ' + error.message });
  }
});

// Helper functions for parsing different file formats
async function parseCSV(filePath: string, platformId: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Parse based on platform-specific format
        const parsed = parsePlatformData(data, platformId);
        if (parsed) results.push(parsed);
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function parseExcel(filePath: string, platformId: string): Promise<any[]> {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  return data.map(row => parsePlatformData(row, platformId)).filter(Boolean);
}

function parsePlatformData(row: any, platformId: string) {
  // Platform-specific parsing logic
  switch (platformId) {
    case 'moomoo':
      return parseMoomooData(row);
    case 'robinhood':
      return parseRobinhoodData(row);
    // Add other platforms...
    default:
      return parseGenericData(row);
  }
}

function parseMoomooData(row: any) {
  try {
    return {
      symbol: row['Symbol'] || row['代码'],
      name: row['Security Name'] || row['证券名称'],
      quantity: parseFloat(row['Quantity'] || row['数量']),
      purchasePrice: parseFloat(row['Average Cost'] || row['平均成本']),
      currentPrice: parseFloat(row['Market Price'] || row['市场价格']),
      purchaseDate: new Date(row['Purchase Date'] || row['购买日期']),
      currency: row['Currency'] || 'USD',
      sector: row['Sector'] || row['行业']
    };
  } catch (error) {
    return null;
  }
}

// Add other platform parsers...

async function insertInvestments(investments: any[], userId: string, platformId: string) {
  let successful = 0;
  const errors: string[] = [];

  for (const investment of investments) {
    try {
      await prisma.investment.create({
        data: {
          ...investment,
          userId,
          platformId
        }
      });
      successful++;
    } catch (error) {
      errors.push(`Failed to insert ${investment.symbol}: ${error.message}`);
    }
  }

  return { successful, errors };
}

export default router;