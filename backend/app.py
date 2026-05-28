import os
import json
import base64
import uuid
import requests
import random
import time
from io import BytesIO
from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
import gspread
from google.oauth2.service_account import Credentials
from dotenv import load_dotenv

# Load dotenv relative to app.py directory to support launching from workspace root
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

app = Flask(__name__)
CORS(app)

def send_email_via_brevo(recipient_email, recipient_name, subject, html_content, attachment=None):
    api_key = os.getenv("BREVO_API_KEY")
    sender_email = os.getenv("BREVO_SENDER_EMAIL")
    sender_name = os.getenv("BREVO_SENDER_NAME", "Eden Spot Homestay")
    
    if not api_key or not sender_email:
        print("Brevo API key or Sender Email not configured in environment variables.")
        return False
        
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "api-key": api_key,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    payload = {
        "sender": {
            "name": sender_name,
            "email": sender_email
        },
        "to": [
            {
                "email": recipient_email,
                "name": recipient_name
            }
        ],
        "subject": subject,
        "htmlContent": html_content
    }
    if attachment:
        payload["attachment"] = [attachment]
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code in [200, 201, 202]:
            print(f"Email successfully sent to {recipient_email}")
            return True
        else:
            print(f"Failed to send email via Brevo. Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print(f"Error calling Brevo API: {e}")
        return False

def send_booking_request_email_to_handler(booking):
    handler_email = os.getenv("HANDLER_EMAIL")
    if not handler_email:
        print("HANDLER_EMAIL is not set in backend settings.")
        return
        
    booking_id = booking.get('id', 'N/A')
    guest_name = booking.get('guestName', 'N/A')
    email = booking.get('email', 'N/A')
    phone = booking.get('phone', 'N/A')
    room_name = booking.get('roomName', 'N/A')
    check_in = booking.get('checkIn', 'N/A')
    check_out = booking.get('checkOut', 'N/A')
    guests = booking.get('guests', 'N/A')
    food = booking.get('food', 'None')
    sightseeing = booking.get('sightseeing', 'None')
    special_requests = booking.get('specialRequests', 'None')
    total_amount = booking.get('totalAmount', 0)
    
    subject = f"🔔 New Booking Request Received: {booking_id}"
    
    try:
        formatted_total = f"{int(total_amount):,}"
    except Exception:
        formatted_total = str(total_amount)
        
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>New Booking Request</title>
        <style>
            body {{
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                color: #1a1e26;
                background-color: #fcfcfd;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                border: 1px solid #f1f2f4;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            }}
            .header {{
                background-color: #0b1528;
                padding: 30px 20px;
                text-align: center;
                border-bottom: 2px solid #c5a880;
            }}
            .header h1 {{
                color: #ffffff;
                font-size: 20px;
                margin: 0;
                text-transform: uppercase;
                letter-spacing: 2px;
            }}
            .header p {{
                color: #c5a880;
                font-size: 11px;
                margin: 5px 0 0 0;
                text-transform: uppercase;
                letter-spacing: 1px;
            }}
            .content {{
                padding: 30px;
            }}
            .section {{
                margin-bottom: 25px;
                border-bottom: 1px solid #f1f2f4;
                padding-bottom: 15px;
            }}
            .section:last-child {{
                border-bottom: none;
                padding-bottom: 0;
            }}
            .section-title {{
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
                color: #c5a880;
                margin-bottom: 12px;
                letter-spacing: 1px;
            }}
            .grid {{
                display: table;
                width: 100%;
            }}
            .row {{
                display: table-row;
            }}
            .label {{
                display: table-cell;
                width: 40%;
                font-size: 12px;
                color: #8c93a3;
                padding: 6px 0;
                vertical-align: top;
            }}
            .value {{
                display: table-cell;
                width: 60%;
                font-size: 12px;
                font-weight: bold;
                color: #0b1528;
                padding: 6px 0;
                vertical-align: top;
            }}
            .amount-box {{
                background-color: #f9fafb;
                border: 1px dashed #c5a880;
                border-radius: 8px;
                padding: 15px;
                text-align: center;
                margin-top: 20px;
            }}
            .amount-val {{
                font-size: 22px;
                color: #c5a880;
                font-weight: bold;
            }}
            .btn-container {{
                text-align: center;
                margin-top: 30px;
            }}
            .btn {{
                background-color: #0b1528;
                color: #ffffff !important;
                text-decoration: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 1px;
                display: inline-block;
                border: 1px solid #c5a880;
            }}
            .footer {{
                background-color: #f9fafb;
                padding: 20px;
                text-align: center;
                font-size: 10px;
                color: #a0a6b5;
                border-top: 1px solid #f1f2f4;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                 <h1>Eden Spot Homestay</h1>
                <p>New Booking Request</p>
            </div>
            
            <div class="content">
                <div class="section">
                    <div class="section-title">Customer Information</div>
                    <div class="grid">
                        <div class="row">
                            <div class="label">Guest Name:</div>
                            <div class="value">{guest_name}</div>
                        </div>
                        <div class="row">
                            <div class="label">Email:</div>
                            <div class="value">{email}</div>
                        </div>
                        <div class="row">
                            <div class="label">Phone:</div>
                            <div class="value">{phone}</div>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">Room & Dates</div>
                    <div class="grid">
                        <div class="row">
                            <div class="label">Room Category:</div>
                            <div class="value">{room_name}</div>
                        </div>
                        <div class="row">
                            <div class="label">Check-In:</div>
                            <div class="value">{check_in}</div>
                        </div>
                        <div class="row">
                            <div class="label">Check-Out:</div>
                            <div class="value">{check_out}</div>
                        </div>
                        <div class="row">
                            <div class="label">Guests:</div>
                            <div class="value">{guests}</div>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">Customizations</div>
                    <div class="grid">
                        <div class="row">
                            <div class="label">Meal Preferences:</div>
                            <div class="value">{food}</div>
                        </div>
                        <div class="row">
                            <div class="label">Jeep Tour Package:</div>
                            <div class="value">{sightseeing}</div>
                        </div>
                        <div class="row">
                            <div class="label">Special Requests:</div>
                            <div class="value">{special_requests}</div>
                        </div>
                    </div>
                </div>
                
                <div class="amount-box">
                    <div style="font-size: 11px; text-transform: uppercase; color: #8c93a3; margin-bottom: 5px;">Estimated Total Amount</div>
                    <div class="amount-val">₹{formatted_total}</div>
                </div>
                
                <div class="btn-container">
                    <a href="http://localhost:5173/" class="btn">Open Admin Dashboard</a>
                </div>
            </div>
            
            <div class="footer">
                This is an automated notification. Please review the booking in the admin portal to confirm or reject it.
            </div>
        </div>
    </body>
    </html>
    """
    
    send_email_via_brevo(handler_email, "Resort Handler", subject, html_content)

def generate_voucher_html(booking):
    """Generate the booking voucher HTML for both PDF generation and email attachment."""
    booking_id = booking.get('id', 'N/A')
    guest_name = booking.get('guestName', 'N/A')
    room_name = booking.get('roomName', 'N/A')
    check_in = booking.get('checkIn', 'N/A')
    check_out = booking.get('checkOut', 'N/A')
    guests = booking.get('guests', 'N/A')
    customer_email = booking.get('email', 'N/A')
    phone = booking.get('phone', 'N/A')
    total_amount = booking.get('totalAmount', 0)
    special_requests = booking.get('specialRequests', '')
    rate = float(booking.get('gstRate') or 12)
    
    bill = parse_booking_bill(special_requests)
    
    try:
        from datetime import datetime
        d1 = datetime.strptime(str(check_in).strip(), "%Y-%m-%d")
        d2 = datetime.strptime(str(check_out).strip(), "%Y-%m-%d")
        nights = max(1, (d2 - d1).days)
    except Exception:
        nights = 1

    bill_rows_html = ""
    subtotal = 0
    tax = 0
    total = 0
    discount = 0
    
    if bill:
        room_cost = bill.get('roomCost', 0)
        food_cost = bill.get('foodCost', 0)
        sightseeing_cost = bill.get('sightseeingCost', 0)
        discount = bill.get('discount', 0)
        extras = bill.get('extras', [])
        subtotal = bill.get('subtotal', 0)
        tax = bill.get('luxuryTax', 0)
        total = bill.get('total', 0)
        
        bill_rows_html += f"""
        <tr>
            <td style="padding: 4px 6px; border-bottom: 1px solid #e2e8f0; font-size: 9px; line-height: 1.2;">
                <strong>Room Stay ({room_name})</strong><br/>
                <small style="color: #64748b; font-size: 8px;">₹{int(bill.get('roomRate', 0)):,} x {bill.get('nights', nights)} nights x {bill.get('rooms', 1)} room</small>
            </td>
            <td style="padding: 4px 6px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0b1528; font-size: 9.5px; vertical-align: middle;">
                ₹{int(room_cost):,}
            </td>
        </tr>
        """
        
        if food_cost > 0:
            bill_rows_html += f"""
            <tr>
                <td style="padding: 4px 6px; border-bottom: 1px solid #e2e8f0; font-size: 9px; line-height: 1.2;">
                    <strong>Meal / Food Packages</strong><br/>
                    <small style="color: #64748b; font-size: 8px;">{booking.get('food', 'Custom plans')}</small>
                </td>
                <td style="padding: 4px 6px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0b1528; font-size: 9.5px; vertical-align: middle;">
                    ₹{int(food_cost):,}
                </td>
            </tr>
            """
            
        if sightseeing_cost > 0:
            bill_rows_html += f"""
            <tr>
                <td style="padding: 4px 6px; border-bottom: 1px solid #e2e8f0; font-size: 9px; line-height: 1.2;">
                    <strong>Kerala Jeep Tour Package</strong><br/>
                    <small style="color: #64748b; font-size: 8px;">{booking.get('sightseeing', 'Excursions')}</small>
                </td>
                <td style="padding: 4px 6px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0b1528; font-size: 9.5px; vertical-align: middle;">
                    ₹{int(sightseeing_cost):,}
                </td>
            </tr>
            """
            
        for extra in extras:
            extra_name = extra.get('name', 'Extra Item')
            extra_price = extra.get('price', 0)
            bill_rows_html += f"""
            <tr>
                <td style="padding: 4px 6px; border-bottom: 1px solid #e2e8f0; font-size: 9px; line-height: 1.2;">
                    <strong>{extra_name}</strong><br/>
                    <small style="color: #64748b; font-size: 8px;">Custom Addition / Incidentals</small>
                </td>
                <td style="padding: 4px 6px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0b1528; font-size: 9.5px; vertical-align: middle;">
                    ₹{int(extra_price):,}
                </td>
            </tr>
            """
    else:
        try:
            subtotal = int(total_amount) / (1 + rate / 100)
            tax = subtotal * (rate / 100)
            total = int(total_amount)
        except Exception:
            subtotal = 0
            tax = 0
            total = 0
        bill_rows_html += f"""
        <tr>
            <td style="padding: 4px 6px; border-bottom: 1px solid #e2e8f0; font-size: 9px; line-height: 1.2;">
                <strong>Room Stay & Services ({room_name})</strong><br/>
                <small style="color: #64748b; font-size: 8px;">{guests} · {check_in} to {check_out}</small>
            </td>
            <td style="padding: 4px 6px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0b1528; font-size: 9.5px; vertical-align: middle;">
                ₹{int(subtotal):,}
            </td>
        </tr>
        """
        
    discount_row_html = ""
    if discount > 0:
        discount_row_html = f"""
        <tr style="color: #10b981;">
            <td style="padding: 4px 6px; border-bottom: 1px solid #e2e8f0; font-size: 9px;">
                <strong>Discount Applied</strong>
            </td>
            <td style="padding: 4px 6px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; font-size: 9.5px;">
                -₹{int(discount):,}
            </td>
        </tr>
        """

    voucher_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Eden Spot Booking Voucher</title>
        <style>
            @page {{
                size: a4;
                margin: 4mm 6mm;
            }}
            body {{
                font-family: Helvetica, Arial, sans-serif;
                color: #1a1e26;
                background-color: #ffffff;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 650px;
                margin: 0 auto;
                background: #ffffff;
                border: 1px solid #e2e8f0;
                overflow: hidden;
            }}
            .header-banner-table {{
                width: 100%;
                background-color: #0b1528;
                border-bottom: 3px solid #c5a880;
                color: #ffffff;
                padding: 10px 15px;
            }}
            .brand-logo {{
                font-family: Georgia, serif;
                color: #ffffff;
                font-size: 16px;
                font-weight: 800;
                letter-spacing: 1.5px;
                text-transform: uppercase;
                margin: 0;
            }}
            .brand-sub {{
                color: #c5a880;
                font-size: 7.5px;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                margin-top: 1px;
            }}
            .voucher-title-h2 {{
                font-size: 11px;
                margin: 0;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                color: #c5a880;
            }}
            .voucher-title-p {{
                font-size: 8.5px;
                color: #a0a6b5;
                margin: 2px 0 0 0;
            }}
            .content {{
                padding: 8px 12px;
            }}
            .property-card {{
                border: 1px solid #e2e8f0;
                padding: 8px 10px;
                margin-bottom: 6px;
                background: #fafafb;
            }}
            .property-name {{
                font-family: Georgia, serif;
                font-size: 13px;
                font-weight: bold;
                color: #0b1528;
                margin: 0 0 2px 0;
            }}
            .property-details {{
                font-size: 8.5px;
                color: #64748b;
                line-height: 1.3;
            }}
            .stamp-confirmed {{
                border: 1.5px dashed #10b981;
                color: #10b981;
                padding: 2px 5px;
                font-size: 7.5px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                background-color: #f0fdf4;
            }}
            .info-table {{
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 6px;
            }}
            .info-table td {{
                padding: 4px 6px;
                border: 1px solid #e2e8f0;
                vertical-align: top;
                width: 50%;
            }}
            .section-title {{
                font-size: 8px;
                font-weight: bold;
                color: #c5a880;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 2px;
            }}
            .info-value {{
                font-size: 9.5px;
                color: #0b1528;
                font-weight: bold;
                line-height: 1.2;
            }}
            .info-sub {{
                font-size: 8px;
                color: #64748b;
                font-weight: normal;
                margin-top: 1px;
            }}
            .billing-table {{
                width: 100%;
                border-collapse: collapse;
                margin-top: 2px;
            }}
            .billing-total {{
                background-color: #fafafb;
                border-top: 1px solid #e2e8f0;
            }}
            .important-info {{
                background-color: #f8fafc;
                border-left: 3px solid #c5a880;
                padding: 6px 10px;
                font-size: 8.5px;
                color: #475569;
                line-height: 1.35;
                margin-top: 6px;
            }}
            .important-info h4 {{
                margin: 0 0 2px 0;
                text-transform: uppercase;
                color: #0b1528;
                font-size: 8.5px;
                letter-spacing: 0.5px;
            }}
            .important-info ul {{
                margin: 0;
                padding-left: 10px;
            }}
            .footer-info {{
                background-color: #0b1528;
                padding: 8px;
                text-align: center;
                font-size: 8px;
                color: #8c93a3;
                border-top: 1px solid #e2e8f0;
            }}
            .footer-info a {{
                color: #c5a880;
                text-decoration: none;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <table class="header-banner-table">
                <tr>
                    <td style="width: 55%; vertical-align: middle; border: none; padding: 0; background-color: #0b1528;">
                        <h1 class="brand-logo">Eden Spot Homestay</h1>
                        <div class="brand-sub">Just a Peaceful home away from Home</div>
                    </td>
                    <td style="width: 45%; text-align: right; vertical-align: middle; border: none; padding: 0; background-color: #0b1528;">
                        <h2 class="voucher-title-h2">Booking Voucher</h2>
                        <p class="voucher-title-p">Booking ID: <strong style="color: #ffffff; font-family: monospace;">{booking_id}</strong></p>
                        <p class="voucher-title-p">PNR: <strong style="color: #ffffff; font-family: monospace;">PNR-{booking_id.replace('B-', '')}</strong></p>
                    </td>
                </tr>
            </table>
            
            <div class="content">
                <div class="property-card">
                    <table style="width: 100%; border: none; padding: 0; background-color: transparent;">
                        <tr>
                            <td style="width: 75%; vertical-align: top; border: none; padding: 0;">
                                <h3 class="property-name">{room_name}</h3>
                                <div class="property-details">
                                    The House of Shalom, Puthachivayal, Marayoor, Idukki, Kerala 685620<br/>
                                    +91 94462 20966, +91 94469 33963 | edenspot.homestay@gmail.com
                                </div>
                            </td>
                            <td style="width: 25%; vertical-align: middle; text-align: right; border: none; padding: 0;">
                                <span class="stamp-confirmed">Thank You Confirmed</span>
                            </td>
                        </tr>
                    </table>
                </div>
                
                <table class="info-table">
                    <tr>
                        <td>
                            <div class="section-title">Stay Duration ({nights} Nights)</div>
                            <div class="info-value">
                                Check-in: {check_in}<br/>
                                <span class="info-sub">After 12:00 PM</span>
                            </div>
                            <div class="info-value" style="margin-top: 4px;">
                                Check-out: {check_out}<br/>
                                <span class="info-sub">Before 11:00 AM</span>
                            </div>
                        </td>
                        <td>
                            <div class="section-title">Guest Information</div>
                            <div class="info-value">{guest_name}</div>
                            <div class="info-sub" style="line-height: 1.3; margin-top: 2px;">
                                Email: {customer_email}<br/>
                                Phone: {phone}<br/>
                                Guests: {guests}
                            </div>
                        </td>
                    </tr>
                </table>
                
                <div class="section-title">Invoice & Itemized Billing</div>
                <table class="billing-table">
                    <thead>
                        <tr style="background-color: #fafafb; border-bottom: 2px solid #e2e8f0; font-size: 8px; font-weight: bold; text-transform: uppercase; color: #64748b; text-align: left;">
                            <th style="padding: 4px 6px;">Description</th>
                            <th style="padding: 4px 6px; text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody style="font-size: 9px; color: #334155;">
                        {bill_rows_html}
                        {discount_row_html}
                        
                        <tr class="billing-total">
                            <td style="padding: 4px 6px; font-weight: bold; color: #0b1528;">Subtotal</td>
                            <td style="padding: 4px 6px; font-weight: bold; text-align: right; color: #0b1528;">₹{int(subtotal):,}</td>
                        </tr>
                        <tr class="billing-total">
                            <td style="padding: 4px 6px; font-weight: bold; color: #64748b; font-size: 8.5px;">Luxury GST Tax ({int(rate) if rate.is_integer() else rate}%)</td>
                            <td style="padding: 4px 6px; font-weight: bold; text-align: right; color: #64748b; font-size: 8.5px;">₹{int(tax):,}</td>
                        </tr>
                        <tr class="billing-total" style="border-top: 2px double #c5a880;">
                            <td style="padding: 5px 6px; font-weight: bold; color: #0b1528; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.5px;">Grand Total</td>
                            <td style="padding: 5px 6px; font-weight: bold; text-align: right; color: #c5a880; font-size: 13px; font-family: Georgia, serif;">₹{int(total):,}</td>
                        </tr>
                    </tbody>
                </table>
                
                <p style="font-size: 8px; color: #64748b; font-style: italic; margin-top: 6px; text-align: center; margin-bottom: 2px;">
                    * The booking is confirmed. Balance or outstanding amounts are payable at check-out.
                </p>
                
                <div class="important-info">
                    <h4>Important Information</h4>
                    <ul>
                        <li>Government approved photo ID card is mandatory for all guests during check-in.</li>
                        <li>Detailed GST invoice receipts can be requested at the reception counter during check-out.</li>
                        <li>Free cancellation up to 48 hours before check-in date.</li>
                    </ul>
                </div>
            </div>
            
            <div class="footer-info">
                <p style="margin: 0 0 2px 0;">Eden Spot Homestay, Marayoor, Idukki, Kerala, India</p>
                <p style="margin: 0;">Need support? Contact us 24/7: <a href="mailto:edenspot.homestay@gmail.com">edenspot.homestay@gmail.com</a> | +91 94462 20966, +91 94469 33963</p>
            </div>
        </div>
    </body>
    </html>
    """
    return voucher_html

def generate_voucher_pdf(booking):
    """Generate a PDF from the booking voucher HTML using xhtml2pdf."""
    try:
        from xhtml2pdf import pisa
        voucher_html = generate_voucher_html(booking)
        pdf_buffer = BytesIO()
        pisa_status = pisa.CreatePDF(voucher_html, dest=pdf_buffer)
        if pisa_status.err:
            print(f"Error generating PDF: {pisa_status.err}")
            return None
        pdf_buffer.seek(0)
        return pdf_buffer.getvalue()
    except Exception as e:
        print(f"Error generating voucher PDF: {e}")
        return None

def send_booking_confirm_email_to_customer(booking):
    customer_email = booking.get('email')
    if not customer_email:
        print("Customer email not found in booking details.")
        return
        
    booking_id = booking.get('id', 'N/A')
    guest_name = booking.get('guestName', 'N/A')
    room_name = booking.get('roomName', 'N/A')
    check_in = booking.get('checkIn', 'N/A')
    check_out = booking.get('checkOut', 'N/A')
    guests = booking.get('guests', 'N/A')
    total_amount = booking.get('totalAmount', 0)
    
    subject = f"Booking Confirmed! Eden Spot Homestay - ID: {booking_id}"
    
    try:
        formatted_total = f"{int(total_amount):,}"
    except Exception:
        formatted_total = str(total_amount)
        
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Booking Confirmation</title>
        <style>
            body {{
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                color: #1a1e26;
                background-color: #fcfcfd;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                border: 1px solid #f1f2f4;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            }}
            .header {{
                background-color: #0b1528;
                padding: 30px 20px;
                text-align: center;
                border-bottom: 2px solid #c5a880;
            }}
            .header h1 {{
                color: #ffffff;
                font-size: 20px;
                margin: 0;
                text-transform: uppercase;
                letter-spacing: 2px;
            }}
            .header p {{
                color: #c5a880;
                font-size: 11px;
                margin: 5px 0 0 0;
                text-transform: uppercase;
                letter-spacing: 1px;
            }}
            .content {{
                padding: 30px;
            }}
            .welcome-msg {{
                text-align: center;
                margin-bottom: 30px;
            }}
            .welcome-msg h2 {{
                font-size: 18px;
                color: #0b1528;
                margin-top: 0;
            }}
            .welcome-msg p {{
                font-size: 13px;
                color: #5a606f;
                line-height: 1.5;
            }}
            .section {{
                margin-bottom: 25px;
                border-bottom: 1px solid #f1f2f4;
                padding-bottom: 15px;
            }}
            .section:last-child {{
                border-bottom: none;
                padding-bottom: 0;
            }}
            .section-title {{
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
                color: #c5a880;
                margin-bottom: 12px;
                letter-spacing: 1px;
            }}
            .grid {{
                display: table;
                width: 100%;
            }}
            .row {{
                display: table-row;
            }}
            .label {{
                display: table-cell;
                width: 40%;
                font-size: 12px;
                color: #8c93a3;
                padding: 6px 0;
                vertical-align: top;
            }}
            .value {{
                display: table-cell;
                width: 60%;
                font-size: 12px;
                font-weight: bold;
                color: #0b1528;
                padding: 6px 0;
                vertical-align: top;
            }}
            .amount-box {{
                background-color: #f9fafb;
                border: 1px solid #e1e3e6;
                border-radius: 8px;
                padding: 15px;
                text-align: center;
                margin-top: 20px;
            }}
            .amount-val {{
                font-size: 22px;
                color: #0b1528;
                font-weight: bold;
            }}
            .footer {{
                background-color: #0b1528;
                padding: 30px;
                text-align: center;
                font-size: 11px;
                color: #8c93a3;
                border-top: 1px solid #f1f2f4;
            }}
            .footer p {{
                margin: 5px 0;
            }}
            .footer a {{
                color: #c5a880;
                text-decoration: none;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                 <h1>Eden Spot Homestay</h1>
                <p>Booking Confirmation</p>
            </div>
            
            <div class="content">
                <div class="welcome-msg">
                    <h2>Your reservation is confirmed!</h2>
                    <p>Dear {guest_name}, your booking has been confirmed for the dates <strong>{check_in}</strong> to <strong>{check_out}</strong> at <strong>{room_name}</strong>, Eden Spot Homestay.</p>
                    <p>Your booking voucher with complete details including itemized billing is attached as a PDF with this email. Please keep it for your records and present it during check-in.</p>
                </div>
                
                <div class="section">
                    <div class="section-title">Reservation Summary</div>
                    <div class="grid">
                        <div class="row">
                            <div class="label">Booking ID:</div>
                            <div class="value" style="font-family: monospace; font-size: 13px; color: #c5a880;">{booking_id}</div>
                        </div>
                        <div class="row">
                            <div class="label">Room Category:</div>
                            <div class="value">{room_name}</div>
                        </div>
                        <div class="row">
                            <div class="label">Check-In Date:</div>
                            <div class="value">{check_in}</div>
                        </div>
                        <div class="row">
                            <div class="label">Check-Out Date:</div>
                            <div class="value">{check_out}</div>
                        </div>
                        <div class="row">
                            <div class="label">Guests:</div>
                            <div class="value">{guests}</div>
                        </div>
                    </div>
                </div>
                
                <div class="amount-box">
                    <div style="font-size: 11px; text-transform: uppercase; color: #8c93a3; margin-bottom: 5px;">Total Billed Amount</div>
                    <div class="amount-val">₹{formatted_total}</div>
                    <div style="font-size: 10px; color: #10b981; font-weight: bold; margin-top: 5px;">✓ Booking Confirmed</div>
                </div>
                
                <div style="background-color: #f8fafc; border-left: 4px solid #c5a880; padding: 12px 16px; margin-top: 20px; font-size: 11px; color: #475569; line-height: 1.5;">
                    <strong style="color: #0b1528;">📎 Attached:</strong> Your booking voucher PDF with complete itemized billing, stay details, and important information.
                </div>
            </div>
            
            <div class="footer">
                <p>Eden Spot Homestay, Marayoor, Idukki, Kerala, India</p>
                <p>Need help? Contact us: <a href="mailto:edenspot.homestay@gmail.com">edenspot.homestay@gmail.com</a></p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Generate the PDF voucher attachment
    attachment = None
    pdf_bytes = generate_voucher_pdf(booking)
    if pdf_bytes:
        pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')
        attachment = {
            "content": pdf_base64,
            "name": f"Booking_Voucher_{booking_id}.pdf"
        }
        print(f"PDF voucher generated successfully for booking {booking_id}")
    else:
        print(f"Warning: Could not generate PDF voucher for booking {booking_id}, sending email without attachment.")
    
    send_email_via_brevo(customer_email, guest_name, subject, html_content, attachment=attachment)

def send_checkout_feedback_email(booking):
    customer_email = booking.get('email')
    if not customer_email:
        print("Customer email not found in booking details.")
        return
        
    booking_id = booking.get('id', 'N/A')
    guest_name = booking.get('guestName', 'N/A')
    
    subject = f"Thank you for visiting Eden Spot Homestay! Please share your experience."
    
    feedback_url = f"http://localhost:5173/?view=feedback&bookingId={booking_id}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Thank You & Feedback Request</title>
        <style>
            body {{
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                color: #1a1e26;
                background-color: #fcfcfd;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 40px auto;
                background: #ffffff;
                border: 1px solid #f1f2f4;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            }}
            .header {{
                background-color: #0b1528;
                padding: 40px 20px;
                text-align: center;
                border-bottom: 2px solid #c5a880;
            }}
            .header h1 {{
                color: #ffffff;
                font-size: 24px;
                margin: 0;
                text-transform: uppercase;
                letter-spacing: 2px;
                font-weight: 300;
            }}
            .header p {{
                color: #c5a880;
                font-size: 11px;
                margin: 5px 0 0 0;
                text-transform: uppercase;
                letter-spacing: 1.5px;
            }}
            .content {{
                padding: 40px;
                text-align: center;
            }}
            .content h2 {{
                color: #0b1528;
                font-size: 18px;
                margin-top: 0;
                margin-bottom: 15px;
            }}
            .content p {{
                color: #4a5468;
                font-size: 14px;
                line-height: 1.6;
                margin-bottom: 30px;
            }}
            .button {{
                display: inline-block;
                background-color: #0b1528;
                color: #ffffff !important;
                text-decoration: none;
                padding: 14px 28px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 1px;
                border-radius: 8px;
                border: 1px solid #c5a880;
                box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            }}
            .footer {{
                background-color: #f9fafb;
                padding: 20px;
                text-align: center;
                border-top: 1px solid #f1f2f4;
                font-size: 11px;
                color: #8c93a3;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Eden Spot</h1>
                <p>Homestay • Marayoor</p>
            </div>
            <div class="content">
                <h2>Dear {guest_name},</h2>
                <p>Thank you for choosing Eden Spot Homestay for your stay in Marayoor, Kerala. It was our absolute pleasure hosting you!</p>
                <p>We strive to make every guest experience memorable, and we would love to hear your feedback. Please take a moment to share your stay experience with us by clicking the button below.</p>
                <a href="{feedback_url}" class="button" style="color: #ffffff !important;">Share Your Experience</a>
            </div>
            <div class="footer">
                <p>Eden Spot Homestay, Marayoor, Idukki, Kerala, India</p>
                <p>Need support? Contact us: edenspot.homestay@gmail.com</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    send_email_via_brevo(customer_email, guest_name, subject, html_content)

def parse_booking_bill(special_requests_str):
    if not special_requests_str:
        return None
    parts = str(special_requests_str).split('||BILL_JSON||')
    if len(parts) < 2:
        return None
    try:
        return json.loads(parts[1].strip())
    except Exception as e:
        print(f"Failed to parse bill JSON in python: {e}")
        return None

def send_final_bill_email_to_customer(booking):
    customer_email = booking.get('email')
    if not customer_email:
        print("Customer email not found in booking details.")
        return False
        
    booking_id = booking.get('id', 'N/A')
    guest_name = booking.get('guestName', 'N/A')
    room_name = booking.get('roomName', 'N/A')
    check_in = booking.get('checkIn', 'N/A')
    check_out = booking.get('checkOut', 'N/A')
    guests = booking.get('guests', 'N/A')
    total_amount = booking.get('totalAmount', 0)
    phone = booking.get('phone', 'N/A')
    special_requests = booking.get('specialRequests', '')
    rate = float(booking.get('gstRate') or 12)
    
    bill = parse_booking_bill(special_requests)
    
    # Calculate nights count for summary display
    try:
        from datetime import datetime
        d1 = datetime.strptime(str(check_in).strip(), "%Y-%m-%d")
        d2 = datetime.strptime(str(check_out).strip(), "%Y-%m-%d")
        nights = max(1, (d2 - d1).days)
    except Exception:
        nights = 1

    subject = f"🧾 Final Bill Invoice - Eden Spot Homestay - ID: {booking_id}"
    
    # Generate itemized bill rows
    bill_rows_html = ""
    subtotal = 0
    tax = 0
    total = 0
    discount = 0
    
    if bill:
        room_cost = bill.get('roomCost', 0)
        food_cost = bill.get('foodCost', 0)
        sightseeing_cost = bill.get('sightseeingCost', 0)
        discount = bill.get('discount', 0)
        extras = bill.get('extras', [])
        subtotal = bill.get('subtotal', 0)
        tax = bill.get('luxuryTax', 0)
        total = bill.get('total', 0)
        
        bill_rows_html += f"""
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
                <strong>Room Stay ({room_name})</strong><br/>
                <small style="color: #64748b;">₹{int(bill.get('roomRate', 0)):,} x {bill.get('nights', nights)} nights x {bill.get('rooms', 1)} room</small>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0b1528;">
                ₹{int(room_cost):,}
            </td>
        </tr>
        """
        
        if food_cost > 0:
            bill_rows_html += f"""
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
                    <strong>Meal / Food Packages</strong><br/>
                    <small style="color: #64748b;">{booking.get('food', 'Custom plans')}</small>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0b1528;">
                    ₹{int(food_cost):,}
                </td>
            </tr>
            """
            
        if sightseeing_cost > 0:
            bill_rows_html += f"""
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
                    <strong>Kerala Jeep Tour Package</strong><br/>
                    <small style="color: #64748b;">{booking.get('sightseeing', 'Excursions')}</small>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0b1528;">
                    ₹{int(sightseeing_cost):,}
                </td>
            </tr>
            """
            
        for extra in extras:
            extra_name = extra.get('name', 'Extra Item')
            extra_price = extra.get('price', 0)
            bill_rows_html += f"""
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
                    <strong>➕ {extra_name}</strong><br/>
                    <small style="color: #64748b;">Custom Addition / Incidentals</small>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0b1528;">
                    ₹{int(extra_price):,}
                </td>
            </tr>
            """
    else:
        # Fallback if no bill breakdown was saved
        try:
            subtotal = int(total_amount) / (1 + rate / 100)
            tax = subtotal * (rate / 100)
            total = int(total_amount)
        except Exception:
            subtotal = 0
            tax = 0
            total = 0
        bill_rows_html += f"""
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
                <strong>Room Stay & Services ({room_name})</strong><br/>
                <small style="color: #64748b;">{guests} · {check_in} to {check_out}</small>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0b1528;">
                ₹{int(subtotal):,}
            </td>
        </tr>
        """
        
    discount_row_html = ""
    if discount > 0:
        discount_row_html = f"""
        <tr style="color: #10b981;">
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
                <strong>Discount Applied</strong>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">
                -₹{int(discount):,}
            </td>
        </tr>
        """
        
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Eden Spot Booking Voucher</title>
        <style>
            body {{
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                color: #1a1e26;
                background-color: #f4f6f9;
                margin: 0;
                padding: 20px;
            }}
            .container {{
                max-width: 650px;
                margin: 0 auto;
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 25px rgba(0,0,0,0.05);
            }}
            .header-banner {{
                display: flex;
                justify-content: space-between;
                align-items: center;
                background-color: #0b1528;
                padding: 24px 30px;
                border-bottom: 3px solid #c5a880;
            }}
            .brand-logo {{
                font-family: Georgia, serif;
                color: #ffffff;
                font-size: 20px;
                font-weight: 800;
                letter-spacing: 2px;
                text-transform: uppercase;
                margin: 0;
            }}
            .brand-sub {{
                color: #c5a880;
                font-size: 9px;
                letter-spacing: 1px;
                text-transform: uppercase;
                margin-top: 2px;
            }}
            .voucher-title {{
                color: #ffffff;
                text-align: right;
            }}
            .voucher-title h2 {{
                font-size: 16px;
                margin: 0;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: #c5a880;
            }}
            .voucher-title p {{
                font-size: 11px;
                color: #a0a6b5;
                margin: 4px 0 0 0;
            }}
            .content {{
                padding: 30px;
            }}
            .property-card {{
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 25px;
                background: #fafafb;
                position: relative;
            }}
            .property-name {{
                font-family: Georgia, serif;
                font-size: 18px;
                font-weight: bold;
                color: #0b1528;
                margin: 0 0 8px 0;
            }}
            .property-details {{
                font-size: 11px;
                color: #64748b;
                line-height: 1.5;
            }}
            .stamp-confirmed {{
                position: absolute;
                top: 20px;
                right: 20px;
                border: 2px dashed #10b981;
                color: #10b981;
                border-radius: 8px;
                padding: 6px 12px;
                font-size: 10px;
                font-weight: bold;
                text-transform: uppercase;
                transform: rotate(5deg);
                letter-spacing: 1px;
            }}
            .grid-table {{
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 25px;
            }}
            .grid-table td {{
                padding: 15px;
                border: 1px solid #e2e8f0;
                vertical-align: top;
                width: 50%;
            }}
            .grid-title {{
                font-size: 10px;
                font-weight: bold;
                color: #c5a880;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 8px;
            }}
            .grid-value {{
                font-size: 12px;
                color: #0b1528;
                font-weight: bold;
                line-height: 1.4;
            }}
            .grid-sub {{
                font-size: 11px;
                color: #64748b;
                font-weight: normal;
                margin-top: 4px;
            }}
            .billing-table {{
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
            }}
            .billing-total {{
                background-color: #fafafb;
                border-top: 2px solid #e2e8f0;
            }}
            .important-info {{
                background-color: #f8fafc;
                border-left: 4px solid #c5a880;
                padding: 15px 20px;
                border-radius: 0 12px 12px 0;
                font-size: 11px;
                color: #475569;
                line-height: 1.6;
                margin-top: 25px;
            }}
            .important-info h4 {{
                margin: 0 0 6px 0;
                text-transform: uppercase;
                color: #0b1528;
                font-size: 12px;
                letter-spacing: 0.5px;
            }}
            .important-info ul {{
                margin: 0;
                padding-left: 15px;
            }}
            .footer-info {{
                background-color: #0b1528;
                padding: 20px;
                text-align: center;
                font-size: 10px;
                color: #8c93a3;
                border-top: 1px solid #e2e8f0;
            }}
            .footer-info a {{
                color: #c5a880;
                text-decoration: none;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header-banner">
                <div>
                    <h1 class="brand-logo">Eden Spot Homestay</h1>
                    <div class="brand-sub">Just a Peaceful home away from Home</div>
                </div>
                <div class="voucher-title">
                    <h2>Booking Voucher</h2>
                    <p>Booking ID: <strong style="color: #ffffff; font-family: monospace;">{booking_id}</strong></p>
                    <p>PNR: <strong style="color: #ffffff; font-family: monospace;">PNR-{booking_id.replace('B-', '')}</strong></p>
                </div>
            </div>
            
            <div class="content">
                <div class="property-card">
                    <h3 class="property-name">{room_name}</h3>
                    <div class="property-details">
                        📍 The House of Shalom, Puthachivayal, Marayoor, Idukki, Kerala 685620<br/>
                        📞 +91 94462 20966, +91 94469 33963 | 📧 edenspot.homestay@gmail.com
                    </div>
                    <div class="stamp-confirmed">Thank You Confirmed</div>
                </div>
                
                <table class="grid-table">
                    <tr>
                        <td>
                            <div class="grid-title">🗓️ Stay Duration ({nights} Nights)</div>
                            <div class="grid-value">
                                Check-in: {check_in}<br/>
                                <span class="grid-sub">After 12:00 PM</span>
                            </div>
                            <div class="grid-value" style="margin-top: 10px;">
                                Check-out: {check_out}<br/>
                                <span class="grid-sub">Before 11:00 AM</span>
                            </div>
                        </td>
                        <td>
                            <div class="grid-title">👥 Guest Information</div>
                            <div class="grid-value">{guest_name}</div>
                            <div class="grid-sub">
                                Email: {customer_email}<br/>
                                Phone: {phone}<br/>
                                Guests: {guests}
                            </div>
                        </td>
                    </tr>
                </table>
                
                <div class="grid-title">💳 Invoice & Itemized Billing</div>
                <table class="billing-table">
                    <thead>
                        <tr style="background-color: #fafafb; border-bottom: 2px solid #e2e8f0; font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; text-align: left;">
                            <th style="padding: 10px;">Description</th>
                            <th style="padding: 10px; text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody style="font-size: 12px; color: #334155;">
                        {bill_rows_html}
                        {discount_row_html}
                        
                        <tr class="billing-total">
                            <td style="padding: 12px 10px; font-weight: bold; color: #0b1528;">Subtotal</td>
                            <td style="padding: 12px 10px; font-weight: bold; text-align: right; color: #0b1528;">₹{int(subtotal):,}</td>
                        </tr>
                        <tr class="billing-total">
                            <td style="padding: 12px 10px; font-weight: bold; color: #64748b; font-size: 11px;">Luxury GST Tax ({int(rate) if rate.is_integer() else rate}%)</td>
                            <td style="padding: 12px 10px; font-weight: bold; text-align: right; color: #64748b; font-size: 11px;">₹{int(tax):,}</td>
                        </tr>
                        <tr class="billing-total" style="border-top: 2px double #c5a880;">
                            <td style="padding: 15px 10px; font-weight: bold; color: #0b1528; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Grand Total</td>
                            <td style="padding: 15px 10px; font-weight: bold; text-align: right; color: #c5a880; font-size: 18px; font-family: Georgia, serif;">₹{int(total):,}</td>
                        </tr>
                    </tbody>
                </table>
                
                <p style="font-size: 11px; color: #64748b; font-style: italic; margin-top: 15px; text-align: center;">
                    * The booking is confirmed. Balance or outstanding amounts are payable at check-out.
                </p>
                
                <div class="important-info">
                    <h4>Important Information</h4>
                    <ul>
                        <li>Government approved photo ID card is mandatory for all guests during check-in.</li>
                        <li>Detailed GST invoice receipts can be requested at the reception counter during check-out.</li>
                        <li>Free cancellation up to 48 hours before check-in date.</li>
                    </ul>
                </div>
            </div>
            
            <div class="footer-info">
                <p>Eden Spot Homestay, Marayoor, Idukki, Kerala, India</p>
                <p>Need support? Contact us 24/7: <a href="mailto:edenspot.homestay@gmail.com">edenspot.homestay@gmail.com</a> | 📞 +91 94462 20966, +91 94469 33963</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email_via_brevo(customer_email, guest_name, subject, html_content)

def send_cancellation_approved_email(booking, refund_tier, reason):
    customer_email = booking.get('email')
    if not customer_email:
        return False
    booking_id = booking.get('id', 'N/A')
    guest_name = booking.get('guestName', 'N/A')
    room_name = booking.get('roomName', 'N/A')
    check_in = booking.get('checkIn', 'N/A')
    check_out = booking.get('checkOut', 'N/A')
    
    subject = f"🔔 Cancellation Confirmed: Booking ID {booking_id}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Cancellation Confirmed</title>
        <style>
            body {{ font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6; padding: 20px; background-color: #f8fafc; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }}
            .header {{ background-color: #0b1528; color: #ffffff; padding: 24px; text-align: center; border-bottom: 2px solid #c5a880; }}
            .header h2 {{ margin: 0; font-family: Georgia, serif; letter-spacing: 1px; }}
            .content {{ padding: 24px; }}
            .details-box {{ background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 13px; }}
            .refund-badge {{ display: inline-block; background-color: #10b981; color: white; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 12px; }}
            .footer {{ background-color: #f8fafc; padding: 15px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Eden Spot Homestay</h2>
                <div style="font-size: 10px; color: #c5a880; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Cancellation Confirmation</div>
            </div>
            <div class="content">
                <p>Dear {guest_name},</p>
                <p>This is to confirm that your cancellation request for booking <strong>{booking_id}</strong> has been <strong>Approved</strong> by the resort management.</p>
                
                <div class="details-box">
                    <strong>Reservation Details:</strong><br/>
                    🏨 Room Category: {room_name}<br/>
                    🗓️ Check-in: {check_in}<br/>
                    🗓️ Check-out: {check_out}<br/>
                    💬 Cancellation Reason: {reason}
                </div>
                
                <p>Based on our cancellation policy, your refund status is:</p>
                <div style="text-align: center; margin: 20px 0;">
                    <span class="refund-badge">{refund_tier}</span>
                </div>
                
                <p>If you are eligible for a refund, the amount will be processed back to your original payment method within 5-7 business days. For any questions, please contact our support desk.</p>
                
                <p>Thank you, and we hope to welcome you to Eden Spot Homestay in the future.</p>
            </div>
            <div class="footer">
                Eden Spot Homestay, Marayoor, Idukki, Kerala, India<br/>
                Reservations: edenspot.homestay@gmail.com | 📞 +91 94462 20966, +91 94469 33963
            </div>
        </div>
    </body>
    </html>
    """
    return send_email_via_brevo(customer_email, guest_name, subject, html_content)

def send_cancellation_rejected_email(booking, reason):
    customer_email = booking.get('email')
    if not customer_email:
        return False
    booking_id = booking.get('id', 'N/A')
    guest_name = booking.get('guestName', 'N/A')
    room_name = booking.get('roomName', 'N/A')
    check_in = booking.get('checkIn', 'N/A')
    check_out = booking.get('checkOut', 'N/A')
    
    subject = f"🔔 Cancellation Request Update: Booking ID {booking_id}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Cancellation Request Update</title>
        <style>
            body {{ font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6; padding: 20px; background-color: #f8fafc; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }}
            .header {{ background-color: #0b1528; color: #ffffff; padding: 24px; text-align: center; border-bottom: 2px solid #c5a880; }}
            .header h2 {{ margin: 0; font-family: Georgia, serif; letter-spacing: 1px; }}
            .content {{ padding: 24px; }}
            .details-box {{ background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 13px; }}
            .footer {{ background-color: #f8fafc; padding: 15px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Eden Spot Homestay</h2>
                <div style="font-size: 10px; color: #c5a880; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Cancellation Request Review</div>
            </div>
            <div class="content">
                <p>Dear {guest_name},</p>
                <p>We have reviewed your request to cancel your booking <strong>{booking_id}</strong>.</p>
                
                <p>Please be informed that your cancellation request has been <strong>Rejected</strong>, and your booking remains active.</p>
                
                <div class="details-box">
                    <strong>Reservation Details:</strong><br/>
                    🏨 Room Category: {room_name}<br/>
                    🗓️ Check-in: {check_in}<br/>
                    🗓️ Check-out: {check_out}<br/>
                    📌 Status: <span style="color: #10b981; font-weight: bold;">Confirmed &amp; Active</span>
                </div>
                
                <p>If you have any questions or need to make adjustments to your reservation dates, please feel free to reach out to our guest relationship desk directly.</p>
                
                <p>We look forward to welcoming you to Eden Spot Homestay.</p>
            </div>
            <div class="footer">
                Eden Spot Homestay, Marayoor, Idukki, Kerala, India<br/>
                Reservations: edenspot.homestay@gmail.com | 📞 +91 94462 20966, +91 94469 33963
            </div>
        </div>
    </body>
    </html>
    """
    return send_email_via_brevo(customer_email, guest_name, subject, html_content)

SPREADSHEET_ID = os.getenv("SPREADSHEET_ID")
CREDENTIALS_FILE = os.path.join(os.path.dirname(__file__), 'credentials', 'google-credentials.json')
if not os.path.exists(CREDENTIALS_FILE):
    CREDENTIALS_FILE = os.path.join(os.path.dirname(__file__), 'google-credentials.json')

# Define the scopes
SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
]

_cached_sheet = None
_last_auth_time = 0
_cached_worksheets = {}

def get_sheet():
    global _cached_sheet, _last_auth_time, _cached_worksheets
    current_time = time.time()
    # Reuse cached sheet if authenticated within the last 15 minutes
    if _cached_sheet and (current_time - _last_auth_time < 900):
        return _cached_sheet
    try:
        creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=SCOPES)
        client = gspread.authorize(creds)
        sheet = client.open_by_key(SPREADSHEET_ID)
        _cached_sheet = sheet
        _last_auth_time = current_time
        # Clear worksheet cache on re-authentication to ensure freshness
        _cached_worksheets = {}
        return sheet
    except Exception as e:
        print(f"Error authenticating to Google Sheets: {e}")
        if _cached_sheet:
            return _cached_sheet
        return None

def get_worksheet_by_name(sheet, name):
    global _cached_worksheets
    if name in _cached_worksheets:
        return _cached_worksheets[name]
        
    # Try exact match first
    try:
        ws = sheet.worksheet(name)
        _cached_worksheets[name] = ws
        return ws
    except gspread.exceptions.WorksheetNotFound:
        pass
    
    # Try normalized match (case-insensitive and trimmed)
    normalized_name = name.strip().lower()
    worksheets = sheet.worksheets()
    for ws in worksheets:
        ws_title = ws.title
        _cached_worksheets[ws_title] = ws
        if ws_title.strip().lower() == normalized_name:
            _cached_worksheets[name] = ws
            return ws
            
    raise gspread.exceptions.WorksheetNotFound(f"Worksheet '{name}' not found.")

def col_letter(col_num):
    string_val = ""
    while col_num > 0:
        col_num, remainder = divmod(col_num - 1, 26)
        string_val = chr(65 + remainder) + string_val
    return string_val

def save_image_to_db(base64_str):
    try:
        sheet = get_sheet()
        if not sheet:
            print("Failed to connect to sheet for image upload")
            return None
        
        try:
            worksheet = get_worksheet_by_name(sheet, 'UploadedImages')
        except gspread.exceptions.WorksheetNotFound:
            # Create the worksheet if it doesn't exist
            print("Creating UploadedImages worksheet...")
            worksheet = sheet.add_worksheet(title='UploadedImages', rows="10000", cols="3")
            # Set headers
            worksheet.update(values=[["image_id", "chunk_index", "data"]], range_name="A1:C1")
            
        image_id = f"db_{uuid.uuid4().hex}"
        
        # Split base64_str into chunks of 45000 characters
        chunk_size = 45000
        chunks = [base64_str[i:i+chunk_size] for i in range(0, len(base64_str), chunk_size)]
        
        rows = []
        for index, chunk in enumerate(chunks):
            rows.append([image_id, index, chunk])
            
        worksheet.append_rows(rows)
        return f"/uploads/{image_id}"
    except Exception as e:
        print(f"Error saving image to DB: {e}")
        return None

def save_base64_images(data):
    """
    Recursively scans the input data (dict, list, or string) for base64 data URLs.
    Saves them to the database (UploadedImages sheet) with a fallback to local folder,
    and returns the data with base64 URLs replaced by relative paths.
    """
    public_uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public', 'uploads'))
    if not os.path.exists(public_uploads_dir):
        os.makedirs(public_uploads_dir)

    if isinstance(data, dict):
        return {k: save_base64_images(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [save_base64_images(item) for item in data]
    elif isinstance(data, str):
        if data.startswith("data:image/"):
            # First attempt to save persistently in Google Sheets
            db_path = save_image_to_db(data)
            if db_path:
                return db_path
            
            # Fallback to local file upload if DB save failed
            try:
                # Format: data:image/png;base64,iVBORw0KGgoAAAANS...
                header, encoded = data.split(",", 1)
                ext = "png"
                if "jpeg" in header or "jpg" in header:
                    ext = "jpg"
                elif "webp" in header:
                    ext = "webp"
                elif "gif" in header:
                    ext = "gif"
                
                filename = f"upload_{uuid.uuid4().hex}.{ext}"
                filepath = os.path.join(public_uploads_dir, filename)
                
                with open(filepath, "wb") as f:
                    f.write(base64.b64decode(encoded))
                
                return f"/uploads/{filename}"
            except Exception as e:
                print(f"Error saving base64 image fallback: {e}")
                return data
        elif (data.startswith("[") and data.endswith("]")) or (data.startswith("{") and data.endswith("}")):
            try:
                parsed = json.loads(data)
                processed = save_base64_images(parsed)
                return json.dumps(processed)
            except Exception:
                return data
        else:
            return data
    else:
        return data

# Simple in-memory cache for database images
IMAGE_CACHE = {}

@app.route('/', methods=['GET'])
def index():
    return jsonify({"status": "active", "message": "Eden Spot Homestay API is running successfully!"}), 200

@app.route('/uploads/<path:filename>', methods=['GET'])
def serve_uploads(filename):
    if filename.startswith("db_"):
        global IMAGE_CACHE
        if filename in IMAGE_CACHE:
            cached = IMAGE_CACHE[filename]
            return send_file(
                BytesIO(cached["bytes"]),
                mimetype=cached["mime_type"],
                as_attachment=False
            )
            
        try:
            sheet = get_sheet()
            if not sheet:
                return "Failed to connect to database", 500
                
            worksheet = get_worksheet_by_name(sheet, 'UploadedImages')
            records = worksheet.get_all_records()
            
            # Filter and sort chunks
            chunks = [r for r in records if str(r.get('image_id', '')) == filename]
            if not chunks:
                return "Image not found", 404
                
            chunks.sort(key=lambda x: int(x.get('chunk_index', 0)))
            
            # Reconstruct base64
            full_base64 = "".join([str(c.get('data', '')) for c in chunks])
            
            # Parse mime type and base64 encoded data
            if "," in full_base64:
                header, encoded = full_base64.split(",", 1)
                mime_type = "image/png"
                if "image/" in header:
                    parts = header.split(";")
                    for p in parts:
                        if p.startswith("data:image/"):
                            mime_type = p.replace("data:", "")
                            
                image_bytes = base64.b64decode(encoded)
            else:
                mime_type = "image/png"
                image_bytes = base64.b64decode(full_base64)
                
            # Cache the result
            IMAGE_CACHE[filename] = {
                "mime_type": mime_type,
                "bytes": image_bytes
            }
            
            return send_file(
                BytesIO(image_bytes),
                mimetype=mime_type,
                as_attachment=False
            )
        except Exception as e:
            print(f"Error serving DB image {filename}: {e}")
            return "Internal Server Error", 500

    uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public', 'uploads'))
    if not os.path.exists(uploads_dir):
        uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'uploads'))
    return send_from_directory(uploads_dir, filename)

@app.route('/api/<table>', methods=['GET'])
def get_records(table):
    sheet = get_sheet()
    if not sheet: return jsonify({"error": "Failed to connect to DB"}), 500
    try:
        worksheet = get_worksheet_by_name(sheet, table)
        records = worksheet.get_all_records()
        return jsonify(records), 200
    except gspread.exceptions.WorksheetNotFound:
        return jsonify({"error": f"Table '{table}' not found."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/<table>', methods=['POST'])
def add_record(table):
    sheet = get_sheet()
    if not sheet: return jsonify({"error": "Failed to connect to DB"}), 500
    try:
        data = request.json
        data = save_base64_images(data)
        worksheet = get_worksheet_by_name(sheet, table)
        headers = worksheet.row_values(1)
        row = [data.get(header, "") for header in headers]
        worksheet.append_row(row)
        
        if table.strip().lower() == 'bookings':
            try:
                send_booking_request_email_to_handler(data)
            except Exception as mail_err:
                print(f"Failed to send booking request email: {mail_err}")

        return jsonify({"message": "Record created successfully", "data": data}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/<table>/<id>', methods=['PUT'])
def update_record(table, id):
    sheet = get_sheet()
    if not sheet: return jsonify({"error": "Failed to connect to DB"}), 500
    try:
        data = request.json
        data = save_base64_images(data)
        worksheet = get_worksheet_by_name(sheet, table)
        records = worksheet.get_all_records()
        headers = worksheet.row_values(1)
        
        row_index = -1
        current_record = None
        for i, record in enumerate(records):
            if str(record.get('id', '')) == str(id) or str(record.get('key', '')) == str(id):
                row_index = i + 2
                current_record = record
                break
                
        if row_index == -1:
            # Perform upsert by constructing a new record and appending it
            current_record = {}
            if 'id' in headers:
                current_record['id'] = id
            elif 'key' in headers:
                current_record['key'] = id
            
            for k, v in data.items():
                current_record[k] = v
            
            row_values = [current_record.get(h, "") for h in headers]
            worksheet.append_row(row_values)
            return jsonify({"message": "Record created successfully (upsert)", "data": current_record}), 201
            
        is_bookings_table = table.strip().lower() == 'bookings'
        was_already_confirmed = (str(current_record.get('status', '')).strip().lower() == 'confirmed') if current_record else False
        was_already_checked_out = (str(current_record.get('status', '')).strip().lower() == 'checked out') if current_record else False

        for k, v in data.items():
            current_record[k] = v
            
        row_values = [current_record.get(h, "") for h in headers]
        
        range_str = f"A{row_index}:{col_letter(len(headers))}{row_index}"
        worksheet.update(values=[row_values], range_name=range_str)
        
        if is_bookings_table and str(data.get('status', '')).strip().lower() == 'confirmed' and not was_already_confirmed:
            try:
                send_booking_confirm_email_to_customer(current_record)
            except Exception as mail_err:
                print(f"Failed to send booking confirmation email: {mail_err}")
                
        if is_bookings_table and str(data.get('status', '')).strip().lower() == 'checked out' and not was_already_checked_out:
            try:
                send_checkout_feedback_email(current_record)
            except Exception as mail_err:
                print(f"Failed to send checkout feedback email: {mail_err}")
        
        return jsonify({"message": "Record updated successfully", "data": current_record}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/<table>/<id>', methods=['DELETE'])
def delete_record(table, id):
    sheet = get_sheet()
    if not sheet: return jsonify({"error": "Failed to connect to DB"}), 500
    try:
        worksheet = get_worksheet_by_name(sheet, table)
        records = worksheet.get_all_records()
        
        row_index = -1
        for i, record in enumerate(records):
            if str(record.get('id', '')) == str(id) or str(record.get('key', '')) == str(id):
                row_index = i + 2
                break
                
        if row_index == -1:
            return jsonify({"error": "Record not found."}), 404
            
        worksheet.delete_rows(row_index)
        return jsonify({"message": "Record deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400
        
        handler_email = os.getenv("HANDLER_EMAIL", "").strip().lower()
        effective_username = str(username).strip().lower()
        
        # If user enters the handler email, we map it to the admin username 'gokul'
        if handler_email and effective_username == handler_email:
            effective_username = "gokul"
        
        # Local fast check for gokul / gokul@45 to bypass Google Sheets API latency
        if effective_username == "gokul" and str(password) == "gokul@45":
            return jsonify({"message": "Login successful", "user": {"username": "gokul"}}), 200

        sheet = get_sheet()
        if not sheet: return jsonify({"error": "Failed to connect to DB"}), 500
        
        worksheet = get_worksheet_by_name(sheet, 'Admins')
        records = worksheet.get_all_records()
        for r in records:
            db_user = str(r.get('username')).strip().lower()
            if db_user == effective_username and str(r.get('password')) == str(password):
                return jsonify({"message": "Login successful", "user": {"username": db_user}}), 200
        return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Temporary memory storage for reset OTPs: { email: {"otp": otp, "expires_at": timestamp, "verified": bool} }
otp_store = {}

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.json
        email = data.get('email', '').strip().lower()
        if not email:
            return jsonify({"error": "Email is required"}), 400
            
        handler_email = os.getenv("HANDLER_EMAIL", "").strip().lower()
        if not handler_email:
            return jsonify({"error": "System handler email is not configured"}), 500
            
        if email != handler_email:
            return jsonify({"error": "The entered email does not match the registered handler email."}), 400
            
        # Generate 6-digit numeric OTP
        otp = str(random.randint(100000, 999999))
        otp_store[email] = {
            "otp": otp,
            "expires_at": time.time() + 300, # 5 minutes expiry
            "verified": False
        }
        
        # Send OTP via Brevo
        subject = "Eden Spot Homestay - Password Reset OTP"
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                <div style="background: #003580; color: #ffffff; padding: 24px; text-align: center;">
                    <h2 style="margin: 0; font-family: Georgia, serif; letter-spacing: 2px;">{os.getenv("BREVO_SENDER_NAME", "EDEN SPOT HOMESTAY")}</h2>
                    <p style="margin: 5px 0 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #e2e8f0;">Security Center</p>
                </div>
                <div style="padding: 24px; background: #ffffff;">
                    <p>Dear Administrator,</p>
                    <p>We received a request to reset your admin credentials. Please use the following One-Time Passcode (OTP) to complete the verification process:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-family: monospace; font-size: 32px; font-weight: bold; color: #b5945b; letter-spacing: 8px; border: 2px dashed #b5945b; padding: 10px 30px; border-radius: 8px; background: #fafaf9;">
                            {otp}
                        </span>
                    </div>
                    <p style="color: #64748b; font-size: 12px;">This OTP is valid for <strong>5 minutes</strong>. If you did not initiate this request, please ignore this email or secure your portal credentials immediately.</p>
                </div>
                <div style="background: #f8fafc; padding: 15px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
                    &copy; 2026 Eden Spot Homestay, Marayoor, Kerala. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        """
        
        send_email_via_brevo(email, "Resort Handler", subject, html_content)
        return jsonify({"message": "OTP has been successfully sent to the registered handler email."}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    """
    Step 2: Verify the OTP. On success, marks the session as verified and returns
    the current admin username from the database so the frontend can prefill it.
    """
    try:
        data = request.json
        email = data.get('email', '').strip().lower()
        otp_input = data.get('otp', '').strip()

        if not email or not otp_input:
            return jsonify({"error": "Email and OTP are required"}), 400

        handler_email = os.getenv("HANDLER_EMAIL", "").strip().lower()
        if email != handler_email:
            return jsonify({"error": "Invalid email address"}), 400

        stored_data = otp_store.get(email)
        if not stored_data:
            return jsonify({"error": "No OTP request found. Please request a new OTP."}), 400

        if time.time() > stored_data["expires_at"]:
            otp_store.pop(email, None)
            return jsonify({"error": "The OTP has expired. Please request a new one."}), 400

        if stored_data["otp"] != otp_input:
            return jsonify({"error": "Invalid OTP code. Please check and try again."}), 400

        # OTP is valid — mark as verified, extend window by 10 minutes for reset step
        otp_store[email]["verified"] = True
        otp_store[email]["expires_at"] = time.time() + 600

        # Fetch current username from database to prefill on the client
        current_username = "gokul"  # fallback default
        try:
            sheet = get_sheet()
            if sheet:
                worksheet = get_worksheet_by_name(sheet, 'Admins')
                records = worksheet.get_all_records()
                if records:
                    current_username = str(records[0].get('username', 'gokul'))
        except Exception:
            pass  # Non-critical; fallback to default

        return jsonify({
            "message": "OTP verified successfully!",
            "current_username": current_username
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    """
    Step 3: Reset credentials. Requires a verified OTP session.
    Accepts new_username and new_password; updates both in the Admins sheet.
    """
    try:
        data = request.json
        email = data.get('email', '').strip().lower()
        new_username = data.get('new_username', '').strip()
        new_password = data.get('new_password', '')

        if not email or not new_username or not new_password:
            return jsonify({"error": "Email, new username, and new password are all required"}), 400

        handler_email = os.getenv("HANDLER_EMAIL", "").strip().lower()
        if email != handler_email:
            return jsonify({"error": "Invalid email address"}), 400

        # Require verified OTP session
        stored_data = otp_store.get(email)
        if not stored_data or not stored_data.get("verified"):
            return jsonify({"error": "OTP has not been verified. Please complete OTP verification first."}), 403

        if time.time() > stored_data["expires_at"]:
            otp_store.pop(email, None)
            return jsonify({"error": "Session expired. Please restart the password reset process."}), 400

        # Clear the OTP session
        otp_store.pop(email, None)

        # Connect to DB and update the sheet
        sheet = get_sheet()
        if not sheet:
            return jsonify({"error": "Failed to connect to DB"}), 500

        worksheet = get_worksheet_by_name(sheet, 'Admins')
        records = worksheet.get_all_records()
        headers = worksheet.row_values(1)

        row_index = -1
        admin_record = None
        # Find admin_1 record or fall back to first record
        for i, record in enumerate(records):
            if str(record.get('id', '')).strip() == 'admin_1' or i == 0:
                row_index = i + 2
                admin_record = dict(record)
                break

        if row_index == -1:
            # Create a new admin record if none exists
            admin_record = {"id": "admin_1", "username": new_username, "password": new_password}
            row_values = [admin_record.get(h, "") for h in headers]
            worksheet.append_row(row_values)
        else:
            admin_record["username"] = new_username
            admin_record["password"] = new_password
            row_values = [admin_record.get(h, "") for h in headers]
            range_str = f"A{row_index}:{col_letter(len(headers))}{row_index}"
            worksheet.update(values=[row_values], range_name=range_str)

        return jsonify({"message": "Credentials updated successfully!", "username": new_username}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/bookings/<id>/send-final-bill', methods=['POST'])
def send_final_bill_api(id):
    sheet = get_sheet()
    if not sheet: return jsonify({"error": "Failed to connect to DB"}), 500
    try:
        worksheet = get_worksheet_by_name(sheet, 'bookings')
        records = worksheet.get_all_records()
        
        booking = None
        for r in records:
            if str(r.get('id', '')) == str(id) or str(r.get('key', '')) == str(id):
                booking = r
                break
                
        if not booking:
            return jsonify({"error": "Booking not found"}), 404
            
        success = send_final_bill_email_to_customer(booking)
        if success:
            return jsonify({"message": "Final bill email sent successfully"}), 200
        else:
            return jsonify({"error": "Failed to send email. Check backend logs."}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/customers/register-login', methods=['POST'])
def customer_register_login():
    sheet = get_sheet()
    if not sheet: return jsonify({"error": "Failed to connect to DB"}), 500
    try:
        data = request.json
        name = str(data.get('name', '')).strip()
        email = str(data.get('email', '')).strip().lower()
        phone = str(data.get('phone', '')).strip()
        
        if not name or not email or not phone:
            return jsonify({"error": "Name, email, and phone/mobile number are required"}), 400
            
        worksheet = get_worksheet_by_name(sheet, 'Customers')
        records = worksheet.get_all_records()
        
        # Check if email already exists
        existing_cust = None
        for r in records:
            if str(r.get('email', '')).strip().lower() == email:
                existing_cust = r
                break
                
        if existing_cust:
            # Login successful
            return jsonify({"message": "Login successful", "customer": existing_cust}), 200
            
        # Create new customer ID (e.g. CUST-1042)
        import random
        cust_id = f"CUST-{random.randint(1000, 9999)}"
        # Ensure it's unique
        ids = [str(r.get('id', '')) for r in records]
        while cust_id in ids:
            cust_id = f"CUST-{random.randint(1000, 9999)}"
            
        new_row = {
            "id": cust_id,
            "name": name,
            "email": email,
            "phone": phone,
            "dateCreated": time.strftime("%Y-%m-%d")
        }
        
        headers = worksheet.row_values(1)
        row_values = [new_row.get(h, "") for h in headers]
        worksheet.append_row(row_values)
        
        return jsonify({"message": "Registration successful", "customer": new_row}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/customers/bookings', methods=['GET'])
def get_customer_bookings():
    sheet = get_sheet()
    if not sheet: return jsonify({"error": "Failed to connect to DB"}), 500
    try:
        email = str(request.args.get('email', '')).strip().lower()
        phone = str(request.args.get('phone', '')).strip()
        
        if not email:
            return jsonify({"error": "Email is required"}), 400
            
        worksheet = get_worksheet_by_name(sheet, 'bookings')
        records = worksheet.get_all_records()
        
        cust_bookings = []
        for r in records:
            # Match by email
            if str(r.get('email', '')).strip().lower() == email:
                cust_bookings.append(r)
                
        return jsonify(cust_bookings), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/bookings/<id>/request-cancellation', methods=['POST'])
def request_cancellation_api(id):
    sheet = get_sheet()
    if not sheet: return jsonify({"error": "Failed to connect to DB"}), 500
    try:
        data = request.json
        reason = str(data.get('reason', '')).strip()
        if not reason:
            return jsonify({"error": "Reason for cancellation is required"}), 400
            
        worksheet = get_worksheet_by_name(sheet, 'bookings')
        records = worksheet.get_all_records()
        headers = worksheet.row_values(1)
        
        row_index = -1
        booking = None
        for i, r in enumerate(records):
            if str(r.get('id', '')) == str(id) or str(r.get('key', '')) == str(id):
                row_index = i + 2
                booking = r
                break
                
        if row_index == -1:
            return jsonify({"error": "Booking not found"}), 404
            
        check_in_date = booking.get('checkIn', '')
        
        # Calculate refund tier
        from datetime import datetime
        refund_tier = "No Refund"
        try:
            check_in = datetime.strptime(str(check_in_date).strip(), "%Y-%m-%d")
            now = datetime.now()
            diff = check_in - now
            hours_left = diff.total_seconds() / 3600.0
            
            if hours_left >= 48:
                refund_tier = "100% Refund"
            elif hours_left >= 24:
                refund_tier = "50% Refund"
            else:
                refund_tier = "No Refund"
        except Exception as e:
            print(f"Error calculating refund in route: {e}")
            refund_tier = "No Refund"
            
        # Structure cancellation JSON metadata and append to specialRequests
        cancel_data = {
            "cancellationReason": reason,
            "refundTier": refund_tier,
            "requestDate": time.strftime("%Y-%m-%d")
        }
        
        orig_req = str(booking.get('specialRequests', '')).split('||CANCEL_JSON||')[0].strip()
        updated_special_requests = (orig_req + ' ' if orig_req else '') + '||CANCEL_JSON||' + json.dumps(cancel_data)
        
        booking['specialRequests'] = updated_special_requests
        booking['status'] = 'Cancellation Requested'
        
        row_values = [booking.get(h, "") for h in headers]
        range_str = f"A{row_index}:{col_letter(len(headers))}{row_index}"
        worksheet.update(values=[row_values], range_name=range_str)
        
        return jsonify({"message": "Cancellation request submitted successfully", "booking": booking}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/bookings/<id>/approve-cancellation', methods=['POST'])
def approve_cancellation_api(id):
    sheet = get_sheet()
    if not sheet: return jsonify({"error": "Failed to connect to DB"}), 500
    try:
        worksheet = get_worksheet_by_name(sheet, 'bookings')
        records = worksheet.get_all_records()
        headers = worksheet.row_values(1)
        
        row_index = -1
        booking = None
        for i, r in enumerate(records):
            if str(r.get('id', '')) == str(id) or str(r.get('key', '')) == str(id):
                row_index = i + 2
                booking = r
                break
                
        if row_index == -1:
            return jsonify({"error": "Booking not found"}), 404
            
        # Parse cancel reason and refund tier from specialRequests
        reason = "Guest Request"
        refund_tier = "No Refund"
        special_req = str(booking.get('specialRequests', ''))
        if '||CANCEL_JSON||' in special_req:
            try:
                parts = special_req.split('||CANCEL_JSON||')
                cancel_info = json.loads(parts[1].strip())
                reason = cancel_info.get('cancellationReason', 'Guest Request')
                refund_tier = cancel_info.get('refundTier', 'No Refund')
            except Exception:
                pass
                
        # Set status to Cancelled
        booking['status'] = 'Cancelled'
        
        row_values = [booking.get(h, "") for h in headers]
        range_str = f"A{row_index}:{col_letter(len(headers))}{row_index}"
        worksheet.update(values=[row_values], range_name=range_str)
        
        # Send confirmation email
        try:
            send_cancellation_approved_email(booking, refund_tier, reason)
        except Exception as mail_err:
            print(f"Failed to send cancellation confirmation email: {mail_err}")
            
        return jsonify({"message": "Cancellation approved and email sent", "booking": booking}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/bookings/<id>/reject-cancellation', methods=['POST'])
def reject_cancellation_api(id):
    sheet = get_sheet()
    if not sheet: return jsonify({"error": "Failed to connect to DB"}), 500
    try:
        worksheet = get_worksheet_by_name(sheet, 'bookings')
        records = worksheet.get_all_records()
        headers = worksheet.row_values(1)
        
        row_index = -1
        booking = None
        for i, r in enumerate(records):
            if str(r.get('id', '')) == str(id) or str(r.get('key', '')) == str(id):
                row_index = i + 2
                booking = r
                break
                
        if row_index == -1:
            return jsonify({"error": "Booking not found"}), 404
            
        # Parse cancel reason from specialRequests
        reason = "Guest Request"
        special_req = str(booking.get('specialRequests', ''))
        if '||CANCEL_JSON||' in special_req:
            try:
                parts = special_req.split('||CANCEL_JSON||')
                cancel_info = json.loads(parts[1].strip())
                reason = cancel_info.get('cancellationReason', 'Guest Request')
            except Exception:
                pass
                
        # Restore status to Confirmed
        booking['status'] = 'Confirmed'
        
        # Remove ||CANCEL_JSON|| block from specialRequests to restore original requests state
        orig_req = special_req.split('||CANCEL_JSON||')[0].strip()
        booking['specialRequests'] = orig_req
        
        row_values = [booking.get(h, "") for h in headers]
        range_str = f"A{row_index}:{col_letter(len(headers))}{row_index}"
        worksheet.update(values=[row_values], range_name=range_str)
        
        # Send rejection email
        try:
            send_cancellation_rejected_email(booking, reason)
        except Exception as mail_err:
            print(f"Failed to send cancellation rejection email: {mail_err}")
            
        return jsonify({"message": "Cancellation request rejected and email sent", "booking": booking}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Flask Backend...")
    app.run(debug=True, port=5000)
