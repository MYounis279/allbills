import express from 'express';
import multer from 'multer';
import cors from 'cors';
import * as pdfjsLib from 'pdfjs-dist';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Root route
app.get('/', (req, res) => {
  res.json({ status: 'PDF parsing server is running' });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.post('/api/parse-dha-bill', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    // Load the PDF document
    const data = new Uint8Array(req.file.buffer);
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdfDocument = await loadingTask.promise;

    // Get the first page
    const page = await pdfDocument.getPage(1);
    const textContent = await page.getTextContent();
    const text = textContent.items.map(item => item.str).join(' ');

    console.log('Extracted text:', text); // Debug log

    // Extract bill details using regex patterns
    const billDetails = {
      Amount: extractAmount(text),
      DueDate: extractDueDate(text),
      Status: 'UNPAID',
      BillNumber: extractBillNumber(text),
      ConsumerName: extractConsumerName(text),
      Address: extractAddress(text),
      BillingMonth: extractBillingMonth(text)
    };

    console.log('Parsed bill details:', billDetails); // Debug log

    res.json(billDetails);
  } catch (error) {
    console.error('Error parsing PDF:', error);
    res.status(500).json({ error: 'Failed to parse PDF', details: error.message });
  }
});

function extractAmount(text) {
  const amountMatch = text.match(/Total Amount[:\s]+Rs\.\s*([\d,]+)/i) || 
                     text.match(/Amount Payable[:\s]+Rs\.\s*([\d,]+)/i) ||
                     text.match(/Rs\.\s*([\d,]+)/i);
  return amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
}

function extractDueDate(text) {
  const dueDateMatch = text.match(/Due Date[:\s]+(\d{2}[-/]\d{2}[-/]\d{4})/i) ||
                      text.match(/Last Date[:\s]+(\d{2}[-/]\d{2}[-/]\d{4})/i);
  if (!dueDateMatch) return new Date().toISOString();
  
  const dateParts = dueDateMatch[1].split(/[-/]/);
  const date = new Date(
    parseInt(dateParts[2]), // year
    parseInt(dateParts[1]) - 1, // month (0-based)
    parseInt(dateParts[0]) // day
  );
  return date.toISOString();
}

function extractBillNumber(text) {
  const billNumberMatch = text.match(/Bill Number[:\s]+(\w+)/i) ||
                         text.match(/Bill No[:\s]+(\w+)/i);
  return billNumberMatch ? billNumberMatch[1] : '';
}

function extractConsumerName(text) {
  const nameMatch = text.match(/Consumer Name[:\s]+([^\n]+)/i) ||
                   text.match(/Name[:\s]+([^\n]+)/i);
  return nameMatch ? nameMatch[1].trim() : '';
}

function extractAddress(text) {
  const addressMatch = text.match(/Address[:\s]+([^\n]+)/i) ||
                      text.match(/Location[:\s]+([^\n]+)/i);
  return addressMatch ? addressMatch[1].trim() : '';
}

function extractBillingMonth(text) {
  const monthMatch = text.match(/Billing Month[:\s]+([^\n]+)/i) ||
                    text.match(/Bill Month[:\s]+([^\n]+)/i) ||
                    text.match(/For Month[:\s]+([^\n]+)/i);
  return monthMatch ? monthMatch[1].trim() : '';
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`PDF parsing server running on port ${port}`);
});