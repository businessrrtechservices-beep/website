"use client";

import Image from "next/image";
import { Invoice } from "@/lib/salesTypes";
import { formatISTDate } from "@/lib/dateUtils";

interface A4InvoiceViewProps {
  invoice: Invoice;
  showPrintActions?: boolean;
  onPrint?: () => void;
  onClose?: () => void;
}

// Convert numbers to Indian Rupees in words
function numberToWordsINR(num: number): string {
  if (!num || num === 0) return "Zero Rupees Only";

  const a = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen ",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function inWords(n: number): string {
    let str = "";
    if (n > 99) {
      str += a[Math.floor(n / 100)] + "Hundred ";
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : " ");
    } else if (n > 0) {
      str += a[n];
    }
    return str;
  }

  const rounded = Math.round(num);
  let crore = Math.floor(rounded / 10000000);
  let rem = rounded % 10000000;
  let lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  let thousand = Math.floor(rem / 1000);
  rem = rem % 1000;

  let result = "";
  if (crore > 0) result += inWords(crore) + "Crore ";
  if (lakh > 0) result += inWords(lakh) + "Lakh ";
  if (thousand > 0) result += inWords(thousand) + "Thousand ";
  if (rem > 0) result += inWords(rem);

  return `Rupees ${result.trim()} Only`;
}

