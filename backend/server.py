from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone
import requests

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# --- CUSTOMER MODELS ---
class OrderItem(BaseModel):
    name: str = "Unbekannter Artikel"
    quantity: int = 1
    price: float = 0.0
    variant_name: str = None

class OrderNotification(BaseModel):
    order_id: str
    customer_name: str = "Gast"
    customer_email: str
    customer_phone: str = ""
    address: str = ""
    city: str = ""
    zip: str = ""
    country: str = "DE"
    payment_method: str = "Unbekannt"
    total_amount: float = 0.0
    items: List[OrderItem] = []

# --- STATUS MODELS ---
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# --- ROUTES ---

@api_router.get("/")
async def root():
    return {"message": "Electrive API is running"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

@api_router.post("/notify-order")
async def notify_order(order: dict):
    resend_api_key = os.environ.get('RESEND_API_KEY', '').strip()
    support_email = os.environ.get('SUPPORT_EMAIL', 'kerem_aydin@aol.com').strip()
    
    if not resend_api_key:
        logger.error("❌ Resend API Key is missing in .env")
        return {"status": "error", "message": "Mailer setup incomplete"}

    # Extract data with robust fallbacks
    order_id = str(order.get('order_id', 'Unbekannt'))
    customer_name = str(order.get('customer_name', 'Gast'))
    customer_email = str(order.get('customer_email', 'k.a@aol.com'))
    customer_phone = str(order.get('customer_phone', 'N/A'))
    address = str(order.get('address', ''))
    city = str(order.get('city', ''))
    zip_code = str(order.get('zip', ''))
    country = str(order.get('country', 'DE'))
    payment_method = str(order.get('payment_method', 'Vorkasse'))
    total_amount = float(order.get('total_amount', 0.0))
    items = order.get('items', [])

    # Construct HTML Table for Products
    items_html = ""
    for item in items:
        name = item.get('name', 'Produkt')
        qty = item.get('quantity', 1)
        price = item.get('price', 0.0)
        variant = item.get('variant_name')
        variant_info = f"<br/><small style='color:#666'>Variante: {variant}</small>" if variant else ""
        items_html += f"""
            <tr>
                <td style='padding:12px; border-bottom:1px solid #eee;'>
                    <strong>{name}</strong>{variant_info}
                </td>
                <td style='padding:12px; border-bottom:1px solid #eee; text-align:center;'>{qty}</td>
                <td style='padding:12px; border-bottom:1px solid #eee; text-align:right;'>{float(price):,.2f} &euro;</td>
            </tr>
        """

    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #dc2626; text-align: center; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">NEUE BESTELLUNG #{order_id[:8].upper()}</h2>
        
        <p style="text-align: center; color: #666;">Ein neuer Kauf wurde auf der Website getätigt.</p>
        
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #9ca3af;">Kundendaten</h3>
            <p><strong>Name:</strong> {customer_name}</p>
            <p><strong>E-Mail:</strong> {customer_email}</p>
            <p><strong>Telefon:</strong> {customer_phone}</p>
            <p><strong>Adresse:</strong> {address}, {zip_code} {city}, {country}</p>
        </div>

        <h3 style="font-size: 14px; text-transform: uppercase; color: #9ca3af; margin-bottom: 10px;">Bestellte Artikel</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f3f4f6;">
                    <th style="padding:12px; text-align:left; font-size:12px;">ARTIKEL</th>
                    <th style="padding:12px; text-align:center; font-size:12px;">MENGE</th>
                    <th style="padding:12px; text-align:right; font-size:12px;">PREIS</th>
                </tr>
            </thead>
            <tbody>
                {items_html}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="2" style="padding:20px 12px; text-align:right; font-weight:bold;">GESAMTSUMME:</td>
                    <td style="padding:20px 12px; text-align:right; font-weight:bold; font-size:18px; color: #dc2626;">{total_amount:,.2f} &euro;</td>
                </tr>
            </tfoot>
        </table>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
            <p><strong>Zahlungsart:</strong> {payment_method.upper()}</p>
            <p>Sipariş Tarihi: {datetime.now().strftime('%d.%m.%Y %H:%M')}</p>
        </div>
    </div>
    """

    try:
        response = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {resend_api_key}",
                "Content-Type": "application/json"
            },
            json={
                "from": "onboarding@resend.dev",
                "to": [support_email],
                "subject": f"NEUE BESTELLUNG - #{order_id[:8].upper()}",
                "html": html_content
            }
        )
        response.raise_for_status()
        logger.info(f"✅ Email notification sent to admin for Order {order_id}")
        return {"status": "success", "message": "Admin notification sent"}
    except Exception as e:
        logger.error(f"❌ Failed to send email via Resend: {str(e)}")
        return {"status": "error", "message": str(e)}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()