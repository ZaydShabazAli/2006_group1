from twilio.rest import Client
import os
from dotenv import load_dotenv

load_dotenv()

account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
twilio_number = os.getenv("TWILIO_PHONE_NUMBER")

client = Client(account_sid, auth_token)

def send_sms(to_number: str, message: str) -> str:
    try:
        message = client.messages.create(
            body=message,
            from_=twilio_number,
            to=to_number
        )
        print(f"✅ SMS sent to {to_number}")
        print(f"📬 Message SID: {message.sid}")
        print(f"📦 Message status: {message.status}")
        return f"Message sent. SID: {message.sid}"
    except Exception as e:
        print(f"❌ Error sending SMS: {str(e)}")
        return f"Error sending SMS: {str(e)}"