export default function A4InvoiceView({ invoice }: A4InvoiceViewProps) {
  const isPaid = invoice.paymentStatus === "Paid";
  const isPartial = invoice.paymentStatus === "Partial";

  // Calculate tax breakdown (CGST + SGST if applicable)
  const halfTaxRate = invoice.taxRate ? (invoice.taxRate / 2).toFixed(1) : "0";
  const halfTaxAmount = invoice.taxAmount ? (invoice.taxAmount / 2).toFixed(2) : "0";

  // UPI payment QR generation string
  const upiPayAmount = invoice.balanceDue > 0 ? invoice.balanceDue : invoice.grandTotal;
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=2&data=${encodeURIComponent(
    `upi://pay?pa=naumanpathan98239@ybl&pn=RR%20TECH%20SERVICES&am=${upiPayAmount}&cu=INR&tn=Invoice%20${invoice.invoiceNumber}`
  )}`;

  return (
    <div
      id="printable-invoice"
      className="a4-invoice-page bg-white text-slate-900 mx-auto w-full max-w-[210mm] min-h-[297mm] p-[8mm] sm:p-[10mm] flex flex-col justify-between box-border border border-slate-400 print:border-none print:p-0 print:m-0 print:w-full print:max-w-none print:min-h-0 text-[11px] leading-tight"
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div>
        {/* Top Header - Squared Corporate Border Grid */}
        <div className="border border-slate-900">
          <div className="grid grid-cols-12 divide-x divide-slate-900">
            {/* Left: Company Branding & Details */}
            <div className="col-span-7 p-3 space-y-1">
              <div className="flex items-center gap-2">
                <Image
                  src="/assets/logo.png"
                  alt="RR Tech Services"
                  width={150}
                  height={38}
                  className="h-8 w-auto object-contain"
                  priority
                />
                <div>
                  <h1 className="text-base font-black tracking-tight text-slate-900 uppercase">
                    RR TECH SERVICES
                  </h1>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    IT Hardware &bull; Refurbished Laptops &bull; Chip-Level Repairs
                  </p>
                </div>
              </div>
              <div className="text-[10.5px] text-slate-700 pt-1 space-y-0.5">
                <p>Shop No. 12, Cyber Hub, MG Road, Pune, Maharashtra - 411001</p>
                <p className="flex gap-4">
                  <span>Phone: <strong className="text-slate-900">+91 9209095278</strong></span>
                  <span>Email: <strong className="text-slate-900">business.rrtechservices@gmail.com</strong></span>
                </p>
                <p className="flex gap-4 font-mono text-[10px] text-slate-600 pt-0.5">
                  <span>GSTIN: <strong className="text-slate-900">27ABCDE1234F1Z5</strong></span>
                  <span>PAN: <strong className="text-slate-900">ABCDE1234F</strong></span>
                  <span>State: <strong className="text-slate-900">Maharashtra (27)</strong></span>
                </p>
              </div>
            </div>

            {/* Right: Invoice Metadata Box */}
            <div className="col-span-5 p-3 flex flex-col justify-between bg-slate-50/50">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[12px] font-black uppercase tracking-wider text-slate-900 block">
                    TAX INVOICE
                  </span>
                  <span className="text-[9.5px] text-slate-500 uppercase tracking-wide">
                    Original for Recipient
                  </span>
                </div>
                <div
                  className={`px-2 py-0.5 text-[9.5px] font-black uppercase border ${
                    isPaid
                      ? "bg-emerald-100 text-emerald-900 border-emerald-400"
                      : isPartial
                      ? "bg-amber-100 text-amber-900 border-amber-400"
                      : "bg-rose-100 text-rose-900 border-rose-400"
                  }`}
                >
                  {invoice.paymentStatus}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10.5px] pt-2 border-t border-slate-300 mt-2">
                <div>
                  <span className="text-slate-500 block text-[9.5px] uppercase font-bold">Invoice No:</span>
                  <span className="font-mono font-black text-slate-900 text-xs">{invoice.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9.5px] uppercase font-bold">Dated:</span>
                  <span className="font-semibold text-slate-900">{formatISTDate(invoice.date)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9.5px] uppercase font-bold">Payment Mode:</span>
                  <span className="font-semibold text-slate-900">{invoice.paymentMode || "Cash"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9.5px] uppercase font-bold">Due Date:</span>
                  <span className="font-semibold text-slate-900">
                    {invoice.dueDate ? formatISTDate(invoice.dueDate) : "On Receipt"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Billing Details - Squared Box */}
        <div className="border-x border-b border-slate-900">
          <div className="grid grid-cols-12 divide-x divide-slate-900">
            {/* Bill To */}
            <div className="col-span-7 p-2.5 space-y-0.5">
              <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-500 block">
                Details of Receiver (Billed To):
              </span>
              <div className="font-black text-slate-900 text-xs uppercase">
                {invoice.customer.name}
              </div>
              <div className="text-[10.5px] text-slate-700">
                Phone: <strong className="font-mono text-slate-900">{invoice.customer.phone}</strong>
                {invoice.customer.email && <span className="ml-2">&bull; {invoice.customer.email}</span>}
              </div>
              {invoice.customer.address && (
                <div className="text-[10px] text-slate-600 leading-tight">
                  Address: {invoice.customer.address}
                </div>
              )}
              {invoice.customer.gstin && (
                <div className="text-[10px] font-mono text-slate-700 pt-0.5">
                  Customer GSTIN: <strong className="text-slate-900">{invoice.customer.gstin}</strong>
                </div>
              )}
            </div>

            {/* Place of Supply / Payment Overview */}
            <div className="col-span-5 p-2.5 bg-slate-50/50 flex flex-col justify-between text-[10.5px]">
              <div>
                <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-500 block">
                  Supply &amp; Dispatch Details:
                </span>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-600">Place of Supply:</span>
                  <span className="font-bold text-slate-900">Maharashtra (27)</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-600">Reverse Charge:</span>
                  <span className="font-bold text-slate-900">No</span>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-1 flex justify-between items-baseline">
                <span className="text-slate-600 font-semibold">Total Amount Due:</span>
                <span className={`font-mono font-black text-xs ${invoice.balanceDue > 0 ? "text-rose-700" : "text-emerald-700"}`}>
                  ₹{invoice.balanceDue.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Items Table - Squared Clean Corporate Grid */}
        <div className="border-x border-b border-slate-900">
          <table className="w-full text-left border-collapse text-[10.5px]">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-black uppercase text-[9.5px] tracking-wider border-b border-slate-900 divide-x divide-slate-900">
                <th className="py-2 px-2 text-center w-8">#</th>
                <th className="py-2 px-2.5">Item Description</th>
                <th className="py-2 px-2 text-center w-24">HSN / Code</th>
                <th className="py-2 px-2 text-center w-12">Qty</th>
                <th className="py-2 px-2.5 text-right w-24">Rate (₹)</th>
                <th className="py-2 px-2.5 text-right w-28">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="divide-x divide-slate-300 hover:bg-slate-50/50">
                  <td className="py-2 px-2 text-center font-mono text-slate-500">{idx + 1}</td>
                  <td className="py-2 px-2.5">
                    <div className="font-bold text-slate-900">{item.itemName}</div>
                    {(item.brand || item.model) && (
                      <div className="text-[10px] text-slate-500">
                        {item.brand} {item.model ? `&bull; Model: ${item.model}` : ""}
                      </div>
                    )}
                    {item.serialNumbers && item.serialNumbers.length > 0 && (
                      <div className="text-[9.5px] font-mono text-blue-700 font-medium">
                        S/N: {item.serialNumbers.join(", ")}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center font-mono text-[10px] text-slate-600">
                    {item.itemCode || "8471"}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-slate-900">{item.quantity}</td>
                  <td className="py-2 px-2.5 text-right font-mono text-slate-800">
                    {item.unitPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-900">
                    {item.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}

              {/* Empty placeholder rows if few items for crisp professional height */}
              {invoice.items.length < 3 &&
                Array.from({ length: 3 - invoice.items.length }).map((_, i) => (
                  <tr key={`empty-${i}`} className="divide-x divide-slate-200 h-6">
                    <td className="py-1 px-2 text-center">&nbsp;</td>
                    <td className="py-1 px-2.5">&nbsp;</td>
                    <td className="py-1 px-2">&nbsp;</td>
                    <td className="py-1 px-2">&nbsp;</td>
                    <td className="py-1 px-2.5">&nbsp;</td>
                    <td className="py-1 px-2.5">&nbsp;</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary & Bank Details - Squared Box */}
        <div className="border-x border-b border-slate-900">
          <div className="grid grid-cols-12 divide-x divide-slate-900">
            {/* Left: Amount In Words & Verified Bank/UPI Details */}
            <div className="col-span-7 p-3 flex flex-col justify-between space-y-2.5">
              {/* Words Box */}
              <div>
                <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-500 block mb-0.5">
                  Invoice Amount Chargeable (in words):
                </span>
                <p className="font-bold text-slate-900 text-[11px] italic bg-slate-50 p-1.5 border border-slate-200">
                  {numberToWordsINR(invoice.grandTotal)}
                </p>
              </div>

              {/* Exact Verified Bank Details Box */}
              <div className="border border-slate-300 p-2.5 bg-slate-50/70 flex items-center justify-between gap-2.5">
                <div className="space-y-0.5 text-[10px]">
                  <span className="font-black text-slate-900 uppercase tracking-wider block text-[9.5px] border-b border-slate-200 pb-0.5 mb-1">
                    Bank Transfer &amp; UPI Payment Details
                  </span>
                  <div className="text-slate-800">
                    Account Name: <strong className="font-bold">RR TECH SERVICES</strong>
                  </div>
                  <div className="text-slate-800">
                    Bank: <strong className="font-bold">State Bank of India (SBI)</strong>
                  </div>
                  <div className="text-slate-800">
                    Account Number: <strong className="font-mono font-bold text-slate-900">39739925928</strong>
                  </div>
                  <div className="text-slate-800">
                    IFSC: <strong className="font-mono font-bold text-slate-900">SBIN0018048</strong> &bull; Branch: <strong>Sasane Nagar</strong>
                  </div>
                  <div className="pt-0.5 text-blue-700 font-mono font-bold text-[10.5px]">
                    UPI ID: <span>naumanpathan98239@ybl</span>
                  </div>
                </div>

                {/* Scannable Dynamic QR Code */}
                <div className="text-center p-1 bg-white border border-slate-300 shadow-2xs shrink-0">
                  <img
                    src={upiQrUrl}
                    alt="UPI Scan QR"
                    width={85}
                    height={85}
                    className="w-20 h-20 object-contain mx-auto"
                  />
                  <span className="text-[8px] text-slate-500 font-bold uppercase block mt-0.5">
                    Scan to Pay UPI
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Calculations Grid */}
            <div className="col-span-5 p-3 space-y-1.5 bg-slate-50/40 text-[11px]">
              <div className="flex justify-between text-slate-700">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold text-slate-900">
                  ₹{invoice.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {invoice.discount > 0 && (
                <div className="flex justify-between text-rose-700">
                  <span>Discount:</span>
                  <span className="font-mono font-semibold">
                    -₹{invoice.discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {invoice.taxRate > 0 && (
                <>
                  <div className="flex justify-between text-slate-600 text-[10.5px]">
                    <span>CGST ({halfTaxRate}%):</span>
                    <span className="font-mono text-slate-800">₹{halfTaxAmount}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[10.5px]">
                    <span>SGST ({halfTaxRate}%):</span>
                    <span className="font-mono text-slate-800">₹{halfTaxAmount}</span>
                  </div>
                </>
              )}

              <div className="border-t-2 border-slate-900 pt-1.5 mt-1 flex justify-between text-xs font-black text-slate-900">
                <span className="uppercase">Grand Total:</span>
                <span className="font-mono text-sm text-slate-900">
                  ₹{invoice.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-1 flex justify-between text-[10.5px] text-emerald-800 font-bold">
                <span>Amount Paid:</span>
                <span className="font-mono">
                  ₹{invoice.amountPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-1 flex justify-between text-[11px] font-black">
                <span className="text-slate-800 uppercase">Balance Due:</span>
                <span
                  className={`font-mono ${
                    invoice.balanceDue > 0 ? "text-rose-700 text-xs" : "text-emerald-700"
                  }`}
                >
                  ₹{invoice.balanceDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Terms and Conditions & Authorized Signatory - Squared Box */}
      <div className="mt-3 border border-slate-900">
        <div className="grid grid-cols-12 divide-x divide-slate-900 p-2.5 text-[9.5px] text-slate-700">
          <div className="col-span-8 space-y-0.5 pr-2">
            <span className="font-black text-slate-900 uppercase tracking-wider block text-[9.5px]">
              Terms &amp; Conditions:
            </span>
            <p>1. Warranty on refurbished laptops/hardware strictly per RR Tech invoice terms; physical damage or seal tampering voids warranty.</p>
            <p>2. Goods once verified and delivered cannot be returned without original invoice copy and technical review.</p>
            <p>3. All payment disputes are subject to Pune jurisdiction only.</p>
            {invoice.notes && (
              <p className="text-blue-900 font-semibold pt-0.5">Remark: {invoice.notes}</p>
            )}
          </div>

          <div className="col-span-4 pl-3 flex flex-col justify-between text-right min-h-[58px]">
            <span className="text-[9px] font-black uppercase text-slate-600 block">
              For RR TECH SERVICES
            </span>
            <div className="border-t border-slate-400 pt-1 text-slate-900 font-black text-[10px] uppercase">
              Authorized Signatory
            </div>
          </div>
        </div>

        <div className="bg-slate-100 border-t border-slate-900 px-2.5 py-1 flex justify-between text-[8.5px] text-slate-500 font-mono">
          <span>This is a computer-generated tax invoice.</span>
          <span>RR Tech Services &bull; GSTIN: 27ABCDE1234F1Z5 &bull; Pune Cyber Hub</span>
        </div>
      </div>
    </div>
  );
}
